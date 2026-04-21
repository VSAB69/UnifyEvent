# base/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ─────────────────────────────────────────────
# 🧾 REGISTER SERIALIZER (EMAIL FIRST)
# ─────────────────────────────────────────────
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User
        fields = ['email', 'password', 'role', 'username']
        extra_kwargs = {
            "username": {"required": False, "allow_blank": True},
        }

    # 🔐 EMAIL VALIDATION
    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")

        return value

    # 🔐 USERNAME VALIDATION (SAFE + NORMALIZED)
    def validate_username(self, value):
        if not value:
            return None

        value = value.strip().lower()

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username unavailable")

        return value

    # 🔐 ROLE VALIDATION
    def validate_role(self, value):
        if value in ("", None):
            return "participant"
        return value

    # 🔐 CREATE USER (HARDENED)
    def create(self, validated_data):
        password = validated_data.pop("password")
        role = validated_data.pop("role", "participant")
        username = validated_data.get("username")
        email = validated_data.get("email").lower().strip()

        user = User(
            email=email,
            username=username if username else None,
            role=role,
            needs_username=True
        )

        # 🔥 PASSWORD VALIDATION (CRITICAL)
        validate_password(password, user)

        user.set_password(password)
        user.save()

        return user


# ─────────────────────────────────────────────
# 🔐 LOGIN SERIALIZER (EMAIL BASED JWT)
# ─────────────────────────────────────────────
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")

        if email:
            email = email.lower().strip()
            attrs["email"] = email
            attrs["username"] = email

        data = super().validate(attrs)

        return data


# ─────────────────────────────────────────────
# 👤 USER SERIALIZER
# ─────────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    has_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'needs_username',
            'has_password'
        ]

    def get_has_password(self, obj):
        return obj.has_usable_password()