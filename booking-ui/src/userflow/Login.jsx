// userflow/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api-token-auth/', {
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

      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.user_id || '');
      localStorage.setItem('username', data.username || '');
      localStorage.setItem('role', data.role || '');

      // Redirect to client search page
      navigate('/user/search');
    } catch (err) {
      console.error(err);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h2 style={{ textAlign: 'center' }}>User Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          Login
        </button>
      </form>
      <button
        className="register-btn"
        onClick={() => navigate('/user/register')}
        style={{
          marginTop: '1.3rem',
          width: '100%',
          padding: '0.6rem 0',
          background: '#3578e5',
          color: '#fff',
          border: 'none',
          borderRadius: '7px',
          fontWeight: 600,
          fontSize: '1.07rem',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        Create New User
      </button>
    </div>
  );
}

export default Login;
