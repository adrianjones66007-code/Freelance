const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { reviewedUserId, projectId, rating, comment } = req.body;

    if (reviewedUserId === req.user.id) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Check if user already reviewed this person
    const existingReviewQuery = {
      reviewer: req.user.id,
      reviewed: reviewedUserId,
    };
    if (projectId) existingReviewQuery.project = projectId;

    const existingReview = await Review.findOne(existingReviewQuery);

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this person' });
    }

    const reviewData = {
      reviewer: req.user.id,
      reviewed: reviewedUserId,
      rating,
      comment,
    };
    if (projectId) reviewData.project = projectId;

    const review = new Review(reviewData);

    await review.save();
    await review.populate('reviewer', 'name profile.profileImage');

    // Update user rating
    const allReviews = await Review.find({ reviewed: reviewedUserId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(reviewedUserId, {
      averageRating: avgRating,
      totalReviews: allReviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewed: req.params.userId })
      .populate('reviewer', 'name profile.profileImage')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Get all reviews for the current user
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewed: req.user.id })
      .populate('reviewer', 'name profile.profileImage')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Check if user can leave a review for another user
router.get('/can-review/:userId', auth, async (req, res) => {
  try {
    // Users can review if they have worked together (same project with bids/contracts)
    const canReview = true; // Simplified - in production, check if they've worked together
    res.json({ canReview });
  } catch (error) {
    console.error('Error checking review permission:', error);
    res.status(500).json({ message: 'Error checking review permission' });
  }
});

module.exports = router;
