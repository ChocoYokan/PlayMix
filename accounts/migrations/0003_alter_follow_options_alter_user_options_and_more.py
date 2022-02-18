# Generated by Django 4.0.2 on 2022-02-18 12:47

import django.contrib.auth.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_user_playlists'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='follow',
            options={'verbose_name': 'フォロー', 'verbose_name_plural': 'フォロー一覧'},
        ),
        migrations.AlterModelOptions(
            name='user',
            options={'verbose_name': 'ユーザ', 'verbose_name_plural': 'ユーザ一覧'},
        ),
        migrations.RemoveField(
            model_name='user',
            name='date_joined',
        ),
        migrations.RemoveField(
            model_name='user',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='user',
            name='last_name',
        ),
        migrations.RemoveField(
            model_name='user',
            name='name',
        ),
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True, verbose_name='active'),
        ),
        migrations.AlterField(
            model_name='user',
            name='is_staff',
            field=models.BooleanField(default=False, verbose_name='staff status'),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=255, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='ユーザネーム'),
        ),
    ]