from .models import BlacklistedToken
import jwt
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from django.contrib.auth.hashers import check_password
from .serializers import UserSerializer
from pymongo import MongoClient
import requests
import json

from rest_framework_simplejwt.exceptions import TokenError
from bson.objectid import ObjectId


client = MongoClient('mongodb+srv://aniketwani1729:6Pj1S6l5OBoF4oGG@cluster0.4bwrce0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['users']
collection = db['users']
api_key = 'NVCLY86372DZJZTN'


class MongoJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]


            user = collection.find_one({'_id': ObjectId(user_id)})
            if not user:
                raise InvalidToken(_('User not found'))

            return user
        except Exception:
            raise InvalidToken(_('User not found'))

class TokenCheckView(APIView):
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'message': 'Token not provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the token using SimpleJWT
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = collection.find_one({'_id': ObjectId(user_id)})
            if user:
                return Response({'message': 'Token is valid'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except TokenError as e:
            return Response({'message': str(e)}, status=status.HTTP_401_UNAUTHORIZED)





class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User signed up successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)







class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'message': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = refresh.access_token
            return Response({
                'access': str(access_token),
                'access_expiry': access_token.lifetime.total_seconds()  # Send access token expiry
            })
        except Exception as e:
            return Response({'message': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)




class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = collection.find_one({'email': email})
        if user and check_password(password, user['password']):
            user_id = str(user['_id'])  # Convert ObjectId to string
            refresh = RefreshToken()
            refresh['user_id'] = user_id  # Manually add user_id to the token payload
            access_token = refresh.access_token
            return Response({
                'message': 'Login success',
                'refresh': str(refresh),
                'access': str(access_token),
                'access_expiry': access_token.lifetime.total_seconds()  # Send access token expiry
            })
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class StockPriceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symbol = request.data.get('symbol')
        url = f'http://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return Response({'symbol': symbol, 'latest_price': data}, status=status.HTTP_200_OK)
        return Response({'message': 'Failed to retrieve stock price'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetStockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.user.email
        user = collection.find_one({'email': email})
        if user:
            stocks = user.get('stocks', {})
            return Response({'message': 'Stocks retrieved successfully', 'stocks': stocks}, status=status.HTTP_200_OK)
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class AddStockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print(request.user)
        email = request.user.email
        stocks_data = request.data.get('stocks', {})
        user = collection.find_one({'email': email})

        if not user:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        added_stocks = []
        already_existing_stocks = []

        for symbol, stock_data in stocks_data.items():
            name = stock_data.get('name')
            try:
                stock_data_response = stock_price(symbol)
                if 'Global Quote' in stock_data_response:
                    price = stock_data_response['Global Quote'].get('05. price')
                else:
                    info = stock_data_response.get('Information', 'Stock information not available')
                    return Response({'message': info}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'message': f'Error processing stock symbol {symbol}: {e}'}, status=status.HTTP_400_BAD_REQUEST)

            if symbol in user.get('stocks', {}):
                already_existing_stocks.append(symbol)
            else:
                collection.update_one(
                    {'email': email},
                    {'$set': {f'stocks.{symbol}': {'name': name, 'price': price}}}
                )
                added_stocks.append(symbol)

        return Response({
            'message': 'Stocks processed',
            'added_stocks': added_stocks,
            'already_existing_stocks': already_existing_stocks
        }, status=status.HTTP_200_OK)

class DeleteStockView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        email = request.user.email
        print(request.user)
        stock_data = request.data.get('stocks')
        if not stock_data:
            return Response({'message': 'No stocks provided'}, status=status.HTTP_400_BAD_REQUEST)

        user = collection.find_one({'email': email})
        if not user:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        removed_stocks = []
        not_found_stocks = []

        for stock_symbol in stock_data:
            if stock_symbol in user.get('stocks', {}):
                collection.update_one({'email': email}, {'$unset': {f'stocks.{stock_symbol}': ""}})
                removed_stocks.append(stock_symbol)
            else:
                not_found_stocks.append(stock_symbol)

        return Response({
            'message': 'Stocks processed',
            'removed_stocks': removed_stocks,
            'not_found_stocks': not_found_stocks
        }, status=status.HTTP_200_OK)





def stock_price(symbol):
    url = f'http://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    return None


def blacklist_token(jti):
    db = client['users']
    blacklisted_tokens = db['blacklisted_tokens']
    blacklisted_tokens.insert_one({'jti': jti})
    print(1)



class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data['refresh']

            # Decode the refresh token to extract information
            decoded_token = jwt.decode(refresh_token, options={"verify_signature": False})

            # Extract the jti (JWT ID) from the decoded token
            jti = decoded_token.get('jti')

            # Perform your blacklist logic here using the jti
            blacklist_token(jti)    
            return Response(status=200)
        except jwt.ExpiredSignatureError:
            return Response(status=400, data='Token has expired')
        except jwt.InvalidTokenError:
            return Response(status=400, data='Invalid token')
        except Exception as e:
            return Response(status=400, data=str(e))
