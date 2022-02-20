from django.urls import path

from accounts.views import FollowDetailViewSet

view_name = "accounts"

urlpatterns = [
    path("follow/<int:pk>/", FollowDetailViewSet.as_view(), name="follow_detail"),
]
