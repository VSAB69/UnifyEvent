from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings

from base.serializers import UserSerializer

# 🔥 GOOGLE
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

User = get_user_model()


# ─────────────────────────────────────────────
# 🔐 MOBILE LOGIN (EMAIL BASED)
# ─────────────────────────────────────────────

class MobileLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("username")  # frontend sends as username
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=400
            )

        email = email.lower().strip()

        user = authenticate(request, username=email, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=401
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        })


# ─────────────────────────────────────────────
# 🔄 MOBILE TOKEN REFRESH
# ─────────────────────────────────────────────

class MobileTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


# ─────────────────────────────────────────────
# 🚪 MOBILE LOGOUT
# ─────────────────────────────────────────────

class MobileLogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {"error": "Invalid or expired refresh token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"success": True})


# ─────────────────────────────────────────────
# 👤 MOBILE CURRENT USER
# ─────────────────────────────────────────────

class MobileMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ─────────────────────────────────────────────
# 🔥 GOOGLE LOGIN (MOBILE)
# ─────────────────────────────────────────────

class MobileGoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token_str = request.data.get("id_token")

        if not id_token_str:
            return Response({"error": "No token provided"}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            email = idinfo.get("email").lower().strip()

        except Exception:
            return Response({"error": "Invalid Google token"}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": None,
                "is_google_user": True,
                "needs_username": True,
            }
        )

        if created:
            user.set_unusable_password()
            user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        })


# ─────────────────────────────────────────────
# 🧾 SET USERNAME
# ─────────────────────────────────────────────

class MobileSetUsernameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")

        if not username:
            return Response({"error": "Username required"}, status=400)

        username = username.strip()

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)

        user = request.user
        user.username = username
        user.needs_username = False
        user.save()

        return Response({"success": True})


# ─────────────────────────────────────────────
# 🔐 SET PASSWORD (NO VALIDATION)
# ─────────────────────────────────────────────

class MobileSetPasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get("password")

        if not password:
            return Response({"error": "Password required"}, status=400)

        user = request.user
        user.set_password(password)
        user.save()

        return Response({"success": True})