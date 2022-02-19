from rest_framework import serializers

from playlist.models import Content, PlayList


class PlaylistSerializer(serializers.ModelSerializer):

    contents = serializers.HyperlinkedRelatedField(
        view_name='contents-detail',
        read_only=True,
        many=True,
    )

    class Meta:
        model = PlayList
        fields = ["name", "contents", "updated_at", "created_at"]

class ContentsDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = Content
        fields = ["user", "name", "updated_at", "created_at"]
