from django.urls import path

from accounts.views import FollowDetailViewSet, UserDetail, Users

view_name = "accounts"

urlpatterns = [
    path("users/", Users.as_view(), name="users"),
    path("users/<int:pk>/", UserDetail.as_view(), name="user_detail"),
    path("follow/<int:pk>/", FollowDetailViewSet.as_view(), name="follow_detail"),
]
