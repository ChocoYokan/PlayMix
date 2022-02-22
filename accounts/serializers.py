from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Follow, User


# User = get_user_model()
class UserDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("id", "username", )

class FollowSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField(read_only=True)

    target = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Follow
        fields = (
            "user",
            "target",
        )

    def create(self, validated_data):
        user = self.context["request"].user
        follow_user = validated_data["target"]

        return Follow.objects.create(
            user=user,
            target=follow_user
        )

    def get_user(self, instance):
        return UserDetailSerializer(instance.user).data

    def get_target(self, instance):
        return UserDetailSerializer(instance.target).data
