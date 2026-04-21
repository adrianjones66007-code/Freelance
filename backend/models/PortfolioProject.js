const mongoose = require('mongoose');

const portfolioProjectSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [String], // Array of image URLs
  skills: [String],
  completion_date: {
    type: Date,
    default: Date.now,
  },
  client_feedback: String,
  featured: {
    type: Boolean,
    default: false,
  },
  link: String, // Link to live project or website
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PortfolioProject', portfolioProjectSchema);
