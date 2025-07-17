const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  room: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  category: {type: String, default: 'others'},
});

module.exports = mongoose.model('Complaint', complaintSchema);
