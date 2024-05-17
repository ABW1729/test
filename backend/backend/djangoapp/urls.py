from django.urls import path
from . import views
urlpatterns=[path('',views.index,name='index'),
 path('api/add', views.add_stock, name='add_stock'),
 path('api/delete', views.delete_stock, name='delete_stock'),
 path('api/check_token',views.check_token,name='check_token'),
  path('api/login',views.login_view,name='login'),
   path('api/logout',views.logout_view,name='logout'),
   path('api/register',views.signup_view,name='signup'),
   path('api/stocks',views.get_stock,name='stock'),
   
]
