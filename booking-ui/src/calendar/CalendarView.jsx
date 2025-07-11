import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import BookingModal from '../components/BookingModal';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!token || !username) {
      navigate('/login');
      return;
    }

    fetch('http://127.0.0.1:8000/api/booking/availability/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch availability');
        return res.json();
      })
      .then(data => {
        const filtered = data.filter(a => a.username === username);
        setBookings(filtered);
        setFilteredBookings(filtered);
      })
      .catch(err => {
        console.error(err);
        setError('Error loading availability');
      });
  }, [token, username, navigate]);

  const handleSearch = () => {
    const filtered = bookings.filter(booking => {
      const matchDate = selectedDate
        ? moment(booking.start).format('YYYY-MM-DD') === selectedDate
        : true;
      return matchDate;
    });
    setFilteredBookings(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const events = filteredBookings.map(avail => ({
    id: avail.id,
    title: 'Available',
    start: new Date(avail.start),
    end: new Date(avail.end),
    ...avail,
  }));

  const eventStyleGetter = event => {
    let backgroundColor = '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        color: 'white',
        border: 'none',
        padding: '5px',
      },
    };
  };

  return (
    <div className="App" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>
          <span role="img" aria-label="calendar">📅</span> Service Booking Calendar
        </h2>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {filteredBookings.length === 0 && !error && <p>No bookings to show.</p>}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={event => setSelectedBooking(event)}
      />

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          token={token}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default CalendarView;