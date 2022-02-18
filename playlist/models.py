from django.db import models
from django.utils.translation import gettext_lazy as _


class Content(models.Model):

    class Meta:
        verbose_name = _("保存コンテンツ")
        verbose_name_plural = _("保存コンテンツ一覧")

    name = models.CharField(
        verbose_name="コンテンツ名",
        max_length=510,
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
        return f"{self.content_type} {self.name}"

class PlayList(models.Model):

    class Meta:
        verbose_name = _("プレイリスト")
        verbose_name_plural = _("プレイリスト一覧")

    name = models.CharField(
        verbose_name="プレイリスト名",
        max_length=510,
        blank=False,
        unique=True,
    )

    contents = models.ManyToManyField(
        Content,
        verbose_name="コンテンツ",
        related_name="contents",
    )

    updated_at = models.DateTimeField(auto_now=True)

    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.contents.count()})"
