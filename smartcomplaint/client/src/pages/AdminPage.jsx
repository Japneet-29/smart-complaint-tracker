import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AdminPage() {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  // 🔒 Check admin access
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      toast.error("Access denied: Admins only");
      navigate("/");
    } else {
      fetchComplaints();
    }
  }, []);

  // 📥 Fetch all complaints
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/complaints/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ Received complaints:", res.data);
      setComplaints(res.data);
    } catch (err) {
      toast.error("Failed to load complaints");
      console.error(err);
    }
  };

  // ❌ Delete complaint
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/complaints/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Complaint deleted");
      fetchComplaints(); // Refresh list
    } catch (err) {
      toast.error("Failed to delete complaint");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h2>🛠️ Admin Panel - All Complaints</h2>
      {complaints.length === 0 ? (
        <p>No complaints available</p>
      ) : (
        <ul>
          {complaints.map((c) => (
            <li
              key={c._id}
              style={{
                marginBottom: "1rem",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "8px",
                position: "relative",
              }}
            >
              <strong>{c.title}</strong> — Room {c.room}
              <br />
              <em>{c.description}</em>
              <br />
              <small>{new Date(c.date).toLocaleString()}</small>
              <br />
              <button
                onClick={() => handleDelete(c._id)}
                style={{
                  marginTop: 10,
                  background: "red",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPage;
