from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RefreshTokenView,TokenCheckView,SignupView, LoginView,LogoutView, StockPriceView, GetStockView, AddStockView, DeleteStockView
from .token  import CustomTokenObtainPairView

urlpatterns = [
   path('api/refresh',RefreshTokenView.as_view(),name='refresh'),
    path('api/check',TokenCheckView.as_view(),name='check'),
    path('api/register', SignupView.as_view(), name='signup'),
    path('api/login', LoginView.as_view(), name='login'),
    path('api/token', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
   path('api/logout', LogoutView.as_view(), name='logout'),
    path('api/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/price', StockPriceView.as_view(), name='stock_price'),
    path('api/stocks', GetStockView.as_view(), name='get_stock'),
    path('api/add', AddStockView.as_view(), name='add_stock'),
    path('api/delete', DeleteStockView.as_view(), name='delete_stock'),

]
