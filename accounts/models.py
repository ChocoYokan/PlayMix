from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin, UserManager
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from playlist.models import PlayList


class User(AbstractBaseUser, PermissionsMixin):

    class Meta:
        verbose_name = _("ユーザ")
        verbose_name_plural = _("ユーザ一覧")

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ['username']

    username_validator = UnicodeUsernameValidator()
    
    username = models.CharField(
        _("ユーザネーム"),
        max_length=255,
        validators=[username_validator],
        blank=False,
    )

    email = models.EmailField(
        _("メールアドレス"),
        max_length=255,
        unique=True,
    )

    is_staff = models.BooleanField(_("staff status"), default=False)
    is_active = models.BooleanField(_("active"), default=True)

    objects = UserManager()

    playlists = models.ForeignKey(
        PlayList,
        verbose_name="プレイリスト",
        related_name="user_playlists",
        on_delete=models.CASCADE,
        null=True,
    )

    def __str__(self):
        return self.username


class Follow(models.Model):

    class Meta:
        verbose_name = _("フォロー")
        verbose_name_plural = _("フォロー一覧")

    user = models.ForeignKey(
        User,
        verbose_name="ユーザ",
        related_name="follow",
        on_delete=models.CASCADE,
        blank=False,
    )

    target = models.ForeignKey(
        User,
        verbose_name="フォローユーザ",
        related_name="target_user",
        on_delete=models.CASCADE,
        blank=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} -> {self.user.username}"
