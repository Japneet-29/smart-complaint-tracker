const express = require('express');
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ adjust path if different

const router = express.Router();
const User = require('../models/User');

// 🔐 POST /api/complaints — Submit a new complaint
router.post('/', authMiddleware, async (req, res) => {
  try {
    const complaint = new Complaint({
      ...req.body,
      user: req.user.id,
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔐 GET /api/complaints — Get complaints for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ date: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const complaints = await Complaint.find().sort({ date: -1 }).populate('user', 'name email');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
