from rest_framework import viewsets

from playlist.models import Content, PlayList
from playlist.serializers import (
    ContentsDetailSerializer,
    PlaylistSerializer,
    PlayListWriteSerializer,
)


class PlayListViewSet(viewsets.ModelViewSet):

    queryset = PlayList.objects.all()

    def get_queryset(self):
        """
        ログインしているユーザのプレイリスト情報を返す
        """
        user = self.request.user
        return PlayList.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action == "create":
            return PlayListWriteSerializer
        return PlaylistSerializer

class ContentViewSet(viewsets.ModelViewSet):
    
    queryset = Content.objects.all()
    serializer_class = ContentsDetailSerializer
