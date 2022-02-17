from enum import unique

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    
    email = models.EmailField(
        "メールアドレス",
        max_length=255,
        unique=True,
    )

    name = models.CharField(
        "ユーザネーム",
        max_length=255,
    )

    def __str__(self):
        return self.name
