from django.urls import path, include
from rest_framework import routers
from accounts.views import FollowDetailViewSet, FollowerDetailViewSet

view_name = "accounts"

router = routers.DefaultRouter()
router.register(r"follow", FollowDetailViewSet)
router.register(r"follower", FollowerDetailViewSet)
