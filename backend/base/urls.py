from django.urls import path
from .views import *


urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', logout, name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('register/', register, name='register'),
    path('authenticated/', is_logged_in, name='authenticated'),
    path("google/", google_login),
    path("set-username/", set_username),
    path("set-password/", set_password),
]
