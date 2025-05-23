# Generated by Django 5.1.6 on 2025-05-03 22:23

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_remove_innovation_imagem_innovation_created_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='NegotiationRoom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('idRoom', models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name='ID da Sala')),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('modified', models.DateTimeField(auto_now=True, verbose_name='Alterado em')),
                ('status', models.CharField(choices=[('open', 'Aberta'), ('closed', 'Fechada'), ('in_progress', 'Em Progresso')], default='open', max_length=50, verbose_name='Status')),
                ('innovation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='negotiation_rooms', to='api.innovation')),
                ('participants', models.ManyToManyField(blank=True, related_name='negotiation_rooms', to='api.user')),
            ],
            options={
                'verbose_name': 'Sala de Negociação',
                'verbose_name_plural': 'Salas de Negociação',
            },
        ),
        migrations.CreateModel(
            name='NegotiationMessage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('modified', models.DateTimeField(auto_now=True, verbose_name='Alterado em')),
                ('content', models.TextField(verbose_name='Conteúdo da Mensagem')),
                ('is_read', models.BooleanField(default=False, verbose_name='Lida')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to='api.user')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.negotiationroom')),
            ],
            options={
                'verbose_name': 'Mensagem da Sala de Negociação',
                'verbose_name_plural': 'Mensagens das Salas de Negociação',
                'ordering': ['created'],
            },
        ),
    ]
