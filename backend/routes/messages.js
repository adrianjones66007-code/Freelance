const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, projectId, message } = req.body;

    if (!receiver || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }

    if (receiver === req.user.id) {
      return res.status(400).json({ message: 'You cannot send a message to yourself' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver,
      project: projectId,
      message,
    });

    await newMessage.save();
    
    // Populate sender and receiver details
    await newMessage.populate('sender', 'name profile.profileImage');
    await newMessage.populate('receiver', 'name profile.profileImage');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get all conversations for the current user (unique users with last message)
router.get('/conversations/list', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get all unique users this user has conversed with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
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
    })
      .populate('sender', 'name profile.profileImage')
      .populate('receiver', 'name profile.profileImage')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Get all messages for user (legacy endpoint)
router.get('/inbox/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.params.userId })
      .populate('sender', 'name profile.profileImage')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching inbox:', error);
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
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Error updating message' });
  }
});

// Mark all messages from a user as read
router.put('/conversation/:userId/read-all', auth, async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user.id,
        isRead: false
      },
      { isRead: true }
    );

    res.json({ message: 'All messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error updating messages' });
  }
});

module.exports = router;
