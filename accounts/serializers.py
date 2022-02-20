from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Follow

User = get_user_model()

# class UserSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = User
#         fields = (
#             "id",
#             "username",
#             "email",
#         )

#     def validate_password(self,value:str) ->str:
#         """
#         パスワードをハッシュ値に変換する
#         """
#         return make_password(value)


class FollowSerializer(serializers.HyperlinkedModelSerializer):

    
    
    class Meta:
        model = Follow
        fields = (
            "user",
            "target",
            "created_at",
        )
