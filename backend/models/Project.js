const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'hourly'],
    default: 'fixed',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  skills: [String],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open',
  },
  deadline: Date,
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
  }],
  attachments: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectSchema);
