from django.db import models
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import JSONField
import uuid
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Create your models here.

class User(models.Model):
    created = models.DateTimeField(_('Criado em'), auto_now_add=True)
    modified = models.DateTimeField(_('Alterado em'), auto_now=True)
    first_name = models.CharField(_('Nome'), max_length=255, blank=True, null=True)
    last_name = models.CharField(_('Sobrenome'), max_length=255, blank=True, null=True)
    email = models.EmailField(_('Email'), unique=True, blank=True, null=True)
    profile_picture = models.FileField(_('Foto Upload'), upload_to='profile_pictures/', blank=True, null=True)
    profile_picture_url = models.URLField(_('Foto URL'), max_length=500, blank=True, null=True)
    data_nasc = models.DateField(_('Data Nasc.'), blank=True, null=True)
    categories = models.JSONField(_('Categorias'), default=list, blank=True, null=True)

    class Meta:
        verbose_name = _('Usuario')
        verbose_name_plural = _('Usuarios')
    
    def __str__(self):
        return self.first_name
    
    @property
    def get_profile_picture(self):
        if self.profile_picture and self.profile_picture.name:
            return self.profile_picture.url
        elif self.profile_picture_url:
            return self.profile_picture_url
        return None


class Innovation(models.Model):
    created = models.DateTimeField(_('Criado em'), auto_now_add=True)
    modified = models.DateTimeField(_('Alterado em'), auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_innovations')
    partners = models.ManyToManyField(User, blank=True, related_name='partnered_innovations')
    nome = models.CharField(_('Nome'), max_length=255, blank=True, null=True)
    descricao = models.CharField(_('Descrição'), max_length=255, blank=True, null=True)
    investimento_minimo = models.CharField(_('Investimento Mínimo'), max_length=255, blank=True, null=True)
    porcentagem_cedida = models.CharField(_('Porcentagem Cedida'), max_length=255, blank=True, null=True)
    categorias = models.JSONField(_('Categorias'), default=list, blank=True, null=True)

    class Meta:
        verbose_name = _('Ideia')
        verbose_name_plural = _('Ideias')

    def __str__(self):
        return self.nome
    
    def get_all_images(self):
        return [img.imagem.url for img in self.images.all() if img.imagem]


class InnovationImage(models.Model):
    created = models.DateTimeField(_('Criado em'), auto_now_add=True)
    modified = models.DateTimeField(_('Alterado em'), auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_innovationsimages')
    innovation = models.ForeignKey(Innovation, on_delete=models.CASCADE, related_name='images')
    imagem = models.FileField(_('Foto'), upload_to='Innovation/', blank=True, null=True)

    class Meta:
        verbose_name = _('Imagem da Ideia')
        verbose_name_plural = _('Imagens das Ideias')

    def __str__(self):
        return f"Imagem para a ideia: {self.innovation.nome}"
     
class NegotiationRoom(models.Model):
    idRoom = models.UUIDField(_('ID da Sala'), default=uuid.uuid4, editable=False, unique=True)
    created = models.DateTimeField(_('Criado em'), auto_now_add=True)
    modified = models.DateTimeField(_('Alterado em'), auto_now=True)
    participants = models.ManyToManyField('User', related_name='negotiation_rooms', blank=True)
    innovation = models.ForeignKey('Innovation', on_delete=models.CASCADE, related_name='negotiation_rooms')
    status = models.CharField(_('Status'), max_length=50, choices=[
        ('open', _('Aberta')),
        ('closed', _('Fechada')),
        ('in_progress', _('Em Progresso')),
    ], default='open')
    
    class Meta:
        verbose_name = _('Sala de Negociação')
        verbose_name_plural = _('Salas de Negociação')

    def __str__(self):
        return f"Sala de Negociação: {self.idRoom}"
    
    def get_participants(self):
        return self.participants.all()
    
    def get_channel_group_name(self):
        return f"negotiation_{self.idRoom}"
    
    def send_message_to_room(self, message_data):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            self.get_channel_group_name(),
            {
                "type": "negotiation.message",
                "message": message_data
            }
        )

class NegotiationMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created = models.DateTimeField(_('Criado em'), auto_now_add=True)
    modified = models.DateTimeField(_('Alterado em'), auto_now=True)
    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey('User', on_delete=models.CASCADE, related_name='received_messages')
    room = models.ForeignKey(NegotiationRoom, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField(_('Conteúdo da Mensagem'))
    is_read = models.BooleanField(_('Lida'), default=False)
    
    class Meta:
        verbose_name = _('Mensagem da Sala de Negociação')
        verbose_name_plural = _('Mensagens das Salas de Negociação')
        ordering = ['created']

    def __str__(self):
        return f"Mensagem de {self.sender.first_name} para {self.receiver.first_name} na sala {self.room.idRoom}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            self.notify_room()
    
    def notify_room(self):
        message_data = {
            "id": str(self.id),
            "content": self.content,
            "sender_id": self.sender.id,
            "sender_name": f"{self.sender.first_name} {self.sender.last_name}".strip(),
            "room_id": str(self.room.idRoom),
            "created": self.created.isoformat(),
            "is_read": self.is_read,
        }
        
        self.room.send_message_to_room(message_data)


class ProposalInnovation(models.Model):
    created = models.DateTimeField(_('Criado em'), auto_now_add=True)
    modified = models.DateTimeField(_('Alterado em'), auto_now=True)
    investor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="proposalinnovation_investor")
    sponsored = models.ForeignKey(User, on_delete=models.CASCADE, related_name="Proposalinnovation_sponsored")
    innovation = models.ForeignKey(Innovation, on_delete=models.CASCADE, related_name='proposalinnovation_innovation')
    descricao = models.CharField(_('Descrição'), max_length=255, blank=True, null=True)
    investimento_minimo = models.CharField(_('Investimento Mínimo'), max_length=255, blank=True, null=True)
    porcentagem_cedida = models.CharField(_('Porcentagem Cedida'), max_length=255, blank=True, null=True)
    accepted = models.BooleanField('Aceito', default=False)
    status = models.CharField(_('Status'), max_length=50, choices=[
        ('pending', _('Pendente')),
        ('accepted', _('Aceita')),
        ('rejected', _('Rejeitada')),
        ('negotiating', _('Em negociação')),
    ], default='pending')    
    
    class Meta:
        verbose_name = _('Proposta de Inovação')
        verbose_name_plural = _('Propostas de Inovação')
        ordering = ['created']

    def __str__(self):
            return f"Proposta de {self.investor.first_name} para {self.innovation.nome}"