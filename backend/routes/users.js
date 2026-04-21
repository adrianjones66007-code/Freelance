const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

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

// Upload gallery image
router.post('/:id/gallery', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    if (!user.profile.gallery) {
      user.profile.gallery = [];
    }
    
    user.profile.gallery.push(imageUrl);
    await user.save();

    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      gallery: user.profile.gallery,
    });
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Delete gallery image
router.delete('/:id/gallery/:imageIndex', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex < 0 || imageIndex >= user.profile.gallery.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    user.profile.gallery.splice(imageIndex, 1);
    await user.save();

    res.json({
      message: 'Image deleted successfully',
      gallery: user.profile.gallery,
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

module.exports = router;
