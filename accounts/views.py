from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, viewsets
from rest_framework.generics import CreateAPIView, ListAPIView

from accounts.models import Follow
from accounts.serializers import FollowSerializer

User = get_user_model()

# class Users(CreateAPIView):
#     """
#     ユーザの作成ができるエンドポイント
#     """
#     queryset = User.objects.filter(is_active=True)
#     serializer_class = UserSerializer

# class UserDetail(generics.RetrieveUpdateDestroyAPIView):
#     """
#     ユーザの編集・表示ができるエンドポイント
#     """

#     queryset = User.objects.filter(is_active=True)
#     serializer_class = UserSerializer
        
class FollowDetailViewSet(ListAPIView):
    """
    フォローの編集・表示ができるエンドポイント
    """

    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permissions_class = [None]
