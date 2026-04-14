const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { reviewedUserId, projectId, rating, comment } = req.body;

    const review = new Review({
      reviewer: req.user.id,
      reviewed: reviewedUserId,
      project: projectId,
      rating,
      comment,
    });

    await review.save();

    // Update user rating
    const allReviews = await Review.find({ reviewed: reviewedUserId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(reviewedUserId, {
      averageRating: avgRating,
      totalReviews: allReviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewed: req.params.userId })
      .populate('reviewer', 'name profile.profileImage');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

module.exports = router;
