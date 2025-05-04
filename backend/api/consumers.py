import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from api.models import User, NegotiationRoom, NegotiationMessage
from asgiref.sync import sync_to_async
from uuid import UUID

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info(f"Nova conexão WebSocket: room_id={self.scope['url_route']['kwargs'].get('room_id')}")
        try:
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            UUID(self.room_id)
            self.room_group_name = f"negotiation_{self.room_id}"

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            logger.info(f"Conectado com sucesso à sala: {self.room_group_name}")
        except ValueError:
            logger.error(f"room_id inválido: {self.room_id}")
            await self.close()
        except Exception as e:
            logger.exception(f"Erro ao conectar: {e}")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"Desconectando da sala: {self.room_group_name}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

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
                
            message = data.get('content') 
            sender_id = data.get('sender_id')

            if not message or not sender_id:
                logger.warning("Dados inválidos: faltando 'content' ou 'sender_id'")
                return

            room = await sync_to_async(NegotiationRoom.objects.get)(idRoom=self.room_id)
            sender = await sync_to_async(User.objects.get)(id=sender_id)

            msg = await sync_to_async(NegotiationMessage.objects.create)(
                sender=sender,
                room=room,
                content=message
            )

            message_data = {
                "id": str(msg.id),
                "content": msg.content,
                "sender_id": msg.sender.id,
                "sender_name": f"{msg.sender.first_name} {msg.sender.last_name}".strip(),
                "room_id": str(msg.room.idRoom),
                "created": msg.created.isoformat(),
                "is_read": msg.is_read,
            }

            logger.info(f"Mensagem salva com sucesso: {msg.content}")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'negotiation_message',
                    'message': message_data
                }
            )
            logger.info(f"Mensagem enviada para o grupo {self.room_group_name}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Erro ao decodificar JSON: {e}")
            return
        except Exception as e:
            logger.exception(f"Erro ao processar mensagem: {e}")
            return

    async def negotiation_message(self, event):

        logger.debug(f"Enviando para WebSocket: {event}")
        await self.send(text_data=json.dumps(event['message']))