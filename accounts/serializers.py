from rest_framework import serializers
from django.contrib.auth import get_user_model
from booking.models import Booking

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    client_role = serializers.CharField(allow_blank=True, allow_null=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'timezone', 'client_role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        # Handle password hashing on update as well
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# Booking serializer with booked_by as username string
class BookingSerializer(serializers.ModelSerializer):
    booked_by = serializers.StringRelatedField()

    class Meta:
        model = Booking
        fields = '__all__'