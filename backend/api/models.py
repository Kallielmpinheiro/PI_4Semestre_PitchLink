from django.db import models
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import JSONField

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
