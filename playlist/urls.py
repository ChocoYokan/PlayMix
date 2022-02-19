from django.urls import path

from playlist.views import PlayListDetail, PlayLists

app_name = 'playlist'

urlpatterns = [
    path("playlist/", PlayLists.as_view(), name="playlist"),
    path("playlist/<int:pk>/", PlayListDetail.as_view(), name="playlist_list"),
]
