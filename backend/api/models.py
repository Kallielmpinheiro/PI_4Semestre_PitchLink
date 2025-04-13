from django.db import models
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import JSONField

# Create your models here.

class User(models.Model):
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
    
    @property
    def get_profile_picture(self):
        if self.profile_picture and self.profile_picture.name:
            return self.profile_picture.url
        elif self.profile_picture_url:
            return self.profile_picture_url
        return None
    