const express = require('express');
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ adjust path if different
const router = express.Router();
const User = require('../models/User');
const { categorizeComplaint } = require('../utils/geminiService.js')


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, room } = req.body;

    // Combine title + description for categorization
    const combinedText = `${title} - ${description}`;
    const category = await categorizeComplaint(combinedText);

    const complaint = new Complaint({
      title,
      description,
      room,
      category,
      status: 'pending',
      user: req.user.id
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    console.error("🚨 Error submitting complaint:", err);
    res.status(400).json({ error: err.message || "Unknown error" });
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
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const user = await User.findById(req.user.id);

    if (!user.isAdmin && complaint.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    complaint.status = req.body.status || complaint.status;
    await complaint.save();

    res.json({ message: 'Status updated', complaint });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
