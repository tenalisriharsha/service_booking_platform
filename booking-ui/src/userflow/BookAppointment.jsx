import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './BookAppointment.css';

const localizer = momentLocalizer(moment);

function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientId } = useParams();
  const token = localStorage.getItem('token');
  const searchParams = new URLSearchParams(location.search);
  const preselectedSlotId = searchParams.get('slot');

  const [client, setClient] = useState(null);
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(30); // default 30 mins
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');

  useEffect(() => {
    if (!token) return;
    if (!clientId) {
      setError('Invalid client ID.');
      return;
    }
    fetch(`http://127.0.0.1:8000/api/accounts/clients/${clientId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Client fetch failed');
        return res.json();
      })
      .then(data => setClient(data))
      .catch(err => {
        console.error(err);
        setError('Client not found.');
      });
  }, [clientId, token]);

  useEffect(() => {
    if (!token) {
      navigate('/userflow/login');
      return;
    }
    if (!clientId) {
      setError('Invalid client ID.');
      return;
    }
    fetch(`http://127.0.0.1:8000/api/booking/availability/client/${clientId}/`, {      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch slots');
        return res.json();
      })
      .then(data => {
        setSlots(data);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Unable to fetch availability.');
      });
  }, [clientId, token, navigate]);

  const events = slots.map(slot => {
    const start = new Date(`${slot.date}T${slot.start_time}`);
    const end = new Date(`${slot.date}T${slot.end_time}`);
    return {
      id: slot.id,
      title: `Available with ${client?.username || 'Client'}`,
      start,
      end,
      selected: String(slot.id) === preselectedSlotId
    };
  });

  const handleSelectEvent = event => {
    const slot = slots.find(s => s.id === event.id);
    if (!slot) {
      alert('Selected slot not found.');
      return;
    }
    setSelectedSlot(slot);
    setSelectedStartTime(slot.start_time);
    setSelectedEndTime(slot.end_time);
  };

  const handleBookingSubmit = () => {
    if (!selectedSlot) return;
    const availabilityId = selectedSlot.id;

    // Validation
    if (!selectedStartTime || !selectedEndTime) {
      alert('Please select both start and end time.');
      return;
    }
    if (selectedStartTime >= selectedEndTime) {
      alert('End time must be after start time.');
      return;
    }
    if (selectedStartTime < selectedSlot.start_time || selectedEndTime > selectedSlot.end_time) {
      alert('Selected times must be within the available slot.');
      return;
    }

    const duration = moment(selectedEndTime, 'HH:mm:ss').diff(moment(selectedStartTime, 'HH:mm:ss'), 'minutes');

    console.log('Booking as user:', client?.username, 'Token:', token);

    fetch('http://127.0.0.1:8000/api/booking/book/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        availability: availabilityId,
        duration: duration,
        start_time: selectedStartTime,
        end_time: selectedEndTime
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.detail || JSON.stringify(data));
          });
        }
        return res.json();
      })
      .then(() => {
        alert('Booking successful!');
        navigate('/');
      })
      .catch(err => {
        alert('Booking failed: ' + (err.message || 'Unknown error'));
      });
  };

  return (
    <div className="book-appointment">
      <h2>Book an Appointment with {client?.username || 'Client'}</h2>
      <p>Email: {client?.email}</p>
      <p>Specialization: {client?.specialization || 'General Consultation'}</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && (
        <>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500, margin: '20px 0' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.selected ? '#28a745' : '#3174ad',
                color: 'white'
              }
            })}
          />
          {selectedSlot && (
            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
              <h4>
                Booking with {client?.username} on {selectedSlot.date}
              </h4>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Start Time:{' '}
                  <input
                    type="time"
                    step="60"
                    value={selectedStartTime}
                    min={selectedSlot.start_time}
                    max={selectedSlot.end_time}
                    onChange={e => setSelectedStartTime(e.target.value + ':00')}
                  />
                </label>
                &nbsp;&nbsp;
                <label>
                  End Time:{' '}
                  <input
                    type="time"
                    step="60"
                    value={selectedEndTime}
                    min={selectedSlot.start_time}
                    max={selectedSlot.end_time}
                    onChange={e => setSelectedEndTime(e.target.value + ':00')}
                  />
                </label>
              </div>
              <button onClick={handleBookingSubmit} style={{ padding: '0.5rem 1.2rem' }}>
                Confirm Booking
              </button>
              <button
                style={{ marginLeft: 16 }}
                onClick={() => {
                  setSelectedSlot(null);
                  setSelectedStartTime('');
                  setSelectedEndTime('');
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BookAppointment;