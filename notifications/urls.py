from django.urls import path
from .views import notify_booking

urlpatterns = [
    path('notify_booking/', notify_booking),
]