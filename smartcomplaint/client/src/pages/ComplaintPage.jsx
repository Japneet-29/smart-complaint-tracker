import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api.js';
import './ComplaintPage.css';

function ComplaintPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    room: ''
  });

  const [message, setMessage] = useState('');
  const [complaints, setComplaints] = useState([]);

  // Fetch complaints from server
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/api/complaints', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
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
      await api.post('/api/complaints', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Complaint submitted successfully');
      setForm({ title: '', description: '', room: '' });
      fetchComplaints();
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      setMessage('Failed to submit complaint');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const markResolved = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/api/complaints/${id}/status`, { status: 'resolved' }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Marked as resolved');
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const sortedComplaints = [...complaints].sort((a, b) => {
    if (a.status === 'resolved' && b.status !== 'resolved') return 1;
    if (a.status !== 'resolved' && b.status === 'resolved') return -1;
    return 0;
  });

  return (
    <div className="complaints-page">
      <div className="container">
        <div className="header">
          <div>
            <h2 className="page-title">📮 Submit a Complaint</h2>
            <p className="subtitle">Quickly report issues — our team will follow up promptly.</p>
          </div>

          <div className="actions">
            {isAdmin && (
              <a href="/admin" className="btn secondary">🛠️ Admin</a>
            )}
            <button className="btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="grid">
          <section className="card form-card">
            <form onSubmit={handleSubmit} className="complaint-form">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Short summary"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the issue in detail"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group small">
                  <label htmlFor="room">Room</label>
                  <input
                    id="room"
                    name="room"
                    type="text"
                    placeholder="Room No."
                    value={form.room}
                    onChange={handleChange}
                    required
                  />
                </div>

                {isAdmin && (
                  <div className="form-group small">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" onChange={handleChange} defaultValue="">
                      <option value="">Choose...</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="noise">Noise</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn submit">Submit Complaint</button>
                <div className="form-message">{message}</div>
              </div>
            </form>
          </section>

          <aside className="card list-card">
            <h3>📋 Complaints</h3>
            <div className="list">
              {sortedComplaints.length === 0 && <div className="empty">No complaints yet.</div>}
              {sortedComplaints.map((c) => (
                <article key={c._id} className={`item ${c.status === 'resolved' ? 'resolved' : ''}`}>
                  <div className="item-header">
                    <div>
                      <div className="item-title">{c.title}</div>
                      <div className="meta">Room {c.room} • {c.category || 'Uncategorized'}</div>
                    </div>
                    <div className="meta">{new Date(c.date).toLocaleString()}</div>
                  </div>

                  <p className="description">{c.description}</p>

                  <div className="item-actions">
                    {c.status !== 'resolved' && (
                      <button onClick={() => markResolved(c._id)} className="btn resolve">Mark Resolved</button>
                    )}
                    <div className={`status ${c.status}`}>{c.status}</div>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ComplaintPage;
