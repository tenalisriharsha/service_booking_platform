from django.core.mail import send_mail

# Reusable helper for sending a single email
def send_booking_email(recipient_email, subject, message):
    send_mail(
        subject,
        message,
        'tenalisriharsha2@gmail.com',  # Make sure this is configured in EMAIL_HOST_USER
        [recipient_email],
        fail_silently=False,
    )

# Sends booking confirmation email to both user and client
def send_booking_confirmation_email(booking):
    user_email = booking.user.email
    client_email = booking.availability.client.email

    subject = f"Booking Confirmation (Booking ID: {booking.id})"
    message = (
        f"Hi,\n\n"
        f"Your booking (ID: {booking.id}) has been confirmed.\n"
        f"Date: {booking.availability.date}\n"
        f"Time: {booking.availability.start_time} to {booking.availability.end_time}\n"
        f"Service Provider: {booking.availability.client.get_full_name()}\n\n"
        f"Thank you!"
    )

    send_booking_email(user_email, subject, message)
    send_booking_email(client_email, subject, message)