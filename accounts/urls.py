from django.urls import path

from accounts.views import UserList

urlpatterns = [
    path("users/", UserList.as_view()),
]
