import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/register', form);
      setMessage('✅ Registered successfully. Please login.');
      setForm({ name: '', email: '', password: '' });
      navigate('/login');
    } catch (err) {
      setMessage('❌ Registration failed.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
      <p style={{ marginTop: 10 }}>
        Already have an account? <a href="/login" style={{ color: 'blue' }}>Login here</a>
      </p>

    </div>
  );
}

export default Register;
