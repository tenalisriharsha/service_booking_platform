import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../UserBooking.css';

function SearchClients() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('name');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate('/user/login');
      return;
    }

    setLoading(true);

    // Fetch logged-in user info
    fetch('http://127.0.0.1:8000/api/accounts/me/', {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => res.json())
      .then(data => setLoggedInUser(data.username || ''))
      .catch(() => setLoggedInUser(''));

    // Fetch all clients with availability
    fetch('http://127.0.0.1:8000/api/booking/clients-with-availability/', {
      headers: { Authorization: `Token ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch clients');
        return res.json();
      })
      .then(data => {
        setClients(data);
        setFilteredClients(data);
        setError('');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load clients');
        setLoading(false);
      });
  }, [token, navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    handleSearch();
  }, [debouncedQuery, selectedDate, clients, sortOption]);

  const handleSearch = () => {
    let filtered = clients;
    if (debouncedQuery) {
      filtered = filtered.filter(client =>
        client.client?.username?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }
    if (selectedDate) {
      filtered = filtered.filter(client =>
        client.availabilities?.some(avail =>
          avail.date === selectedDate
        )
      );
    }

    if (sortOption === 'name') {
      filtered = filtered.slice().sort((a, b) => {
        const nameA = a.client?.username?.toLowerCase() || '';
        const nameB = b.client?.username?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
    } else if (sortOption === 'date') {
      filtered = filtered.slice().sort((a, b) => {
        const nextDateA = a.availabilities?.length ? a.availabilities.reduce((min, slot) => slot.date < min ? slot.date : min, a.availabilities[0].date) : '9999-12-31';
        const nextDateB = b.availabilities?.length ? b.availabilities.reduce((min, slot) => slot.date < min ? slot.date : min, b.availabilities[0].date) : '9999-12-31';
        if (nextDateA < nextDateB) return -1;
        if (nextDateA > nextDateB) return 1;
        return 0;
      });
    }

    setFilteredClients(filtered);
  };

  const handleBook = (clientId, slotId) => {
    if (!clientId || !slotId) return;
    navigate(`/user/book/${clientId}?slot=${slotId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/user/login');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
      // Remove focus to avoid double triggering
      if (searchInputRef.current) searchInputRef.current.blur();
    }
  };

  return (
    <div className="booking-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>

      {loggedInUser && (
        <div
          className="username-header"
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontSize: '1.2rem',
            color: '#3174ad'
          }}
        >
          Welcome, {loggedInUser}!
        </div>
      )}

      <h2 className="booking-header">Search Available Clients</h2>
      <div className="search-bar">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Enter client name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div style={{ marginTop: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>
          {filteredClients.length} {filteredClients.length === 1 ? 'client available' : 'clients available'}
        </div>
        <div>
          <label htmlFor="sort-select" style={{ marginRight: 8, fontWeight: 'bold' }}>Sort:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="name">Sort by Name (A-Z)</option>
            <option value="date">Sort by Next Available Date</option>
          </select>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Loading...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && filteredClients.length === 0 && (
        <p style={{ textAlign: 'center', fontStyle: 'italic' }}>No clients found matching your search.</p>
      )}

      <ul className="providers-list">
        {filteredClients.map((client, clientIdx) => {
          const clientId = client.client?.id || clientIdx;
          const isExpanded = expandedClientId === clientId;

          // Here: show client_role next to username if available
          const clientRole = client.client?.client_role;

          return (
            <li
              className={`provider-card ${isExpanded ? 'provider-card-expanded' : ''} ${isExpanded ? 'fade-slide' : ''}`}
              key={clientId}
              style={{
                border: isExpanded ? '2px solid #3174ad' : '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                padding: '0.75rem',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: isExpanded ? '0 4px 8px rgba(49, 116, 173, 0.2)' : 'none',
                backgroundColor: isExpanded ? '#f0f8ff' : 'white',
              }}
            >
              <div
                className="provider-header"
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() =>
                  setExpandedClientId(isExpanded ? null : clientId)
                }
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8, fontSize: '1.2rem' }}>{isExpanded ? '▼' : '►'}</span>
                  <div>
                    <strong>
                      {client.client?.username}
                      {clientRole && (
                        <span style={{ marginLeft: 8, color: '#888', fontStyle: 'italic', fontWeight: 400 }}>
                          ({clientRole})
                        </span>
                      )}
                    </strong> — {client.client?.email}
                  </div>
                </div>
              </div>
              {isExpanded && (
                <ul className="slots-list" style={{ marginTop: '0.75rem', maxHeight: '400px', overflowY: 'auto', transition: 'max-height 0.3s ease' }}>
                  {client.availabilities?.length ? (
                    client.availabilities.map((slot, slotIdx) => (
                      <li
                        className="slot-card"
                        key={`${clientId}-${slot.id || slotIdx}`}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#fff',
                        }}
                      >
                        <span className="slot-info" style={{ fontSize: '0.9rem' }}>
                          📅 {slot.date} 🕒 {slot.start_time}–{slot.end_time} 💵 ${slot.hourly_rate}/hr
                        </span>
                        <button
                          onClick={() => handleBook(clientId, slot.id)}
                          style={{
                            backgroundColor: '#3174ad',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            padding: '0.4rem 0.8rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'background-color 0.3s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#255a8a'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#3174ad'}
                          aria-label={`Book slot on ${slot.date} from ${slot.start_time} to ${slot.end_time}`}
                        >
                          <span role="img" aria-hidden="true">📅</span> Book
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="slot-card" style={{ fontStyle: 'italic', color: '#555' }}>No availability for this client at the moment.</li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SearchClients;