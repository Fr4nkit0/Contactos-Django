# Generated by Django 4.2 on 2025-01-23 20:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0003_alter_contact_phone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='phone',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
