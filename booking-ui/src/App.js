import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import ClientRegister from './userflow/ClientRegister';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import UserLogin from './userflow/Login';
import Register from './userflow/Register';
import SearchClients from './userflow/SearchClients';
import BookAppointment from './userflow/BookAppointment';
import ClientAvailability from './userflow/ClientAvailability';
import ClientLogin from './userflow/ClientLogin';
import WeeklyAvailability from './userflow/WeeklyAvailability';
import UserBooking from './UserBooking';

const localizer = momentLocalizer(moment);

function CalendarView() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  useEffect(() => {
    if (!token) navigate('/user/login');
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    // Fetch user info
    fetch('http://127.0.0.1:8000/api/accounts/me/', {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
          localStorage.setItem('username', data.username);
        }
      })
      .catch(err => {
        console.error('Failed to fetch user info', err);
      });
    // Fetch bookings
    fetch(`http://127.0.0.1:8000/api/booking/bookings/?user_id=${localStorage.getItem('user_id')}`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const userRole = localStorage.getItem('role');
        const userId = localStorage.getItem('user_id');
        let visibleBookings = data;
        if (userRole === 'client') {
          visibleBookings = data.filter(
            booking => String(booking.availability.client) === userId
          );
        }
        setBookings(visibleBookings);
        setFilteredBookings(visibleBookings);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load bookings');
        setBookings([]);
        setFilteredBookings([]);
      });
  }, [token]);

  const handleSearch = () => {
    const filtered = bookings.filter(booking => {
      return selectedDate ? moment(booking.created_at).format('YYYY-MM-DD') === selectedDate : true;
    });
    setFilteredBookings(filtered);
  };

  const events = filteredBookings.map(booking => ({
    title: `User ${booking.user} - ${booking.status}`,
    start: new Date(booking.created_at),
    end: new Date(moment(booking.created_at).add(1, 'hours')),
  }));

  return (
    <div className="App" style={{ fontFamily: 'Segoe UI, sans-serif', padding: '1rem' }}>
      <h1 style={{ textAlign: 'center' }}>📅 Service Booking Calendar</h1>
      <h3 style={{ textAlign: 'center', color: '#555' }}>
        {username ? `Welcome, ${username}!` : 'Welcome!'}
      </h3>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <button onClick={handleSearch} style={{ backgroundColor: '#4e73df', color: 'white', padding: '0.5rem 1rem' }}>Search</button>
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/user/login');
          }}
          style={{ backgroundColor: '#d9534f', color: 'white', padding: '0.5rem 1rem' }}
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/user/booking')}
          style={{ backgroundColor: '#28a745', color: 'white', padding: '0.5rem 1rem' }}
        >
          User Booking
        </button>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {filteredBookings.length === 0 && !error && <p style={{ textAlign: 'center' }}>No bookings to show.</p>}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, margin: '2rem auto', maxWidth: '90%' }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/login-client" element={<ClientLogin />} />
        <Route path="/client/weekly-availability" element={<WeeklyAvailability />} />
        <Route path="/client/availability" element={<ClientAvailability />} />
        <Route path="/" element={<CalendarView />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<Register />} />
        <Route path="/user/search" element={<SearchClients />} />
        <Route path="/user/book/:clientId" element={<BookAppointment />} />
        <Route path="/user/booking" element={<UserBooking />} />
      </Routes>
    </Router>
  );
}

export default App;