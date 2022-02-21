from rest_framework import routers

from accounts.views import FollowDetailViewSet

view_name = "accounts"

router = routers.DefaultRouter()
router.register(r"follow", FollowDetailViewSet)
