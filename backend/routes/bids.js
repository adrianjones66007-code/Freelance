const express = require('express');
const Bid = require('../models/Bid');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Place a bid
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, bidAmount, proposedTimeline, coverLetter } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const bid = new Bid({
      freelancer: req.user.id,
      project: projectId,
      bidAmount,
      proposedTimeline,
      coverLetter,
    });

    await bid.save();
    project.bids.push(bid._id);
    await project.save();

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid' });
  }
});

// Get bids for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate('freelancer', 'name profile.profileImage averageRating');

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids' });
  }
});

// Get freelancer's bids
router.get('/freelancer/bids/:freelancerId', async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.params.freelancerId })
      .populate('project', 'title category budget')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids' });
  }
});

// Accept a bid
router.put('/:bidId/accept', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const project = await Project.findById(bid.project);
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bid.status = 'accepted';
    project.assignedFreelancer = bid.freelancer;
    project.status = 'in-progress';

    await bid.save();
    await project.save();

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting bid' });
  }
});

// Reject a bid
router.put('/:bidId/reject', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const project = await Project.findById(bid.project);
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    bid.status = 'rejected';
    await bid.save();

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting bid' });
  }
});

module.exports = router;
