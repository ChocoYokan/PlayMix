from rest_framework import routers

from playlist.views import ContentViewSet, PlayListViewSet

app_name = 'playlist'

router = routers.DefaultRouter()
router.register(r'contents', ContentViewSet)
router.register(r'playlist', PlayListViewSet)
urlpatterns = router.urls
