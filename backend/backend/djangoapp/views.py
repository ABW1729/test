from django.shortcuts import render
from django.contrib.auth.hashers import make_password
from django.http import HttpResponseRedirect
from django.contrib.auth.hashers import check_password
from django.http import HttpResponse
from django.http import JsonResponse
from pymongo import MongoClient
from django.views.decorators.csrf import csrf_exempt
import uuid,json
import requests
from datetime import datetime, timedelta
def index(request):
	return HttpResponse("<h1>Hello</h1>")
import pymongo
client=pymongo.MongoClient('mongodb+srv://aniketwani1729:6Pj1S6l5OBoF4oGG@cluster0.4bwrce0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

db=client['users']
collection=db['users']
user_tokens = {}

# Dictionary to store invalidated tokens
invalid_tokens = set()

# Token expiry duration in seconds
TOKEN_EXPIRY_DURATION = 3600  # 1 hour (adjust as needed)

api_key='SU3EI8TDJ9BCKSP6'


def stock_price(symbol):
    url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&interval=5min&apikey={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
       
        return data['Global Quote']['05. price']
        
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return None
 

def extract(cookie_value):
    token, email = cookie_value.split('$')
    return token, email
       
def get_stock_price(request):
    if request.method == 'POST':
        data=json.loads(request.body)
        symbol = data.get('symbol')
        api_key = 'SU3EI8TDJ9BCKSP6' 
        
        latest_price = stock_price(symbol, api_key)
        if latest_price:
            return JsonResponse({'symbol': symbol, 'latest_price': latest_price}, status=200)
        else:
            return JsonResponse({'message': 'Failed to retrieve stock price'}, status=500)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)

def is_token_valid(token):
    # Check if the token is in the invalid tokens set
    if token in invalid_tokens:
        return False, "Token invalidated"

    # Check if the token is in the user tokens dictionary
    if token not in user_tokens:
        return False, "Token not found"

    # Retrieve the token's expiry timestamp
    expiry_timestamp = user_tokens[token]

    # Check if the token has expired
    if datetime.now() > expiry_timestamp:
        return False, "Token expired"

    # Token is valid
    return True, "Token valid"

def check_token(request):
    if request.method == 'POST':
        data=json.loads(request.body)
        token = data.get('token')

        # Check if the token is valid
        is_valid, message = is_token_valid(token)

        if is_valid:
            return JsonResponse({'message': 'Token valid'}, status=200)
        else:
            return JsonResponse({'message': message}, status=401)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)
        
def signup_view(request):
    if request.method == 'POST':
        # Assuming the client sends email, password, name, and email for signup
        data=json.loads(request.body)

        password = data.get('password')
        name = data.get('name')
        email = data.get('email')

        # Check if email already exists in MongoDB
        existing_user = collection.find_one({'email':email})
        if existing_user:
            return JsonResponse({'message': 'User already exists'}, status=400)

        # Hash the password
        hashed_password = make_password(password)

        # Store user data in MongoDB
        user_data = {
            'password': hashed_password,
            'name': name,
            'email': email,
             'stocks': []
            
        }
        collection.insert_one(user_data)

        return JsonResponse({'message': 'User signed up successfully'}, status=201)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)

def login_view(request):
    if request.method == 'POST':
        # Assuming the client sends email and password for authentication
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        user = collection.find_one({'email': email})
        # Perform authentication
        if user and check_password(password, user['password']):
            # Check if user already has a token
            if email in user_tokens:
                return HttpResponseRedirect('/')
            else:
                # Generate a unique token for the user
                token = str(uuid.uuid4())
                # Concatenate username with token using a delimiter
                token_with_username = f"{token}${email}"

                # Calculate token expiry timestamp (example: token expires in 24 hours)
                expiry_timestamp = datetime.now() + timedelta(hours=24)

                # Store the token and its expiry timestamp
                user_tokens[email] = {'token': token, 'expiry_timestamp': expiry_timestamp}
                print(user_tokens)
                response = JsonResponse({'message': 'Login Success','token':token_with_username,'expiry_timestamp':expiry_timestamp} ,status=200)
                
                return response
        else:
            return JsonResponse({'message': 'Invalid credentials'}, status=401)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)


