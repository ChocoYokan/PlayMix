from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class PlayList(models.Model):

    class Meta:
        verbose_name = _("プレイリスト")
        verbose_name_plural = _("プレイリスト一覧")

    user = models.ForeignKey(
        User,
        verbose_name=_("ユーザ"),
        related_name="user",
        on_delete=models.CASCADE,
    )

    name = models.CharField(
        verbose_name="プレイリスト名",
        max_length=510,
        blank=False,
        unique=True,
    )

    updated_at = models.DateTimeField(auto_now=True)

    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"


class Content(models.Model):

    class Meta:
        verbose_name = _("保存コンテンツ")
        verbose_name_plural = _("保存コンテンツ一覧")
        unique_together = ["playlist", "order"]
        ordering = ['order']

    playlist = models.ForeignKey(
        PlayList,
        verbose_name=_("プレイリスト"),
        related_name="contents",
        on_delete=models.CASCADE,
    )

    order = models.IntegerField(
        verbose_name=_("並び順"),
    )

    name = models.CharField(
        verbose_name="コンテンツ名",
        max_length=255,
        blank=False,
    )

    url = models.URLField(
        verbose_name="コンテンツURL",
        max_length=510,
        blank=False,
    )

    thumbnail = models.URLField(
        verbose_name="サムネイルURL",
        max_length=510,
        null=True,
    )

    CONTENT_TYPES = (
        ("nikodo", "ニコニコ動画"),
        ("youtube", "Youtube"),
        ("spotify", "Spotify"),
    )

    content_type = models.CharField(
        verbose_name="コンテンツのタイプ",
        choices=CONTENT_TYPES,
        max_length=50,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.content_type} {self.name} ({self.order})"
