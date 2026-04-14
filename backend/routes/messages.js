const express = require('express');
const Message = require('../models/Message');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, projectId, message } = req.body;

    const newMessage = new Message({
      sender: req.user.id,
      receiver,
      project: projectId,
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Get all messages for user
router.get('/inbox/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.params.userId })
      .populate('sender', 'name profile.profileImage')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inbox' });
  }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message' });
  }
});

module.exports = router;
