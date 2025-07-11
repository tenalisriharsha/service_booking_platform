import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../UserBooking.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  // Optional: let the user pick role/timezone, or leave these lines out for defaults
  // const [role, setRole] = useState('user');
  // const [timezone, setTimezone] = useState('UTC');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password1 !== password2) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/accounts/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password: password1,
          // role,
          // timezone
        }),
      });

      if (res.ok) {
        setSuccess('Account created! You can now log in.');
        setTimeout(() => navigate('/user/login'), 1500);
      } else {
        const data = await res.json();
        // More user-friendly error message for field errors
        if (data.error && typeof data.error === 'object') {
          const msg = Object.values(data.error).flat().join(' ');
          setError(msg || 'Registration failed. Please try a different username/email.');
        } else {
          setError(data.error || 'Registration failed. Please try a different username/email.');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="booking-container" style={{ maxWidth: 420 }}>
      <h2 className="booking-header">Create Account</h2>
      <form className="booking-form" onSubmit={handleRegister} style={{ marginTop: 0 }}>
        <label>Username:
          <input
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </label>
        <label>Email:
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </label>
        <label>Password:
          <input
            type="password"
            required
            value={password1}
            onChange={e => setPassword1(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </label>
        <label>Confirm Password:
          <input
            type="password"
            required
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </label>
        {/* If you want users to pick role or timezone, add those inputs here */}
        <button
          type="submit"
          className="confirm"
          style={{ width: '100%', marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
      </form>
      <button
        className="cancel"
        style={{ width: '100%', marginTop: 10, background: '#f0f0f0', color: '#3174ad' }}
        onClick={() => navigate('/user/login')}
        disabled={loading}
      >
        Back to Login
      </button>
    </div>
  );
}

export default Register;