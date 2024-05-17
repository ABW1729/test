# views.py
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import UserProfile, Stock, Watchlist

def update_password(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        new_password = request.POST.get('new_password')

        try:
            user = UserProfile.objects.using('mongo_database').get(user_id=user_id)
            user.password = make_password(new_password)  # Hash the new password
            user.save()
            return JsonResponse({'message': 'Password updated successfully'}, status=200)
        except UserProfile.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)

def update_watchlist(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        stock_symbols = request.POST.getlist('stocks')

        user_profile = get_object_or_404(UserProfile, user_id=user_id)
        watchlist, _ = Watchlist.objects.using('mongo_database').get_or_create(user=user_profile)

        # Clear existing watchlist
        watchlist.stocks.clear()

        # Add new stocks
        for symbol in stock_symbols:
            stock, _ = Stock.objects.using('mongo_database').get_or_create(code=symbol)
            watchlist.stocks.add(stock)

        return JsonResponse({'message': 'Watchlist updated successfully'}, status=200)
    else:
        return JsonResponse({'message': 'Method Not Allowed'}, status=405)

