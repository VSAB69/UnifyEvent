from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from base.serializers import UserSerializer

User = get_user_model()


# ─────────────────────────────────────────────
# MOBILE LOGIN
# ─────────────────────────────────────────────

class MobileLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")

        if not password or (not email and not username):
            return Response(
                {"error": "Email/username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = None

        # 🔥 Prefer email login
        if email:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        # 🔁 Fallback to username
        elif username:
            user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        })


# ─────────────────────────────────────────────
# MOBILE TOKEN REFRESH
# ─────────────────────────────────────────────

class MobileTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]


# ─────────────────────────────────────────────
# MOBILE LOGOUT
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
# MOBILE CURRENT USER
# ─────────────────────────────────────────────

class MobileMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)