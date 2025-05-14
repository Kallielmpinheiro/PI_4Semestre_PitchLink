import traceback
from allauth.socialaccount.models import SocialAccount
from api.schemas import CreateMessageRequest, CreateRoomRequest, ErrorResponse, SuccessResponse,CreateInnovationReq
from api.schemas import SaveReq, UserReq, SearchInnovationReq, ImgInnovationReq
from ninja.security import django_auth, HttpBearer
from django.contrib.auth import logout
from datetime import datetime, timedelta
import time
from api.models import NegotiationMessage, NegotiationRoom, User, Innovation, InnovationImage
from ninja import NinjaAPI
from typing import Any
import requests
import pytz
import base64
import os
from django.core.files.base import ContentFile
from django.conf import settings
import jwt
from django.http import HttpResponse, Http404, JsonResponse, HttpRequest
from django.db import transaction
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

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

@api.post("/full-profile", response={200: dict, 404: dict, 401: dict})
def register(request, payload: SaveReq):

    if not payload.first_name:
        return 404, {"message": "O Primeiro nome é obrigatório para identificação do usuário no sistema!"}
    if not payload.last_name:
        return 404, {"message": "O Sobrenome é obrigatório para completar seu perfil corretamente!"}
    if not payload.categories:
        return 404, {"message": "A Categoria é obrigatória para personalizar sua experiência e conectá-lo com inovações relevantes!"}
    if not payload.data_nasc:
        return 404, {"message": "A Data de Nascimento é obrigatória para verificação de idade e conformidade com os termos de serviço!"}
    if not payload.profile_picture:
        return 404, {"message": "A Imagem de Perfil é obrigatória para que outros usuários possam identificá-lo visualmente na plataforma!"}


    logging.info(payload)
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
        # user = User.objects.get(id=1)      
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
        user = request.auth
        # user = User.objects.get(id=1)  
    except User.DoesNotExist:
        return 404, {'message': 'Conta nao encontrada'}
        
    data = {
        'id': user.id,
        'first_name':user.first_name if user.first_name else '-',
        'last_name': user.last_name if user.last_name else '-',
        'email': user.email if user.email else '-',
        'profile_picture': str(user.profile_picture) if user.profile_picture else '',
        'profile_picture_url': user.profile_picture_url if user.profile_picture_url else '',
        'data_nasc': user.data_nasc if user.data_nasc else '-',
        'categories': user.categories if user.categories else '-'
    }
    
    return 200, {'data': data}

@api.post('/post-create-innovation', auth=AuthBearer(), response={200: dict, 404: dict, 500: dict})
def post_create_innovation(request: HttpRequest):
    
    try:
        user = request.auth
        # user = User.objects.get(id=1)  
    except User.DoesNotExist:
        return 404, {"message": "Conta não encontrada"} 
    
    data = request.POST

    payload = CreateInnovationReq(
        partners=data.get('partners'),
        nome=data.get('nome'),
        descricao=data.get('descricao'),
        investimento_minimo=data.get('investimento_minimo'),
        porcentagem_cedida=data.get('porcentagem_cedida'),
        categorias=data.get('categorias'),
    )
        
    if payload.investimento_minimo < 0:
        return 404, {'message':'Valor indevido'}
    elif not payload.categorias:
        return 404, {'message':'Informe categorias'}
    elif not payload.porcentagem_cedida:
        return 404, {'message':'Informe porcentagem cedida'}
    elif not payload.investimento_minimo:
        return 404, {'message':'Informe investimento_minimo'}
    elif not payload.descricao:
        return 404, {'message':'Informe descricao'}
    elif not payload.nome:
        return 404, {'message':'Informe nome'}
    
    try:
        with transaction.atomic():
            innovation = Innovation(
                owner=user,
                nome=payload.nome,
                descricao=payload.descricao,
                investimento_minimo=payload.investimento_minimo,
                porcentagem_cedida=payload.porcentagem_cedida,
                categorias=payload.categorias.split(',') if payload.categorias else [],
            )
            innovation.save()

            images = []
            
            if not request.FILES.getlist('imagens'):
                return 404, {'message':'Anexe no minimo 1 img'}

            for image_file in request.FILES.getlist('imagens'):
                images.append(
                    InnovationImage(
                        owner=user,
                        innovation=innovation,
                        imagem=image_file
                    )
                )
            InnovationImage.objects.bulk_create(images)

    except Exception as e:
        return 500, {"message": str(e)}

    return 200, { "message": "Inovação criada com sucesso!"}


