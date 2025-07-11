import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClientLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/booking/client/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('role', 'client');

      navigate('/client/weekly-availability');
    } catch (err) {
      console.error(err);
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Client Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <button
        onClick={handleLogin}
        style={{ padding: '0.5rem 1rem', width: '100%' }}
      >
        Login
      </button>
      <button
        style={{
          marginTop: 16,
          width: '100%',
          padding: 10,
          background: '#635BFF',
          color: '#fff',
          border: 'none',
          borderRadius: 6
        }}
        onClick={() => navigate('/client/register')}
      >
        Create New Client
      </button>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

export default ClientLogin;
