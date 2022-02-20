from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Follow

User = get_user_model()

class FollowSerializer(serializers.HyperlinkedModelSerializer):

    
    
    class Meta:
        model = Follow
        fields = (
            "user",
            "target",
            "created_at",
        )
