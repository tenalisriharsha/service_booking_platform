import React from 'react';

function BookingModal({ booking, token, onClose }) {
  if (!booking) return null;

  const { id, status, created_at, user_email, start, end } = booking;

  const formattedDate = start ? new Date(start).toLocaleDateString() : 'Invalid Date';
  const formattedStartTime = start ? new Date(start).toLocaleTimeString() : 'Invalid Date';
  const formattedEndTime = end ? new Date(end).toLocaleTimeString() : 'Invalid Date';

  const handleSendEmail = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/notify_booking/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          booking_id: id,
          email: user_email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email failed');
      }

      const data = await response.json();
      alert(data.message || 'Email sent successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal enhanced-modal">
        <h2 className="modal-title">📅 Booking Summary</h2>
        <div className="modal-content">
          <p><span className="label">🔖 Booking ID:</span> {id}</p>
          <p><span className="label">📌 Status:</span> <strong className={`status-${status}`}>{status}</strong></p>
          <p><span className="label">📧 User Email:</span> {user_email}</p>
          <p><span className="label">📅 Date:</span> {formattedDate}</p>
          <p><span className="label">⏰ Time:</span> {formattedStartTime} – {formattedEndTime}</p>
        </div>
        <div className="modal-actions">
          <button onClick={handleSendEmail} className="btn send-btn">📨 Send Email</button>
          <button onClick={onClose} className="btn close-btn">❌ Close</button>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;