from django.urls import path
from .views import *

urlpatterns = [
    path("login/", MobileLoginView.as_view()),
    path("refresh/", MobileTokenRefreshView.as_view()),
    path("logout/", MobileLogoutView.as_view()),
    path("me/", MobileMeView.as_view()),
]