const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create project
router.post('/', auth, (req, res, next) => {
  // Check if this is a multipart request (with files) or JSON
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    upload.array('projectImages', 10)(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  try {
    const { title, description, category, budget, budgetType, skills, deadline } = req.body;

    // Parse skills if it's a JSON string
    let parsedSkills = skills;
    if (typeof skills === 'string') {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(',').map(s => s.trim());
      }
    }

    // Get uploaded file paths (if any)
    const projectImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const project = new Project({
      title,
      description,
      category,
      budget,
      budgetType,
      skills: parsedSkills,
      deadline,
      client: req.user.id,
      projectImages: projectImages,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const { category, status, minBudget, maxBudget } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = parseInt(minBudget);
      if (maxBudget) filter.budget.$lte = parseInt(maxBudget);
    }

    const projects = await Project.find(filter)
      .populate('client', 'name profile.profileImage averageRating')
      .populate('bids')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name profile.profileImage averageRating')
      .populate('assignedFreelancer', 'name profile.profileImage')
      .populate({
        path: 'bids',
        populate: { path: 'freelancer', select: 'name profile.profileImage averageRating' }
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, budget, status } = req.body;
    if (title) project.title = title;
    if (description) project.description = description;
    if (budget) project.budget = budget;
    if (status) project.status = status;
    project.updatedAt = Date.now();

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Project.findByIdAndRemove(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

module.exports = router;
