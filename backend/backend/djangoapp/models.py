from django.db import models

class BlacklistedToken(models.Model):
    jti = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.jti
