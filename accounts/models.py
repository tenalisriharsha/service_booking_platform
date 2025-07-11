from django.contrib.auth.models import AbstractUser
from django.db import models
import pytz  # Make sure pytz is installed

from datetime import datetime

class CustomUser(AbstractUser):
    role = models.CharField(max_length=50, default='client')
    timezone = models.CharField(
        max_length=50,
        choices=[(tz, tz) for tz in pytz.all_timezones],
        default='UTC'
    )
    client_role = models.CharField(max_length=100, blank=True, null=True, help_text="Custom description of the client's role (free text)")

    @property
    def current_time(self):
        tz = pytz.timezone(self.timezone)
        return datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S %Z%z')

    def __str__(self):
        role_display = f"{self.username} ({self.role})"
        if self.role == 'client' and self.client_role:
            return f"{role_display} - {self.client_role}"
        return role_display