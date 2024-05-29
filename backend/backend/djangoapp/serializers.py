# serializers.py

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from pymongo import MongoClient

client = MongoClient('mongodb+srv://aniketwani1729:6Pj1S6l5OBoF4oGG@cluster0.4bwrce0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['users']
collection = db['users']

class UserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        # Hash the password
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['stocks'] = {}
        # Save the user in the MongoDB collection
        collection.insert_one(validated_data)
        return validated_data

    def validate_email(self, value):
        if collection.find_one({'email': value}):
            raise serializers.ValidationError("User with this email already exists.")
        return value


class CustomUser:
    def __init__(self, user_data):
        self.id = str(user_data['_id'])  # Make sure _id is converted to string
        self.email = user_data['email']
        self.is_authenticated = True

    def __str__(self):
        return self.email
