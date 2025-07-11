import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ClientAvailability() {
  const [weeklyAvailability, setWeeklyAvailability] = useState({
    Sunday: { available: false, start: '', end: '' },
    Monday: { available: true, start: '09:00', end: '17:00' },
    Tuesday: { available: true, start: '09:00', end: '17:00' },
    Wednesday: { available: true, start: '09:00', end: '17:00' },
    Thursday: { available: true, start: '09:00', end: '17:00' },
    Friday: { available: true, start: '09:00', end: '17:00' },
    Saturday: { available: false, start: '', end: '' },
  });
  const [pricePerHour, setPricePerHour] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/login-client');
  }, [token, navigate]);

  const handleToggleDay = (day) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], available: !prev[day].available },
    }));
  };

  const handleTimeChange = (day, type, value) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
  };

  const handleSubmit = async () => {
    const availabilityPayload = Object.entries(weeklyAvailability)
      .filter(([_, data]) => data.available && data.start && data.end)
      .map(([day, data]) => ({
        day,
        start_time: data.start,
        end_time: data.end,
        price_per_hour: pricePerHour,
      }));

    if (!pricePerHour || availabilityPayload.length === 0) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/booking/availability/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ availability: availabilityPayload }),
      });

      if (!response.ok) throw new Error('Submission failed');
      setMessage('Availability saved successfully!');
      setError('');
    } catch (err) {
      setError('Failed to submit availability');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login-client');
  };

  return (
    <div className="client-availability" style={{ padding: '2rem' }}>
      <h2>Set Your Weekly Availability</h2>
      <div style={{ marginBottom: '1rem' }}>
        {Object.entries(weeklyAvailability).map(([day, { available, start, end }]) => (
          <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ width: '100px' }}>
              <input
                type="checkbox"
                checked={available}
                onChange={() => handleToggleDay(day)}
              />{' '}
              {day}
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
              disabled={!available}
              style={{ marginRight: '1rem' }}
            />
            <input
              type="time"
              value={end}
              onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
              disabled={!available}
              style={{ marginRight: '1rem' }}
            />
          </div>
        ))}
        <input
          type="number"
          placeholder="Hourly Rate ($)"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(e.target.value)}
          style={{ marginBottom: '1rem' }}
        />
        <div>
          <button onClick={handleSubmit} style={{ marginRight: '1rem' }}>Save Availability</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default ClientAvailability;
