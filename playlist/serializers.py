from rest_framework import serializers

from playlist.models import PlayList


class PlaylistSerializer(serializers.ModelSerializer):

    contents = serializers.HyperlinkedModelSerializer(
        read_only=True,
        many=True,
    )

    class Meta:
        model = PlayList
        fields = ["name", "contents", "updated_at", "created_at"]
