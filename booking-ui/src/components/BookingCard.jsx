// booking-ui/src/components/BookingCard.jsx

import React from 'react';
import { DateTime } from 'luxon';

const BookingCard = ({ booking }) => {
  const { date, start_time, end_time, timezone } = booking.availability;

  // Parse times using Luxon
  const clientStart = DateTime.fromISO(`${date}T${start_time}`, { zone: timezone });
  const clientEnd = DateTime.fromISO(`${date}T${end_time}`, { zone: timezone });

  const userStart = clientStart.setZone(DateTime.local().zoneName);
  const userEnd = clientEnd.setZone(DateTime.local().zoneName);

  // Format time ranges
  const clientRange = `${clientStart.toFormat('h:mm a')} – ${clientEnd.toFormat('h:mm a')}`;
  const userRange = `${userStart.toFormat('h:mm a')} – ${userEnd.toFormat('h:mm a')}`;

  return (
    <div style={{
      padding: '1rem',
      margin: '1rem 0',
      borderRadius: '10px',
      border: '2px solid #4CAF50',
      backgroundColor: '#f7fff7',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h2>Booking #{booking.id}</h2>
      <p><strong>Status:</strong> {booking.status}</p>
      <p><strong>Client Time:</strong> {clientStart.toLocaleString(DateTime.DATE_MED)} {clientRange} ({timezone})</p>
      <p><strong>Your Local Time:</strong> {userStart.toLocaleString(DateTime.DATE_MED)} {userRange} ({userStart.zoneName})</p>
    </div>
  );
};

export default BookingCard;
