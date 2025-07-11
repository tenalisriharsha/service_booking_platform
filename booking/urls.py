from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token as CustomAuthToken
from .views import (
    AvailabilityListCreateView,
    BookingCreateView,
    BookingListView,
    BookingUpdateView,
    MyAvailabilityView,
    clients_with_availability,
    WeeklyAvailabilityAPIView,
    ClientAvailabilityView
)

urlpatterns = [
    # Client: Add or View Own Availability
    path('availability/', AvailabilityListCreateView.as_view(), name='availability'),

    # User: Book a Slot
    path('book/', BookingCreateView.as_view(), name='book'),

    # User or Client: View Bookings
    path('bookings/', BookingListView.as_view(), name='bookings-list'),

    # User or Client: Cancel or Reschedule Booking
    path('booking/<int:pk>/update/', BookingUpdateView.as_view(), name='booking-update'),

    # Authenticated Client: View Own Availability
    path('my-availability/', MyAvailabilityView.as_view(), name='my-availability'),

    # Public: List Clients with Availability
    path('clients-with-availability/', clients_with_availability, name='clients-with-availability'),

    path('weekly-availability/', WeeklyAvailabilityAPIView.as_view(), name='weekly-availability'),
    path('booking/weekly-availability/', WeeklyAvailabilityAPIView.as_view(), name='weekly-availability-alias'),

    path('client/login/', CustomAuthToken, name='client-login'),

    path('availability/client/<int:client_id>/', ClientAvailabilityView.as_view(), name='client-availability'),
]