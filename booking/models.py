from django.db import models
from django.conf import settings
from pytz import all_timezones

User = settings.AUTH_USER_MODEL

class Availability(models.Model):
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    timezone = models.CharField(max_length=50, choices=[(tz, tz) for tz in all_timezones])
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.client.username} - {self.date} ({self.start_time} to {self.end_time})"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    availability = models.ForeignKey(Availability, on_delete=models.CASCADE, related_name='bookings')
    start_time = models.TimeField(help_text="Start time of the booking")
    end_time = models.TimeField(help_text="End time of the booking")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')
    created_at = models.DateTimeField(auto_now_add=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes", default=30)

    def __str__(self):
        return f"{self.user.username} booked {self.availability.client.username} on {self.availability.date} from {self.start_time} to {self.end_time} ({self.duration} mins)"
