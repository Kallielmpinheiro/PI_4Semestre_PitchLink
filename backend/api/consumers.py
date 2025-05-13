import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from api.models import User, NegotiationRoom, NegotiationMessage

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
        logger.debug(f"Dados recebidos: {text_data}")

        if not text_data:
            logger.warning("Dados vazios recebidos")
            return

        try:
            data = json.loads(text_data)
            logger.debug(f"Dados JSON decodificados: {data}")
            
            if not isinstance(data, dict):
                logger.error(f"Dados não são um dicionário após decodificação: {type(data)}")
                return
                
            # Extrair os dados necessários
            content = data.get('content')
            sender_id = data.get('sender_id')
            receiver_id = data.get('receiver')
            room_id = data.get('room_id') or self.room_id

            if not content or not sender_id:
                logger.warning("Dados inválidos: faltando 'content' ou 'sender_id'")
                return

            # Salvar mensagem no banco de dados
            message = await self.save_message(room_id, sender_id, receiver_id, content)
            
            # Enviar mensagem para o grupo
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'negotiation_message',
                    'message': message
                }
            )
            logger.info(f"Mensagem enviada para o grupo {self.room_group_name}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
        except Exception as e:
            logger.exception(f"Erro ao processar mensagem: {e}")

    async def negotiation_message(self, event):
        logger.debug(f"Enviando para WebSocket: {event}")
        message = event['message']
        
        # Envia para o WebSocket
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def check_room_exists(self, room_id):
        try:
            return NegotiationRoom.objects.filter(idRoom=room_id).exists()
        except Exception as e:
            logger.exception(f"Erro ao verificar sala: {e}")
            return False

    @database_sync_to_async
    def save_message(self, room_id, sender_id, receiver_id, content):
        try:
            room = NegotiationRoom.objects.get(idRoom=room_id)
            
            sender = User.objects.get(id=sender_id)
            
            receiver = None
            if receiver_id:
                try:
                    receiver = User.objects.get(id=receiver_id)
                except User.DoesNotExist:
                    pass
            
            message = NegotiationMessage.objects.create(
                room=room,
                sender=sender,
                receiver=receiver,
                content=content
            )
            
            return {
                "id": str(message.id),
                "content": message.content,
                "sender_id": message.sender.id,
                "sender_name": f"{message.sender.first_name} {message.sender.last_name}".strip(),
                "receiver": message.receiver.id if message.receiver else None,
                "room_id": str(message.room.idRoom),
                "created": message.created.isoformat(),
                "is_read": message.is_read,
            }
        except Exception as e:
            logger.exception(f"Erro ao salvar mensagem: {e}")
            return {
                "error": str(e),
                "content": content,
                "sender_id": sender_id,
                "room_id": room_id 
            }