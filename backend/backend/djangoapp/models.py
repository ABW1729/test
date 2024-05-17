from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
class User(AbstractBaseUser):
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    stocks = JSONField(default=dict)
