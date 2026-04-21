from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class CookiesJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')

        if not access_token:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
        except Exception:
            return None  # 🔐 invalid/expired token silently ignored

        try:
            user = self.get_user(validated_token)
        except AuthenticationFailed:
            return None

        # 🔐 OPTIONAL: Block inactive users
        if not user.is_active:
            return None

        return (user, validated_token)