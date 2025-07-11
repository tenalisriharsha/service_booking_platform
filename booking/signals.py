from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Booking
from .utils.email_utils import send_booking_confirmation_email


@receiver(post_save, sender=Booking)
def send_booking_email_on_create(sender, instance, created, **kwargs):
    """
    Sends booking confirmation emails to the user and client when a new booking is created.
    """
    if created:
        send_booking_confirmation_email(instance)