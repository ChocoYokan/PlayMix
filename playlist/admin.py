from django.contrib import admin

from playlist.models import Content, PlayList

admin.site.register(PlayList)
admin.site.register(Content)
