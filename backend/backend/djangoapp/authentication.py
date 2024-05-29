# djangoapp/authentication.py
from .serializers import CustomUser
from .models import BlacklistedToken

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from pymongo import MongoClient
from bson import ObjectId
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class MongoJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
            jti = validated_token['jti']

     
            client = MongoClient('mongodb+srv://aniketwani1729:6Pj1S6l5OBoF4oGG@cluster0.4bwrce0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
            db = client['users']
            collection = db['users']
            blacklist_collection = db['blacklisted_tokens']
            
            if blacklist_collection.find_one({'jti': jti}):
                raise InvalidToken(_('Token is blacklisted'))
       
            user = collection.find_one({'_id': ObjectId(user_id)})
            user['is_authenticated'] = True
            if not user:
                raise InvalidToken(_('User not found'))
            
            return CustomUser(user)
              
        except Exception:
            raise InvalidToken(_('User not found'))