def logout_view(request):
    if request.method == 'POST':
        # Assuming the client sends the token and email for the current session
        data=json.loads(request.body)
        token,email = extract(data.get('token'))
        

        # Check if the token and email are provided
        if not token or not email:
            return JsonResponse({'message': 'Token and email are required'}, status=400)

        # Check if the provided token matches the token stored for the email
        if email in user_tokens and user_tokens[email]['token'] == token:
            # Invalidate the token by removing it from the user_tokens dictionary
            del user_tokens[email]
            # Add the token to the invalid_tokens set to prevent further use
            invalid_tokens.add(token)

            # Remove the token cookie by setting its expiration time to a past date
            response = HttpResponse({'message': 'Logout successful'}, status=200)
            return response
        else:
            return JsonResponse({'message': 'Invalid token'}, status=401)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)
    
def get_stock(request):
    if request.method == 'POST':
        # Assuming the client sends the token and email for the current session
        data = json.loads(request.body)
        token,email = extract(data.get('token'))

        # Check if the token and email are provided
        if not token or not email:
            return JsonResponse({'message': 'Bad Request - Token and email required'}, status=400)

        # Check if the provided token matches the token stored for the email
        if email in user_tokens and user_tokens[email]['token'] == token:
            # Fetch user document from the database
            user = collection.find_one({'email': email})
            if user:
                # Retrieve the user's stocks
                stocks = user.get('stocks', {})
                # Construct the response with user's stocks
                response_data = {
                    'message': 'Stocks retrieved successfully',
                    'stocks': stocks
                }
                return JsonResponse(response_data, status=200)
            else:
                return JsonResponse({'message': 'User not found'}, status=404)
        else:
            print(user_tokens)
            return JsonResponse({'message': 'Invalid token'}, status=401)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)

def validate_token(request):
 if request.method == 'POST':
    data=json.loads(request.body)
    token,email = extract(data.get('token'))
    # Check if the token is in the invalid tokens set
    if token in invalid_tokens:
        return False
    
    # Check if the token is in the user tokens dictionary
    if email in user_tokens and user_tokens[email]['token'] == token:
        # Retrieve the token's expiry timestamp
        expiry_timestamp = user_tokens[email]['expiry_timestamp']
        # Check if the token has expired
        if expiry_timestamp > datetime.now():
            return True
    
    return False
    
def add_stock(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token, email = extract(data.get('token'))
        if not email in user_tokens or user_tokens[email]['token'] != token:
            return JsonResponse({'message': 'Relogin'}, status=401)

        stocks_data = data.get('stocks', {})
        
        try:
            user = collection.find_one({'email': email})
            if user:
                for symbol, stock_data in stocks_data.items():
                    name = stock_data.get('name')
                    if symbol in user.get('stocks', {}):
                        return JsonResponse({'message': f'Stock {symbol} already in user\'s list'}, status=400)
                    collection.update_one({'email': email}, {'$set': {f'stocks.{symbol}': {'name': name, 'price': stock_price(symbol)}}})
                
                return JsonResponse({'message': 'Stocks added successfully'}, status=200)
            else:
                return JsonResponse({'message': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)


def delete_stock(request):
    if request.method == 'POST':
        data=json.loads(request.body)
        token,email = extract(data.get('token'))
        if  not email in user_tokens or  user_tokens[email]['token'] != token:
            return JsonResponse({'message': 'Relogin'}, status=401)

        
        stock_data = data.get('stocks')

        try:
            user=collection.find_one({'email': email})
            if user:
                # Check if the stock exists in the user's stock list
              for stock_symbol in stock_data:
                if stock_symbol in user.get('stocks', []):
                    # Update the user document to remove the stock from the stocks array
                    collection.update_one({'email': email},{'$unset': {f'stocks.{stock_symbol}': ""}})
                    return JsonResponse({'message': 'Stock removed successfully'}, status=200)
                else:
                    return JsonResponse({'message': 'Stock not found in user\'s list'}, status=400)
            else:
                return JsonResponse({'message': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)  
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)

