# Generated by Django 4.0.2 on 2022-02-25 13:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('playlist', '0002_rename_create_at_playlist_created_at'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='content',
            options={'ordering': ['pk'], 'verbose_name': '保存コンテンツ', 'verbose_name_plural': '保存コンテンツ一覧'},
        ),
        migrations.AlterUniqueTogether(
            name='content',
            unique_together=set(),
        ),
    ]
