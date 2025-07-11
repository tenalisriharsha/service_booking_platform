from django.urls import path
from .views import RegisterView, CustomAuthToken
from .views import RegisterView, CustomAuthToken, get_authenticated_user
from .views import get_client_by_id

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('api-token-auth/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('me/', get_authenticated_user, name='account-me'),
    path('clients/<int:id>/', get_client_by_id, name='client-detail'),
]
