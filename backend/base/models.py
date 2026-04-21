# base/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


# ─────────────────────────────────────────────
# 🔧 CUSTOM USER MANAGER
# ─────────────────────────────────────────────
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email).lower().strip()

        # 🔐 Prevent accidental username="" bug
        username = extra_fields.get("username")
        if username == "":
            extra_fields["username"] = None

        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()  # 🔥 Important for OAuth users

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("needs_username", False)

        if not password:
            raise ValueError("Superuser must have a password.")

        return self.create_user(email, password, **extra_fields)


# ─────────────────────────────────────────────
# 👤 USER MODEL
# ─────────────────────────────────────────────
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('participant', 'Participant'),
        ('organiser', 'Organiser'),
        ('external', "External")
    ]

    # 🔥 PRIMARY IDENTITY
    email = models.EmailField(unique=True)

    # 🔥 OPTIONAL USERNAME (NULL SAFE)
    username = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True
    )

    # 🔐 AUTH FLOW FLAGS
    needs_username = models.BooleanField(default=True)
    is_google_user = models.BooleanField(default=False)

    # 🔐 ROLE SYSTEM
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='participant'
    )

    # 🔥 CRITICAL CONFIG
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    # 🔧 MANAGER
    objects = UserManager()

    # ─────────────────────────────────────────
    # 🔐 SECURITY HELPERS
    # ─────────────────────────────────────────
    def has_password(self):
        return self.has_usable_password()

    def is_oauth_only(self):
        return self.is_google_user and not self.has_usable_password()

    # ─────────────────────────────────────────
    # 🧾 STRING REPRESENTATION
    # ─────────────────────────────────────────
    def __str__(self):
        return f"{self.email} ({self.role})"