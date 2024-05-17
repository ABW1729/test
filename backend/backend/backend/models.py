# models.py
from djongo import models

class UserProfile(models.Model):
    user_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    mobile = models.CharField(max_length=15)
    password = models.CharField(max_length=128)  # Hashed password

    class Meta:
        db_table = 'user_profile'  # Collection name in MongoDB

    def __str__(self):
        return self.name

class Stock(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'stock'  # Collection name in MongoDB

    def __str__(self):
        return self.code

class Watchlist(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    stocks = models.ManyToManyField(Stock)

    class Meta:
        db_table = 'watchlist'  # Collection name in MongoDB

    def __str__(self):
        return f"Watchlist for {self.user}"

