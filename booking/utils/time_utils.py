from datetime import datetime, timedelta, time

def add_minutes_to_time(base_time, minutes):
    """Adds minutes to a time object."""
    dummy_datetime = datetime.combine(datetime.today(), base_time)
    new_datetime = dummy_datetime + timedelta(minutes=minutes)
    return new_datetime.time()

def times_overlap(start1, end1, start2, end2):
    """Returns True if the two time intervals overlap."""
    return max(start1, start2) < min(end1, end2)

def is_booking_conflicting(availability, start_time, end_time):
    """Checks if booking overlaps with existing bookings + 30-min buffer."""
    from booking.models import Booking

    date = availability.date
    buffer_minutes = 30

    # Add buffer to the end_time
    buffered_end_time = add_minutes_to_time(end_time, buffer_minutes)

    overlapping = Booking.objects.filter(
        availability=availability,
        status='booked'
    ).exclude(
        # Exclude bookings that end before our slot or start after buffer ends
        availability__start_time__gte=buffered_end_time,
        availability__end_time__lte=start_time
    ).filter(
        availability__date=date
    )

    return overlapping.exists()
