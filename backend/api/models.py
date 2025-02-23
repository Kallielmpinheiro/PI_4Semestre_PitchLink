from django.db import models

# Create your models here.

class Account(models.Model):
    name = models.CharField('Primeiro Mome', max_length=255)
    last_name = models. CharField('Sobrenome', max_length=255)

class Profile(models.Model):
    pass