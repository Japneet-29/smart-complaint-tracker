const express = require('express');
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ adjust path if different

const router = express.Router();

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

module.exports = router;
