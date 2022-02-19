from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.mixins import ListModelMixin

from playlist.models import PlayList
from playlist.serializers import PlaylistSerializer


class PlayLists(ListAPIView, CreateAPIView):

    queryset = PlayList.objects.all()
    serializer_class = PlaylistSerializer

    def get_queryset(self):
        """
        ログインしているユーザのプレイリスト情報を返す
        """
        user = self.request.user
        return PlayList.objects.filter(user=user)

class PlayListDetail(RetrieveUpdateDestroyAPIView):

    queryset = PlayList.objects.all()
    serializer_class = PlaylistSerializer
