from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        MANAGER = 'manager', 'Manager'
        GATE_GUARD='gate_guard', 'Gate Guard'
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.GATE_GUARD)

  