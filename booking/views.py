from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Availability, Booking
from .serializers import (
    AvailabilitySerializer,
    BookingSerializer,
    BookingUpdateSerializer
)
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from pytz import timezone as pytz_timezone
from accounts.models import CustomUser
from rest_framework import serializers
from booking.utils.time_utils import is_booking_conflicting

# ---------- Custom Role Permissions ---------- #

class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'


class IsUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'user'


# ---------- Availability Views (For Clients) ---------- #

class AvailabilityListCreateView(generics.ListCreateAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_queryset(self):
        return Availability.objects.filter(client=self.request.user)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


# ---------- Booking Views (For Users and Clients) ---------- #

class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsUser]

    def perform_create(self, serializer):
        data = self.request.data
        user = self.request.user

        availability_id = data.get("availability")
        start_time_str = data.get("start_time")
        end_time_str = data.get("end_time")
        duration = int(data.get("duration", 30))

        if not availability_id:
            raise serializers.ValidationError("availability is required.")

        try:
            availability = Availability.objects.get(id=availability_id)
        except Availability.DoesNotExist:
            raise serializers.ValidationError("Selected availability does not exist.")

        # Fallback logic: if start_time or end_time not provided, auto-fill from availability and duration
        availability_start_dt = datetime.combine(availability.date, availability.start_time)
        availability_end_dt = datetime.combine(availability.date, availability.end_time)

        if not start_time_str:
            start_time_str = availability_start_dt.strftime('%H:%M:%S')
        if not end_time_str:
            end_dt = availability_start_dt + timedelta(minutes=duration)
            end_time_str = end_dt.strftime('%H:%M:%S')

        if not all([start_time_str, end_time_str]):
            raise serializers.ValidationError("start_time and end_time are required.")

        tz = pytz_timezone(availability.timezone)
        availability_start = make_aware(datetime.combine(availability.date, availability.start_time), timezone=tz)
        availability_end = make_aware(datetime.combine(availability.date, availability.end_time), timezone=tz)
        requested_start = make_aware(datetime.strptime(f"{availability.date} {start_time_str}", "%Y-%m-%d %H:%M:%S"), timezone=tz)
        requested_end = make_aware(datetime.strptime(f"{availability.date} {end_time_str}", "%Y-%m-%d %H:%M:%S"), timezone=tz)

        if not (availability_start <= requested_start < requested_end <= availability_end):
            raise serializers.ValidationError("Booking times must be within availability range.")

        if is_booking_conflicting(availability, requested_start.time(), requested_end.time()):
            raise serializers.ValidationError("This time overlaps with an existing booking.")

        duration = int((requested_end - requested_start).total_seconds() // 60)
        serializer.save(user=user, duration=duration, start_time=requested_start.time(), end_time=requested_end.time())


class BookingListView(generics.ListAPIView):
    """
    Returns:
        - For users: their own bookings
        - For clients: bookings linked to their availabilities
        - For admins or staff: all bookings
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return Booking.objects.all()
        if getattr(user, 'role', None) == 'user':
            return Booking.objects.filter(user=user)
        elif getattr(user, 'role', None) == 'client':
            return Booking.objects.filter(availability__client=user)
        return Booking.objects.none()


# ---------- Booking Update View (Reschedule / Cancel) ---------- #

class BookingUpdateView(generics.UpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        booking = self.get_object()
        user = request.user

        if user != booking.user and user != booking.availability.client:
            return Response({"detail": "Not authorized."}, status=403)

        new_status = request.data.get("status")
        new_availability_id = request.data.get("availability")

        try:
            tz = pytz_timezone(booking.availability.timezone)
            booking_datetime = make_aware(
                datetime.combine(booking.availability.date, booking.availability.start_time),
                timezone=tz
            )
        except Exception as e:
            return Response({"error": f"Timezone parsing failed: {str(e)}"}, status=400)

        now = datetime.now(tz)
        if booking_datetime - now < timedelta(hours=12):
            return Response({"error": "Changes must be made at least 12 hours before appointment."}, status=400)

        if new_status == "cancelled":
            booking.status = "cancelled"
            booking.save()
            return Response({"message": "Booking cancelled successfully."})

        if new_availability_id:
            if user.role != 'user':
                return Response({"error": "Only users can reschedule bookings."}, status=403)
            try:
                new_slot = Availability.objects.get(id=new_availability_id)
                booking.availability = new_slot
                booking.status = "rescheduled"
                booking.save()
                return Response({"message": "Booking rescheduled successfully."})
            except Availability.DoesNotExist:
                return Response({"error": "New availability not found."}, status=400)

        return Response({"error": "Invalid update request."}, status=400)


# ---------- My Availability View (Authenticated User) ---------- #

class MyAvailabilityView(generics.ListAPIView):
    serializer_class = AvailabilitySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(client=self.request.user)


# ---------- Client List With Availabilities View ---------- #

class ClientWithAvailabilitySerializer(serializers.ModelSerializer):
    availabilities = AvailabilitySerializer(many=True, source='availability_set', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'availabilities']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def clients_with_availability(request):
    clients = CustomUser.objects.filter(role='client')
    result = []

    for client in clients:
        availabilities = Availability.objects.filter(client=client)
        if availabilities.exists():
            result.append({
                'client': {
                    'id': client.id,
                    'username': client.username,
                    'email': client.email
                },
                'availabilities': AvailabilitySerializer(availabilities, many=True).data
            })

    return Response(result)


# ---------- Weekly Availability API View ---------- #

class WeeklyAvailabilityAPIView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def post(self, request):
        user = request.user
        weekly_availability = request.data.get('weekly_availability', [])
        timezone = request.data.get('timezone')

        if not weekly_availability:
            return Response({"error": "No availability data provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: Clear existing entries for that week's range (implement logic if needed)
        # Availability.objects.filter(client=user, ...).delete()

        for slot in weekly_availability:
            if not slot.get("date"):
                return Response({"error": "Each slot must include a date."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = AvailabilitySerializer(data={
                "start_time": slot.get("start_time"),
                "end_time": slot.get("end_time"),
                "hourly_rate": slot.get("price_per_hour"),
                "timezone": timezone,
                "date": slot.get("date")
            })
            if serializer.is_valid():
                serializer.save(client=user)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Weekly availability saved successfully."}, status=status.HTTP_201_CREATED)


# ---------- Client Availability by ID View (For Public Access) ---------- #

class ClientAvailabilityView(generics.ListAPIView):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.kwargs.get('client_id')
        return Availability.objects.filter(client__id=client_id)
