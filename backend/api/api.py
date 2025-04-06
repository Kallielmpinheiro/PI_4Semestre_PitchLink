from allauth.socialaccount.models import SocialAccount
from api.schemas import ErrorResponse, SuccessResponse
from api.schemas import SaveReq, UserReq
from ninja.security import django_auth
from django.contrib.auth import logout
from datetime import datetime
from api.models import User
from ninja import NinjaAPI
from typing import Any
import requests
import pytz


api = NinjaAPI()

@api.get("/check-auth", response={200: SuccessResponse, 401: ErrorResponse, 404: ErrorResponse, 500: ErrorResponse})
def check_auth(request):
    try:
        if request.user.is_authenticated:
            user = User.objects.filter(email=request.user.email).values()
            
            if not user:
                return 404, {"message": "Usuário não encontrado!"}
            
            return 200, {"data": user}
        
        return 401, {"message": "Não Autorizado"}
    
    except Exception as err:
        return 500, {"message": str(err)}
    
@api.get("/logout", response={200: SuccessResponse, 401: ErrorResponse, 404: ErrorResponse, 500: ErrorResponse})
def custom_logout(request):
    logout(request)
    return 200, {"message": "Logout feito com sucesso!"}


@api.post("/full-profile", response={200: SuccessResponse})
def register(request, payload: SaveReq):
    
    # TODO: Upload img base64
    
    
    if not User.objects.filter(email=payload.email):
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

