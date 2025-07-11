// File: userflow/ClientWeeklyAvailability.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultSchedule = [
  { day: 'Sun', available: false, start: '09:00', end: '17:00' },
  { day: 'Mon', available: true,  start: '09:00', end: '17:00' },
  { day: 'Tue', available: true,  start: '09:00', end: '17:00' },
  { day: 'Wed', available: true,  start: '09:00', end: '17:00' },
  { day: 'Thu', available: true,  start: '09:00', end: '17:00' },
  { day: 'Fri', available: true,  start: '09:00', end: '17:00' },
  { day: 'Sat', available: false, start: '09:00', end: '17:00' }
];

function ClientWeeklyAvailability() {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [clientData, setClientData] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/login-client');
    else {
      fetch('http://127.0.0.1:8000/api/accounts/me/', {
        headers: { Authorization: `Token ${token}` }
      })
        .then(res => res.json())
        .then(data => setClientData(data))
        .catch(() => setClientData(null));
    }
  }, [token, navigate]);

  const handleSubmit = async () => {
    try {
      const payload = schedule
        .filter(slot => slot.available)
        .map(slot => ({
          day: slot.day,
          start_time: slot.start,
          end_time: slot.end,
          price_per_hour: price
        }));

      const response = await fetch('http://127.0.0.1:8000/api/booking/weekly-availability/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save availability');

      setMessage('Availability saved successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Error saving availability.');
    }
  };

  const handleChange = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = field === 'available' ? value : value;
    setSchedule(newSchedule);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Set Weekly Availability</h2>
      {clientData && (
        <div style={{
          marginBottom: '1.2rem',
          padding: '0.9rem 1.3rem',
          background: '#f7f8fc',
          borderRadius: '7px',
          fontWeight: 500
        }}>
          <span style={{ color: '#3174ad', fontWeight: 600 }}>{clientData.username}</span>
          {clientData.client_role && (
            <span style={{ marginLeft: 14, color: '#635BFF', fontStyle: 'italic' }}>
              — {clientData.client_role}
            </span>
          )}
        </div>
      )}
      {schedule.map((slot, idx) => (
        <div key={slot.day} style={{ marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={slot.available}
              onChange={e => handleChange(idx, 'available', e.target.checked)}
            /> {slot.day}
          </label>
          {slot.available && (
            <>
              <input
                type="time"
                value={slot.start}
                onChange={e => handleChange(idx, 'start', e.target.value)}
                style={{ marginLeft: '1rem' }}
              />
              <input
                type="time"
                value={slot.end}
                onChange={e => handleChange(idx, 'end', e.target.value)}
                style={{ marginLeft: '0.5rem' }}
              />
            </>
          )}
        </div>
      ))}
      <input
        type="number"
        placeholder="Price per hour"
        value={price}
        onChange={e => setPrice(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />
      <br />
      <button onClick={handleSubmit}>Save Availability</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ClientWeeklyAvailability;

