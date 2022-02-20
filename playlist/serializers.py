from dataclasses import fields

from rest_framework import serializers

from playlist.models import Content, PlayList


class ContentsDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Content
        fields = "__all__"

class PlaylistSerializer(serializers.ModelSerializer):

    contents = ContentsDetailSerializer(
        many=True,
    )

    class Meta:
        model = PlayList
        fields = ("name", "contents", "updated_at", "created_at")

class PlayListWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = PlayList
        fields = ("id", "user", "name",)

    def create(self, validated_data):
        user = self.context["request"].user
        name = validated_data["name"]

        return PlayList.objects.create(
            user=user,
            name=name,
        )
