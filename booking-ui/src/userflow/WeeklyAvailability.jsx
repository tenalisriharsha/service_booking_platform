import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';

const defaultSchedule = {
  Sun: { enabled: false, start: '', end: '' },
  Mon: { enabled: true, start: '09:00', end: '17:00' },
  Tue: { enabled: true, start: '09:00', end: '17:00' },
  Wed: { enabled: true, start: '09:00', end: '17:00' },
  Thu: { enabled: true, start: '09:00', end: '17:00' },
  Fri: { enabled: true, start: '09:00', end: '17:00' },
  Sat: { enabled: false, start: '', end: '' }
};

const WeeklyAvailability = () => {
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currentTime, setCurrentTime] = useState(moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss'));

  // Username state
  const [username, setUsername] = useState('');

  // Week offset state and week dates logic
  const [weekOffset, setWeekOffset] = useState(0);

  const getCurrentWeekDates = () => {
    const today = moment().add(weekOffset, 'weeks').startOf('week');
    return Array.from({ length: 7 }, (_, i) =>
      today.clone().add(i, 'days').format('YYYY-MM-DD')
    );
  };

  const [weekDates, setWeekDates] = useState(getCurrentWeekDates());

  useEffect(() => {
    setWeekDates(getCurrentWeekDates());
  }, [weekOffset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  useEffect(() => {
    if (!token) {
      navigate('/client/login');
    }
  }, [token, navigate]);

  // Fetch username when token is present
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/accounts/me/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
        }
      } catch (err) {
        console.error('Failed to fetch user info:', err);
      }
    };

    if (token) {
      fetchUserDetails();
    }
  }, [token]);

  const handleToggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    const payload = [];

    for (const [index, [day, config]] of Object.entries(Object.entries(schedule)).map(([i, v]) => [parseInt(i), v])) {
      if (config.enabled && config.start && config.end && price) {
        payload.push({
          date: weekDates[index],
          start_time: config.start,
          end_time: config.end,
          price_per_hour: price
        });
      }
    }

    if (payload.length === 0) {
      setError('Please configure at least one available day and set hourly rate.');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/booking/weekly-availability/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`
        },
        body: JSON.stringify({ weekly_availability: payload, timezone })
      });

      if (!res.ok) throw new Error('Submission failed');
      alert('Weekly availability saved!');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to save weekly availability.');
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: 'auto', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '2rem', fontWeight: 'bold', color: '#333', backgroundColor: '#e0f7fa', padding: '0.5rem 1rem', borderRadius: '8px' }}>
        {username && `Logged in as: ${username}`}
      </div>
      <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', color: '#333' }}>Weekly Availability</h2>
      <p style={{ fontStyle: 'italic' }}>Set your working hours for each day.</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="timezone-select" style={{ fontWeight: 'bold' }}>Select Timezone:</label>
        <select
          id="timezone-select"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {moment.tz.names().map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>Current time: {currentTime}</p>
      </div>

      {/* Week navigation and dates display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => setWeekOffset(prev => prev - 1)} style={{ padding: '0.5rem 1.2rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          ⬅️ Previous Week
        </button>
        <button onClick={() => setWeekOffset(prev => prev + 1)} style={{ padding: '0.5rem 1.2rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Next Week ➡️
        </button>
      </div>

      {days.map((day, index) => (
        <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', backgroundColor: '#fff', padding: '0.5rem', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <input
            type="checkbox"
            checked={schedule[day].enabled}
            onChange={() => handleToggleDay(day)}
          />
          <label style={{ width: '80px', marginLeft: '0.5rem', fontWeight: 'bold' }}>
            {day}
          </label>
          <input
            type="time"
            value={schedule[day].start}
            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
            disabled={!schedule[day].enabled}
            style={{ marginRight: '1rem', marginLeft: '1rem' }}
          />
          <input
            type="time"
            value={schedule[day].end}
            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
            disabled={!schedule[day].enabled}
          />
          <span style={{ marginLeft: '1rem', fontStyle: 'italic', color: '#555' }}>
            {weekDates[index]}
          </span>
        </div>
      ))}

      <div style={{ marginTop: '1rem' }}>
        <input
          type="number"
          placeholder="Hourly rate ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ width: '220px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handleSubmit} style={{ padding: '0.6rem 2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
          💾 Save Schedule
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/client/login');
          }}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '0.6rem 2rem',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🔓 Logout
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold' }}>{error}</p>}
    </div>
  );
};

export default WeeklyAvailability;
