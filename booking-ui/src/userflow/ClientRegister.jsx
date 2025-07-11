import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ClientRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password1 !== password2) {
      setError("Passwords do not match.");
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
          role,
          client_role: role
        }),
      });

      if (res.ok) {
        setSuccess('Client account created! You can now log in.');
        setTimeout(() => navigate('/client/login'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed. Try a different username/email.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>Create Client Account</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" required value={username}
          onChange={e => setUsername(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
        <input type="email" placeholder="Email" required value={email}
          onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
        <input type="password" placeholder="Password" required value={password1}
          onChange={e => setPassword1(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
        <input type="password" placeholder="Confirm Password" required value={password2}
          onChange={e => setPassword2(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
        <label style={{ display: 'block', marginBottom: 4 }}>Role (what do you do?):</label>
        <input type="text" placeholder="Role" required value={role}
          onChange={e => setRole(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#635BFF', color: '#fff', border: 'none', borderRadius: 6 }}>
          Create Client
        </button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
      </form>
      <button style={{ width: '100%', marginTop: 16, background: '#eee', color: '#635BFF', border: 'none', borderRadius: 6 }}
        onClick={() => navigate('/client/login')}>
        Back to Client Login
      </button>
    </div>
  );
}

export default ClientRegister;
