import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import User, NegotiationRoom, NegotiationMessage
from datetime import datetime

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info(f"Nova conexão WebSocket: room_id={self.scope['url_route']['kwargs'].get('room_id')}")
        try:
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f"negotiation_{self.room_id}"

            # Verificar se a sala existe
            room_exists = await self.check_room_exists(self.room_id)
            if not room_exists:
                logger.error(f"Sala não encontrada: {self.room_id}")
                await self.close()
                return

            # Adicionar ao grupo
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            logger.info(f"Conectado com sucesso à sala: {self.room_group_name}")
            
            # Enviar confirmação de conexão
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'room_id': self.room_id,
                'message': 'Conectado com sucesso'
            }))
            
        except Exception as e:
            logger.exception(f"Erro ao conectar: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Desconectando da sala: {getattr(self, 'room_group_name', 'unknown')}")
        if hasattr(self, 'room_group_name'):
            # Remover do grupo
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        logger.info(f"Dados recebidos via WebSocket: {text_data}")

        if not text_data:
            logger.warning("Dados vazios recebidos")
            await self.send_error("Dados vazios")
            return

        try:
            data = json.loads(text_data)
            logger.info(f"Dados JSON decodificados: {data}")
            
            if not isinstance(data, dict):
                logger.error(f"Dados não são um dicionário: {type(data)}")
                await self.send_error("Formato de dados inválido")
                return
                
            # Verificar tipo de mensagem
            message_type = data.get('type', 'message')
            
            if message_type == 'message':
                await self.handle_chat_message(data)
            elif message_type == 'ping':
                await self.handle_ping()
            else:
                logger.warning(f"Tipo de mensagem desconhecido: {message_type}")
                
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            await self.send_error("JSON inválido")
        except Exception as e:
            logger.exception(f"Erro ao processar mensagem: {e}")
            await self.send_error(f"Erro interno: {str(e)}")

    async def handle_chat_message(self, data):
        """Processa mensagens de chat"""
        # Extrair os dados necessários
        content = data.get('content')
        sender_id = data.get('sender_id')
        
        # Aceitar tanto 'receiver_id' (do WebSocket) quanto 'receiver' (da API REST)
        receiver_id = data.get('receiver_id') or data.get('receiver')
        
        room_id = data.get('room_id') or self.room_id

        if not content or not sender_id or not receiver_id:
            logger.warning(f"Dados inválidos: content={bool(content)}, sender_id={sender_id}, receiver_id={receiver_id}")
            await self.send_error("Dados obrigatórios faltando")
            return

        # Verificar se o sender existe
        sender_exists = await self.check_user_exists(sender_id)
        if not sender_exists:
            logger.error(f"Usuário remetente não encontrado: {sender_id}")
            await self.send_error("Usuário remetente inválido")
            return

        # Verificar se o receiver existe
        receiver_exists = await self.check_user_exists(receiver_id)
        if not receiver_exists:
            logger.error(f"Usuário destinatário não encontrado: {receiver_id}")
            await self.send_error("Usuário destinatário inválido")
            return

        # Log dos dados antes de salvar
        logger.info(f"Dados validados - room_id={room_id}, sender_id={sender_id}, receiver_id={receiver_id}, content='{content[:50]}...'")

        # Salvar mensagem no banco de dados
        message_data = await self.save_message(room_id, sender_id, receiver_id, content)
        
        if message_data.get('error'):
            logger.error(f"Erro ao salvar mensagem: {message_data['error']}")
            await self.send_error("Erro ao salvar mensagem")
            return
        
        # Enviar mensagem para o grupo
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'negotiation_message',
                'message': message_data
            }
        )
        logger.info(f"Mensagem enviada para o grupo {self.room_group_name}")

    async def handle_ping(self):
        """Responde a mensagens de ping para manter conexão ativa"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': datetime.now().isoformat()
        }))

    async def send_error(self, error_message):
        """Envia mensagem de erro para o cliente"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message
        }))

    @database_sync_to_async
    def check_room_exists(self, room_id):
        try:
            return NegotiationRoom.objects.filter(idRoom=room_id).exists()
        except Exception as e:
            logger.exception(f"Erro ao verificar sala: {e}")
            return False

    @database_sync_to_async
    def check_user_exists(self, user_id):
        try:
            return User.objects.filter(id=user_id).exists()
        except Exception as e:
            logger.exception(f"Erro ao verificar usuário: {e}")
            return False

    @database_sync_to_async
    def save_message(self, room_id, sender_id, receiver_id, content):
        try:
            # Validações antes de criar
            if not room_id or not sender_id or not receiver_id or not content:
                raise ValueError(f"Dados obrigatórios faltando: room_id={room_id}, sender_id={sender_id}, receiver_id={receiver_id}, content={bool(content)}")
            
            # Log detalhado antes de buscar objetos
            logger.info(f"Buscando objetos - room_id={room_id}, sender_id={sender_id}, receiver_id={receiver_id}")
            
            room = NegotiationRoom.objects.get(idRoom=room_id)
            logger.info(f"Sala encontrada: {room.idRoom}")
            
            sender = User.objects.get(id=sender_id)
            logger.info(f"Sender encontrado: {sender.id} - {sender.first_name}")
            
            receiver = User.objects.get(id=receiver_id)
            logger.info(f"Receiver encontrado: {receiver.id} - {receiver.first_name}")
            
            # Log antes de criar
            logger.info(f"Criando mensagem: room={room.idRoom}, sender={sender.id}, receiver={receiver.id}")
            
            message = NegotiationMessage.objects.create(
                room=room,
                sender=sender,
                receiver=receiver,
                content=content
            )
            
            # Log após criar
            logger.info(f"Mensagem criada com ID: {message.id}")
            
            # Verificar se foi salvo corretamente imediatamente após criação
            logger.info(f"Verificando dados salvos: sender_id={message.sender.id}, receiver_id={message.receiver.id}")
            
            # Buscar a imagem do sender
            sender_img_url = None
            if sender.profile_picture and sender.profile_picture.name:
                sender_img_url = f"http://localhost:8000{sender.profile_picture.url}"
            elif sender.profile_picture_url:
                sender_img_url = sender.profile_picture_url
            
            logger.info(f"Sender image URL: {sender_img_url}")
            
            return {
                "id": str(message.id),
                "content": message.content,
                "sender_id": message.sender.id,
                "sender_name": f"{message.sender.first_name} {message.sender.last_name}".strip(),
                "sender_img_url": sender_img_url,
                "receiver_id": message.receiver.id,
                "receiver_name": f"{message.receiver.first_name} {message.receiver.last_name}".strip(),
                "room_id": str(message.room.idRoom),
                "created": message.created.isoformat(),
                "is_read": message.is_read,
            }
        except NegotiationRoom.DoesNotExist:
            error_msg = f"Sala não encontrada: {room_id}"
            logger.error(error_msg)
            return {"error": error_msg}
        except User.DoesNotExist as e:
            error_msg = f"Usuário não encontrado - sender_id={sender_id}, receiver_id={receiver_id}: {e}"
            logger.error(error_msg)
            return {"error": error_msg}
        except Exception as e:
            logger.exception(f"Erro ao salvar mensagem: {e}")
            return {
                "error": str(e),
                "content": content,
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "room_id": room_id 
            }

    async def negotiation_message(self, event):
        """Envia mensagem para o WebSocket"""
        logger.info(f"Enviando mensagem para WebSocket: {event}")
        message = event['message']
        
        # Verificar se há erro na mensagem
        if message.get('error'):
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': message['error']
            }))
            return
        
        # Envia mensagem formatada para o WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'room_id': message['room_id'],
            'content': message['content'],
            'sender_id': message['sender_id'],
            'sender': message['sender_name'],
            'sender_name': message['sender_name'],
            'sender_img_url': message.get('sender_img_url'),  # Usar .get() para evitar KeyError
            'receiver_id': message['receiver_id'],
            'receiver_name': message['receiver_name'],
            'created': message['created'],
            'is_read': message['is_read'],
            'id': message['id']
        }))