# base/views.py

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .serializers import (
    UserRegisterSerializer,
    UserSerializer,
    EmailTokenObtainPairSerializer,
)

User = get_user_model()


# ─────────────────────────────────────────────
# 🍪 COOKIE HELPERS (PRODUCTION SAFE)
# ─────────────────────────────────────────────

def get_cookie_domain():
    return None  # local + flexible deploy


def is_secure_cookie():
    return not settings.DEBUG


def get_cookie_kwargs():
    return {
        "httponly": True,
        "secure": is_secure_cookie(),
        "samesite": "None" if is_secure_cookie() else "Lax",
        "path": "/",
        "domain": None,
    }


# ─────────────────────────────────────────────
# 🔐 REGISTER
# ─────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        user.needs_username = True
        user.save()

        return Response(
            {"success": True, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )

    return Response(
        {"success": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


# ─────────────────────────────────────────────
# 🔐 LOGIN
# ─────────────────────────────────────────────

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {"success": False, "message": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.user
        tokens = serializer.validated_data

        res = Response(
            {"success": True, "user": UserSerializer(user).data},
            status=status.HTTP_200_OK,
        )

        cookie_kwargs = get_cookie_kwargs()

        res.set_cookie("access_token", tokens["access"], **cookie_kwargs)
        res.set_cookie("refresh_token", tokens["refresh"], **cookie_kwargs)

        return res


# ─────────────────────────────────────────────
# 🔄 REFRESH
# ─────────────────────────────────────────────

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"refreshed": False, "message": "No refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)

        access = response.data.get("access")
        new_refresh = response.data.get("refresh")

        res = Response({"refreshed": True})

        cookie_kwargs = get_cookie_kwargs()

        res.set_cookie("access_token", access, **cookie_kwargs)

        if new_refresh:
            res.set_cookie("refresh_token", new_refresh, **cookie_kwargs)

        return res


# ─────────────────────────────────────────────
# 🚪 LOGOUT
# ─────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.COOKIES.get("refresh_token")

    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

    res = Response({"success": True})

    res.delete_cookie("access_token", path="/")
    res.delete_cookie("refresh_token", path="/")

    return res


# ─────────────────────────────────────────────
# 🔍 AUTH CHECK
# ─────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def is_logged_in(request):
    return Response(UserSerializer(request.user).data)


# ─────────────────────────────────────────────
# 🔐 GOOGLE LOGIN (HARDENED)
# ─────────────────────────────────────────────

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get("id_token")

    if not token:
        return Response({"success": False, "message": "No token"}, status=400)

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )

        email = idinfo.get("email")
        email_verified = idinfo.get("email_verified")

        if not email or not email_verified:
            return Response({"success": False}, status=400)

        email = email.lower().strip()

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create_user(
                email=email,
                password=None,
                username=None,
                is_google_user=True,
                needs_username=True,
            )
        else:
            if not user.is_google_user:
                user.is_google_user = True
                user.save()

        refresh = RefreshToken.for_user(user)

        res = Response({
            "success": True,
            "user": UserSerializer(user).data,
        })

        cookie_kwargs = get_cookie_kwargs()

        res.set_cookie("access_token", str(refresh.access_token), **cookie_kwargs)
        res.set_cookie("refresh_token", str(refresh), **cookie_kwargs)

        return res

    except Exception as e:
        print("GOOGLE ERROR:", str(e))
        return Response({"success": False}, status=500)


# ─────────────────────────────────────────────
# 👤 SET USERNAME
# ─────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_username(request):
    username = request.data.get("username")

    if not username:
        return Response({"error": "Username required"}, status=400)

    username = username.strip().lower()

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username unavailable"}, status=400)

    user = request.user
    user.username = username
    user.needs_username = False
    user.save()

    return Response({"success": True})


# ─────────────────────────────────────────────
# 🔐 SET PASSWORD
# ─────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_password(request):
    password = request.data.get("password")

    if not password:
        return Response({"error": "Password required"}, status=400)

    user = request.user

    # ❌ NO VALIDATION AT ALL
    user.set_password(password)
    user.save()

    return Response({"success": True})