const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MFAToken = require('../models/MFAToken');
const auth = require('../middleware/auth');
const { sendMFACode } = require('../utils/emailService');

const router = express.Router();

// Generate random MFA code
const generateMFACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType, enableMFA } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      userType: userType || 'freelancer',
      mfaEnabled: enableMFA || false,
      mfaMethod: enableMFA ? 'email' : 'disabled'
    });

    await user.save();

    // If MFA is enabled, send verification code
    if (enableMFA) {
      const code = generateMFACode();
      const mfaToken = new MFAToken({
        userId: user._id,
        code: code,
        type: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });
      await mfaToken.save();

      // Send code via email
      const emailSent = await sendMFACode(email, code, 'registration');
      if (!emailSent) {
        console.warn('Failed to send MFA code, but continuing with registration');
      }

      return res.status(201).json({
        requiresMFA: true,
        userId: user._id,
        message: 'Account created. Please verify your email with the code sent to ' + email,
      });
    }

    // Generate token if MFA not enabled
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({
      requiresMFA: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify MFA code (for registration)
router.post('/verify-mfa-registration', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: 'Please provide userId and code' });
    }

    // Find valid MFA token
    const mfaToken = await MFAToken.findOne({
      userId,
      code,
      type: 'registration',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!mfaToken) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Mark token as used
    mfaToken.used = true;
    await mfaToken.save();

    // Mark user as verified
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).select('-password');

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If MFA is enabled, send verification code
    if (user.mfaEnabled && user.mfaMethod === 'email') {
      const code = generateMFACode();
      const mfaToken = new MFAToken({
        userId: user._id,
        code: code,
        type: 'login',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });
      await mfaToken.save();

      // Send code via email
      const emailSent = await sendMFACode(email, code, 'login');
      if (!emailSent) {
        console.warn('Failed to send MFA code');
      }

      return res.json({
        requiresMFA: true,
        userId: user._id,
        message: 'Verification code sent to ' + email,
      });
    }

    // Generate token if MFA not enabled
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      requiresMFA: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profile: user.profile,
        averageRating: user.averageRating,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify MFA code (for login)
router.post('/verify-mfa-login', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: 'Please provide userId and code' });
    }

    // Find valid MFA token
    const mfaToken = await MFAToken.findOne({
      userId,
      code,
      type: 'login',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!mfaToken) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Increment attempts
    mfaToken.attempts += 1;
    if (mfaToken.attempts > 5) {
      return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
    }
    await mfaToken.save();

    // Mark token as used
    mfaToken.used = true;
    await mfaToken.save();

    // Get user and generate token
    const user = await User.findById(userId).select('-password');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profile: user.profile,
        averageRating: user.averageRating,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Enable MFA for authenticated user
router.post('/enable-mfa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send verification code
    const code = generateMFACode();
    const mfaToken = new MFAToken({
      userId: user._id,
      code: code,
      type: 'registration',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    await mfaToken.save();

    const emailSent = await sendMFACode(user.email, code, 'registration');

    res.json({
      message: 'Verification code sent to ' + user.email,
      requiresVerification: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify and enable MFA
router.post('/confirm-enable-mfa', auth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Please provide verification code' });
    }

    const mfaToken = await MFAToken.findOne({
      userId: req.user.id,
      code,
      type: 'registration',
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!mfaToken) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    mfaToken.used = true;
    await mfaToken.save();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        mfaEnabled: true,
        mfaMethod: 'email',
        isVerified: true
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'MFA enabled successfully',
      user: {
        id: user._id,
        mfaEnabled: user.mfaEnabled,
        mfaMethod: user.mfaMethod,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disable MFA
router.post('/disable-mfa', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        mfaEnabled: false,
        mfaMethod: 'disabled',
        mfaSecret: null
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'MFA disabled successfully',
      mfaEnabled: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
