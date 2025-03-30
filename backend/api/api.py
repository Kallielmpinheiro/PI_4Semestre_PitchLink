from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.models import SocialToken
from django.contrib.auth import get_user_model
from ninja.security import django_auth
from api.schemas import ErrorResponse
from django.http import JsonResponse
from datetime import datetime
from ninja import NinjaAPI
from typing import Any
import requests
import pytz
from api.schemas import SaveReq
from api.models import User
import logging
api = NinjaAPI()

@api.get("/check-auth", auth=django_auth)
def check_auth(request):
    user = request.user
    if user.is_authenticated:
        social_token = None
        try:
            social_token = SocialToken.objects.get(account__user=user, app__provider='linkedin')
        except SocialToken.DoesNotExist:
            social_token = None
        
        if social_token:
            return JsonResponse({
                "authenticated": True,
                "username": user.username,
                "linkedin_token": social_token.token 
            })
        else:
            return JsonResponse({"authenticated": True, "username": user.username, "linkedin_token": None})
    else:
        return JsonResponse({"authenticated": False})

@api.post("/full-profile")
def register(request, payload: SaveReq):
    
    # TODO: Upload img base64
    
    
    if not User.objects.get(email=payload.email):
        account = User(
            first_name=payload.first_name,
            last_name=payload.last_name,
            email=payload.email,
            profile_picture=payload.profile_picture,
            data_nasc=payload.data_nasc,
            categories=payload.categories,            
        )
        account.save()
        
        return 200, {"message": "Usuário registrado com sucesso!"}
    
    if User.objects.get(email=payload.email):

        account = User.objects.get(email=payload.email)
        
        account.first_name = payload.first_name
        account.last_name = payload.last_name
        account.profile_picture = payload.profile_picture
        account.data_nasc = payload.data_nasc
        account.categories = payload.categories
        account.save()
        
        return 200, {"message": "Perfil atualizado com sucesso!"}
        
@api.get("/users")
def list_users(request):
    User = get_user_model()
    users = User.objects.filter(is_active=True, is_staff=False)
    
    user_list = []
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
            'last_login': user.last_login
        }
        user_list.append(user_data)
    
    return user_list

@api.get("/obter-perfil-social-usuario", auth=django_auth, response={200: Any, 404: ErrorResponse})
def obter_perfil_social_usuario(request):

    if not request.user.is_authenticated:
        return 404, {"message": "Usuário não autenticado"}

    dados_usuario = {
        "user_id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "provedores": {}
    }

    contas_sociais = SocialAccount.objects.filter(user=request.user)

    for conta in contas_sociais:
        provedor = conta.provider
        dados_usuario["provedores"][provedor] = conta.extra_data

        if provedor == "linkedin-server":
            try:
                token_obj = conta.socialtoken_set.first()

                if not token_obj:
                    return 404, {"message": "Token não encontrado"}

                token_acesso = token_obj.token

                if hasattr(token_obj, "expires_at") and token_obj.expires_at < datetime.now(pytz.UTC):
                    dados_usuario["provedores"][provedor]["erro"] = "Token expirado"
                    continue

                headers = {
                    "Authorization": f"Bearer {token_acesso}",
                    "Content-Type": "application/json"
                }

                def buscar_dados_linkedin(url):
                    try:
                        resposta = requests.get(url, headers=headers)
                        if resposta.status_code == 200:
                            return resposta.json()
                        else:
                         
                            return 404, {"message": "Erro ao obter dados do LinkedIn"}

                    except requests.exceptions.RequestException:
                        return 404, {"message": "Erro na requisição ao LinkedIn"}

                dados_linkedin = buscar_dados_linkedin("https://api.linkedin.com/v2/userinfo")

                if isinstance(dados_linkedin, tuple) and dados_linkedin[0] == 404:
                    return dados_linkedin

                dados_usuario["provedores"][provedor]["perfil_linkedin"] = dados_linkedin

                if "picture" in dados_linkedin:
                    dados_usuario["provedores"][provedor]["url_imagem_perfil"] = dados_linkedin["picture"]

            except Exception:
                return 404, {"message": "Erro inesperado no processamento"}

    return 200, dados_usuario

