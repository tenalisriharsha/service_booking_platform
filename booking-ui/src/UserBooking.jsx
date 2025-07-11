// src/UserBooking.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './UserBooking.css';

const localizer = momentLocalizer(moment);

function UserBooking() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [username, setUsername] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch current user's username
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch("http://127.0.0.1:8000/api/accounts/me/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsername(data.username || ""))
      .catch(() => setUsername(""));
  }, [token, navigate]);

  // 2. Fetch all clients with availability
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/booking/clients-with-availability/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        setLoading(false);
      })
      .catch(() => {
        setClients([]);
        setLoading(false);
      });
  }, [token]);

  // 3. When a client is selected, load their slots (availabilities)
  const handleClientClick = (clientObj) => {
    setSelectedClient(clientObj);
    setSelectedSlot(null);
    setSelectedStartTime("");
    setSelectedEndTime("");
    setSlots(clientObj.availabilities || []);
  };

  // 4. Calendar events from slots
  const events =
    slots?.map((slot) => {
      const start = new Date(`${slot.date}T${slot.start_time}`);
      const end = new Date(`${slot.date}T${slot.end_time}`);
      return {
        id: slot.id,
        title: `Available: ${slot.start_time} - ${slot.end_time}`,
        start,
        end,
        slot,
      };
    }) || [];

  // 5. Handle slot select
  const handleSelectEvent = (event) => {
    const slot = slots.find((s) => s.id === event.id);
    if (!slot) {
      alert("Slot not found.");
      return;
    }
    setSelectedSlot(slot);
    setSelectedStartTime(slot.start_time);
    setSelectedEndTime(slot.end_time);
  };

  // 6. Booking
  const handleBookingSubmit = () => {
    if (!selectedSlot) return;
    if (!selectedStartTime || !selectedEndTime) {
      alert("Please select both start and end time.");
      return;
    }
    if (selectedStartTime >= selectedEndTime) {
      alert("End time must be after start time.");
      return;
    }
    if (
      selectedStartTime < selectedSlot.start_time ||
      selectedEndTime > selectedSlot.end_time
    ) {
      alert("Times must be within the slot.");
      return;
    }
    const duration = moment(selectedEndTime, "HH:mm:ss").diff(
      moment(selectedStartTime, "HH:mm:ss"),
      "minutes"
    );
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/booking/book/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        availability: selectedSlot.id,
        duration: duration,
        start_time: selectedStartTime,
        end_time: selectedEndTime,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.detail || JSON.stringify(data));
          });
        }
        return res.json();
      })
      .then(() => {
        alert("Booking successful!");
        setSelectedSlot(null);
        setSelectedStartTime("");
        setSelectedEndTime("");
      })
      .catch((err) => {
        alert("Booking failed: " + (err.message || "Unknown error"));
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="booking-container">
      {/* Username at the top */}
      <h2 className="booking-header">
        Welcome, <span>{username}</span>
      </h2>

      {/* Clients as buttons */}
      <div>
        <h3>Available Service Providers</h3>
        {loading && <div>Loading...</div>}
        <div className="providers-list">
          {clients.length === 0 && !loading && (
            <div>No available providers right now.</div>
          )}
          {clients.map((obj) => (
            <button
              key={obj.client.id}
              className={"provider-btn" + (selectedClient?.client?.id === obj.client.id ? " selected" : "")}
              onClick={() => handleClientClick(obj)}
            >
              {obj.client.username}
            </button>
          ))}
        </div>
      </div>

      {/* Availability calendar */}
      {selectedClient && (
        <div style={{ marginTop: 28 }}>
          <h4 className="availability-title">
            {selectedClient.client.username}'s Availability
          </h4>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 370, margin: "14px 0" }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor:
                  selectedSlot?.id === event.id ? "#28a745" : "#3174ad",
                color: "white",
                borderRadius: 6,
              },
            })}
          />
        </div>
      )}

      {/* Booking form (if slot picked) */}
      {selectedSlot && (
        <div className="booking-form">
          <h4>
            Booking with {selectedClient.client.username} on {selectedSlot.date}
          </h4>
          <div style={{ marginBottom: 12 }}>
            <label>
              Start Time:{" "}
              <input
                type="time"
                step="60"
                value={selectedStartTime}
                min={selectedSlot.start_time}
                max={selectedSlot.end_time}
                onChange={(e) => setSelectedStartTime(e.target.value + ":00")}
              />
            </label>
            &nbsp;&nbsp;
            <label>
              End Time:{" "}
              <input
                type="time"
                step="60"
                value={selectedEndTime}
                min={selectedSlot.start_time}
                max={selectedSlot.end_time}
                onChange={(e) => setSelectedEndTime(e.target.value + ":00")}
              />
            </label>
          </div>
          <button
            onClick={handleBookingSubmit}
            className="confirm"
            disabled={loading}
          >
            Confirm Booking
          </button>
          <button
            onClick={() => {
              setSelectedSlot(null);
              setSelectedStartTime("");
              setSelectedEndTime("");
            }}
            className="cancel"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default UserBooking;
