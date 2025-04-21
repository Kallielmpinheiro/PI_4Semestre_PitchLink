import traceback
from allauth.socialaccount.models import SocialAccount
from api.schemas import ErrorResponse, SuccessResponse,CreateInnovationReq
from api.schemas import SaveReq, UserReq, SearchInnovationReq
from ninja.security import django_auth, HttpBearer
from django.contrib.auth import logout
from datetime import datetime, timedelta
import time
from api.models import User, Innovation
from ninja import NinjaAPI
from typing import Any
import requests
import pytz
import base64
import os
from django.core.files.base import ContentFile
from django.conf import settings
import jwt
from django.http import HttpResponse, Http404, JsonResponse
from django.db import transaction

api = NinjaAPI()

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.DecodeError:
            return None
        try:
            user = User.objects.get(id=payload["id"])
        except User.DoesNotExist:   
            return None
        return user
     
@api.get("/check-auth", auth=AuthBearer())
def check_auth(request):
    user = User.objects.get(id=request.auth.id) 
    return {"data": {"id": user.id}}

@api.get("/logout", response={200: SuccessResponse, 401: ErrorResponse, 404: ErrorResponse, 500: ErrorResponse})
def custom_logout(request):
    logout(request)
    return 200, {"message": "Logout feito com sucesso!"}

@api.post("/full-profile")
def register(request, payload: SaveReq):
 
    try:
        profile_picture = None
        profile_picture_url = None

        if (
            payload.profile_picture and 
            isinstance(payload.profile_picture, str)
        ):
            if payload.profile_picture.startswith("data:image"):
                format, imgstr = payload.profile_picture.split(';base64,')
                ext = format.split('/')[-1]

                filename = f"profile_{payload.email.replace('@', '_').replace('.', '_')}_{int(time.time())}.{ext}"

                media_dir = settings.MEDIA_ROOT
                profile_pics_dir = os.path.join(media_dir, "profile_pictures")
                
                os.makedirs(profile_pics_dir, exist_ok=True)

                file_path = os.path.join(profile_pics_dir, filename)
                decoded_data = base64.b64decode(imgstr)

                with open(file_path, 'wb') as f:
                    f.write(decoded_data)

                if os.path.exists(file_path):
                    profile_picture = os.path.join("profile_pictures", filename)
                else:
                    return 500, {"message": "Falha ao salvar a imagem."}
            else:
                profile_picture_url = payload.profile_picture

        if not User.objects.filter(email=payload.email).exists():
            account = User(
                first_name=payload.first_name,
                last_name=payload.last_name,
                email=payload.email,
                data_nasc=payload.data_nasc,
                categories=payload.categories
            )
            
            if profile_picture:
                account.profile_picture = profile_picture
            elif profile_picture_url:
                account.profile_picture_url = profile_picture_url
                
            account.save()
            
            token = jwt.encode(
                {
                    'id': account.id,
                    'exp': datetime.utcnow() + timedelta(days=7), 
                    'iat': datetime.utcnow()
                },
                settings.SECRET_KEY,
                algorithm="HS256"
            )
            
            return 200, {
                "message": "Usuário registrado com sucesso!",
                "token": token,
                "user_id": account.id
            }
            
        else:
            account = User.objects.filter(email=payload.email).first()
            account.first_name = payload.first_name
            account.last_name = payload.last_name
            account.data_nasc = payload.data_nasc
            account.categories = payload.categories

            if profile_picture:
                account.profile_picture_url = None
                account.profile_picture = profile_picture
            elif profile_picture_url:
                if account.profile_picture:
                    account.profile_picture = None
                account.profile_picture_url = profile_picture_url

            account.save()
            return 200, {"message": "Perfil atualizado com sucesso!"}

    except Exception as e:
        traceback.print_exc()
        return 500, {"message": f"Erro ao processar o perfil: {str(e)}"}
    
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

@api.get('/get-image', auth=AuthBearer(), response={200: dict, 404: dict})
def get_user_image(request):
    try:
        user = request.auth
    except User.DoesNotExist:
        return 404, {'message': 'Conta nao encontrada'}
        
    if user.profile_picture:
        image_url = f"{settings.MEDIA_URL}{user.profile_picture}"
        return 200, {"image_url": image_url}
    elif user.profile_picture_url:
        return 200, {"image_url": user.profile_picture_url}
    return 404, {"message": "Image not found"}

@api.get('/get-perfil', auth=AuthBearer(), response={200: dict, 404: dict})
def get_user_perfil(request):
    
    try:
        user = User.objects.get(id=request.auth)
    except User.DoesNotExist:
        return 404, {'message': 'Conta nao encontrada'}
        
    data = {
        'last_name': user.last_name if user.last_name else '-',
        'email': user.email if user.email else '-',
        'profile_picture': str(user.profile_picture) if user.profile_picture else '-',
        'profile_picture_url': user.profile_picture_url if user.profile_picture else '-',
        'data_nasc': user.data_nasc if user.data_nasc else '-',
        'categories': user.categories if user.categories else '-'
    }
    
    return 200, {'data': data}

@api.post('/post-create-innovation', response={200: dict, 404: dict})
def post_create_innovation(request, payload: CreateInnovationReq):

    try:
        user = User.objects.get(id=1)  
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}

    try:
        with transaction.atomic():
            innovation = Innovation.objects.create(
                owner=user,
                nome=payload.nome,
                descricao=payload.descricao,
                investimento_minimo=payload.investimento_minimo,
                porcentagem_cedida=payload.porcentagem_cedida,
                categorias=payload.categorias,
                imagem=payload.imagem,
            )
    except Exception as e:
        return 404, {'message', str(e)}

    return 200, {'message': 'Inovação criada com sucesso!', 'id': innovation.id}

@api.get('/get-innovation', response={200: dict, 404: dict})
def get_innovation(request):

    try:
        
        user = User.objects.get(id=1)  
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}

    data = []

    try:
        inv = Innovation.objects.all()
        for x in inv:
            data.append({
                'id': x.id,  
                'nome': x.nome,
                'descricao': x.descricao
            })

    except Exception as e:
        return 404, {'message': str(e)}

    return 200, {'data':data}

@api.post('/post-search-innovation', response={200: dict, 404: dict})
def search_innovation(request, payload : SearchInnovationReq):
    try:
        user = User.objects.get(id=1)  
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}

    data = []

    print(payload.search)
    
    try:
        inv = Innovation.objects.filter(categorias=payload.search)
        for x in inv:
            data.append({
                'id': x.id,
                'owner': x.owner.first_name if x.owner else '-',
                'partners': list(map(lambda p: {'id': p.id, 'nome': p.first_name}, x.partners.all())),
                'nome': x.nome if x.nome else '-',
                'descricao': x.descricao if x.descricao else '-',
                'investimento_minimo': x.investimento_minimo if x.investimento_minimo else '-',
                'porcentagem_cedida': x.porcentagem_cedida if x.porcentagem_cedida else '-',
                'categorias': x.categorias if x.categorias else '-',
                'imagem': x.imagem.url if x.imagem else '-',
            })

    except Exception as e:
        return 404, {'message': str(e)}

    return 200, {'data': data}
