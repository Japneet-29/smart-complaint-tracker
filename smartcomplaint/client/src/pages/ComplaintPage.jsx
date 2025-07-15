import { useState, useEffect } from 'react';
import axios from 'axios';

function ComplaintPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    room: ''
  });

  const [message, setMessage] = useState('');
  const [complaints, setComplaints] = useState([]);

  // 🔁 Fetch complaints from server
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/complaints', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ Complaints fetched:", res.data);
      setComplaints(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch complaints:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:5000/api/complaints', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('✅ Complaint submitted successfully!');
      setForm({ title: '', description: '', room: '' });
      fetchComplaints(); 
    } catch (error) {
      console.error('❌ Failed to submit complaint:', error);
      setMessage('❌ Failed to submit complaint.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
      
      {isAdmin && (
        <a href="/admin" style={{ display: 'inline-block', marginBottom: 10, color: 'green' }}>
          🛠️ Go to Admin Panel
        </a>
      )}
      <h2>📮 Submit a Complaint</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />
        <input
          type="text"
          name="room"
          placeholder="Room No."
          value={form.room}
          onChange={handleChange}
          required
          style={{ display: 'block', marginBottom: 10, width: '100%' }}
        />
        <button type="submit">Submit Complaint</button>
      </form>

      <p>{message}</p>

      <h3>📋 Complaints List</h3>
      <ul>
        {complaints.map((c) => (
          <li
            key={c._id}
            style={{
              marginBottom: '1rem',
              border: '1px solid #ccc',
              padding: '10px',
              borderRadius: '8px',
            }}
          >
            <strong>{c.title}</strong> — Room {c.room}
            <br />
            <em>{c.description}</em>
            <br />
            <small>{new Date(c.date).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComplaintPage;
