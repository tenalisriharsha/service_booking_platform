from rest_framework import serializers
from .models import Availability, Booking


class AvailabilitySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='client.username', read_only=True)

    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['client']


class BookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    client_id = serializers.IntegerField(source='availability.client.id', read_only=True)
    start_time = serializers.TimeField(required=True)
    end_time = serializers.TimeField(required=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'availability', 'status', 'created_at',
            'start_time', 'end_time', 'duration',
            'user_email', 'username', 'client_id'
        ]
        read_only_fields = ['user', 'status', 'created_at']


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status', 'availability', 'start_time', 'end_time', 'duration']
