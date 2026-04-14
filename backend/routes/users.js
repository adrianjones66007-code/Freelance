const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all freelancers
router.get('/', async (req, res) => {
  try {
    const users = await User.find({
      userType: { $in: ['freelancer', 'both'] }
    }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, bio, skills, hourlyRate, profileImage } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    if (name) user.name = name;
    if (profileImage) user.profile.profileImage = profileImage;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skills;
    if (hourlyRate) user.profile.hourlyRate = hourlyRate;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