@api.get('/get-innovation', auth=AuthBearer(), response={200: dict, 404: dict})
def get_innovation(request):

    try:
        user = request.auth
        # user = User.objects.get(id=1)   
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}

    data = []

    try:
        
        inv = Innovation.objects.all()
        
        for x in inv:
            imagens = []

            list_imagem_url = x.get_all_images()
            for imagem_url in list_imagem_url:
                imagens.append(request.build_absolute_uri(imagem_url))
                
            data.append({
                    'id': x.id,
                    'owner': x.owner.first_name,
                    'nome': x.nome,
                    'descricao': x.descricao,
                    'investimento_minimo': x.investimento_minimo,
                    'porcentagem_cedida': x.porcentagem_cedida,
                    'categorias': x.categorias,
                    'imagens': imagens,
            })

    except Exception as e:
        return 404, {'message': str(e)}

    return 200, {'data': data}

@api.post('/post-search-innovation',  auth=AuthBearer(), response={200: dict, 404: dict})
def search_innovation(request, payload : SearchInnovationReq):
    try:
        user = request.auth
        # user = User.objects.get(id=1)   
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

# testes

@api.post("/create-room", response={200: dict, 404: dict, 403: dict})
def create_room(request, payload: CreateRoomRequest):
    
    try:
        user = request.auth
        # user = User.objects.get(id=1)   
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}

    try:
        innovation = Innovation.objects.get(id=payload.innovation_id)
    except Innovation.DoesNotExist:
        return 404, {'message': 'Inovação não encontrada'}


    room, created = NegotiationRoom.objects.get_or_create(innovation_id=payload.innovation_id)
    room.participants.add(user)
    
    return 200, {
        "room_id": str(room.idRoom),
        "status": room.status,
        "participants": [u.id for u in room.participants.all()],
        "created": created
    }

@api.post("/send-message", response={200: dict, 404: dict, 403: dict})
def send_message(request, payload: CreateMessageRequest):
    
    try:
        user = request.auth
        # user = User.objects.get(id=1)   
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}
    
    try:
        room = NegotiationRoom.objects.get(idRoom=payload.room_id)
    except NegotiationRoom.DoesNotExist:
        return 404, {'message': 'Sala de negociação não encontrada'}

    message = NegotiationMessage.objects.create(
        room=room,
        sender=user,
        receiver=payload.receiver,
        content=payload.content
    )

    message_data = {
        "id": str(message.id),
        "content": message.content,
        "sender_id": message.sender.id,
        "sender_name": f"{message.sender.first_name} {message.sender.last_name}".strip(),
        "receiver": message.receiver,
        "room_id": str(message.room.idRoom),
        "created": message.created.isoformat(),
        "is_read": message.is_read,
    }

    # Usando o nome do grupo padronizado
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"negotiation_{room.idRoom}",
        {
            "type": "negotiation_message",
            "message": message_data
        }
    )

    return 200, message_data



@api.get('/get-negotiation-room', auth=AuthBearer(), response={200: dict, 404: dict})
def get_negotiation_room(request):
    try:
        user = request.auth
        # user = User.objects.get(id=1)   
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}

    data = []

    try:
        rooms = NegotiationRoom.objects.all().first()
        if not rooms:
            return 404, {'message': 'Nenhuma sala encontrada'}
        data.append({
            'id': str(rooms.idRoom),
            'status': rooms.status,
            'participants': [{'id': u.id} for u in rooms.participants.all()],
        })

    except Exception as e:
        return 404, {'message': str(e)}

    return 200, {'data': data}

@api.post('/get-messages/{room_id}', response={200: dict, 404: dict})
def get_messages(request, room_id: str):

    try:
        user = request.auth
        # user = User.objects.get(id=1)
    except User.DoesNotExist:
        return 404, {'message': 'Conta não encontrada'}

    try:
        room = NegotiationRoom.objects.get(idRoom=room_id)
    except NegotiationRoom.DoesNotExist:
        return 404, {'message': 'Sala de negociação não encontrada'}
    
    data = []

    try:
        messages = NegotiationMessage.objects.filter(room=room)
        if not messages:
            return 404, {'message': 'Nenhuma mensagem encontrada'}
        for x in messages:
            data.append({
                'id': str(x.id),
                'sender': x.sender.first_name,
                'receiver': x.receiver.first_name,
                'room_id': str(x.room.idRoom),
                'content': x.content,
                'created': x.created.isoformat(),
                'is_read': x.is_read,
            })

    except Exception as e:
        return 404, {'message': str(e)}

    return 200, {'data': data}