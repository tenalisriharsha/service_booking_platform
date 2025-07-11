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
      const response = await fetch('http://127.0.0.1:8000/api/accounts/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Full login response:', data);

      if (!response.ok) {
        const message = data?.detail || 'Invalid credentials. Please try again.';
        setError(message);
        return;
      }

      const { token, user_id, username: returnedUsername, role } = data;

      if (!token || !user_id) {
        setError('Missing token or user ID in response.');
        console.error('Expected fields missing in response:', data);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user_id.toString());
      localStorage.setItem('username', returnedUsername || username);
      localStorage.setItem('role', role || '');
      console.log('Login successful. Token and user ID stored.');
      navigate('/');
    } catch (error) {
      console.error('Login error (network/client):', error);
      setError('Login failed. Please check your network or try again later.');
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: 'auto',
      padding: '2rem',
      boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      marginTop: '5rem'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Login to Your Account</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter your username"
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />

        <button type="submit" style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;