# Generated by Django 5.1.6 on 2025-06-08 21:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_contractsignature_proposalpayment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='proposalinnovation',
            name='status',
            field=models.CharField(choices=[('pending', 'Pendente'), ('cancelled', 'Cancelada'), ('rejected', 'Rejeitada'), ('accepted_request', 'Aceita - Solicitação'), ('accepted_proposal', 'Aceita - Proposta'), ('accepted_contract', 'Aceita - Contrato'), ('completed', 'Finalizada')], default='pending', max_length=50, verbose_name='Estágios'),
        ),
    ]
