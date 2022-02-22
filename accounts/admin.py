from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from accounts.models import Follow, User


class UserCustomAdmin(admin.ModelAdmin):
    list_display = ('username', 'email')

admin.site.register(User, UserCustomAdmin)

admin.site.register(Follow)
