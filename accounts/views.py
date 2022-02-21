from django.contrib.auth import get_user_model
from rest_framework import viewsets

from accounts.models import Follow
from accounts.serializers import FollowSerializer

User = get_user_model()
        
class FollowDetailViewSet(viewsets.ModelViewSet):
    """
    フォローの編集・表示ができるエンドポイント
    """
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer

    def get_queryset(self):
        user = self.request.user
        return Follow.objects.filter(user=user)
