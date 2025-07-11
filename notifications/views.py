from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from booking.models import Booking
from .email_utils import send_booking_email

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notify_booking(request):
    booking_id = request.data.get('booking_id')

    if not booking_id:
        return Response({"error": "Missing booking_id."}, status=400)

    try:
        booking = Booking.objects.select_related('user', 'availability__client').get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found."}, status=404)

    # Extract user and client emails
    user_email = booking.user.email
    client_email = booking.availability.client.email

    subject = f"Booking Confirmation (Booking ID: {booking.id})"
    message = f"""
    Hi {{name}},

    A booking (ID: {booking.id}) has been confirmed for the service scheduled on {booking.availability.date}
    from {booking.availability.start_time} to {booking.availability.end_time}.

    Thank you,
    Service Booking Team
    """

    # Send emails
    send_booking_email(user_email, subject, message.format(name=booking.user.first_name))
    send_booking_email(client_email, subject, message.format(name=booking.availability.client.first_name))

    return Response({"message": "Emails sent successfully."})