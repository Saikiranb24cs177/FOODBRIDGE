const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const dataService = require('../services/dataService');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'foodbridge_super_secret_jwt_key_998811',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// In-memory or temporary reset tokens map for forgot password simulation
const resetTokens = new Map();

// @desc    Register a new user (donor or ngo only)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role = 'donor',
      organizationName,
      organizationType,
      phone,
      address,
      city,
      state,
      pinCode,
      registrationNumber,
      darpanId,
    } = req.body;

    if (!name || !email || !password || !phone || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, phone, address, city)',
      });
    }

    // Admin accounts must NOT be registered publicly!
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Security policy: Administrator accounts cannot be registered publicly.',
      });
    }

    if (!['donor', 'ngo'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either donor or ngo',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const userExists = await dataService.findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isNgo = role === 'ngo';

    const user = await dataService.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      organizationName: organizationName || (role === 'donor' ? `${name}'s Kitchen` : `${name} Foundation`),
      organizationType: organizationType || (role === 'donor' ? 'Restaurant' : 'NGO'),
      phone,
      address,
      city,
      state: state || 'Karnataka',
      pinCode: pinCode || '560001',
      verificationStatus: isNgo ? 'pending' : 'verified',
      isVerified: !isNgo,
      verificationDetails: {
        registrationNumber: registrationNumber || '',
        darpanId: darpanId || '',
      },
      status: 'active',
    });

    const token = generateToken(user._id);

    // Welcome Notification
    try {
      await Notification.create({
        userId: user._id,
        title: `Welcome to FoodBridge, ${user.name}!`,
        message: isNgo
          ? 'Your NGO registration has been submitted. Our compliance team will review your verification details shortly.'
          : 'Thank you for joining our zero-waste mission. You can now post surplus food batches in seconds.',
        type: 'system',
        link: isNgo ? '/ngo/dashboard' : '/donor/dashboard',
      });
    } catch (err) {
      console.warn('Welcome notification skipped:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        organizationType: user.organizationType,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pinCode: user.pinCode,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await dataService.findUserByEmail(email, true);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administrators.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationName: user.organizationName,
        organizationType: user.organizationType,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pinCode: user.pinCode,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me or GET /api/users/profile
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await dataService.findUserById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile or PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      address,
      city,
      state,
      pinCode,
      organizationName,
      organizationType,
      beneficiaryCapacity,
      preferredCategories,
    } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (state) updates.state = state;
    if (pinCode) updates.pinCode = pinCode;
    if (organizationName) updates.organizationName = organizationName;
    if (organizationType) updates.organizationType = organizationType;
    if (beneficiaryCapacity) updates.beneficiaryCapacity = Number(beneficiaryCapacity);
    if (preferredCategories) updates.preferredCategories = preferredCategories;

    const updatedUser = await dataService.updateUser(req.user._id, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await dataService.findUserByEmail(email);
    if (!user) {
      // Don't leak user existence in production; in dev provide confirmation
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    const resetToken = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    resetTokens.set(email.toLowerCase(), {
      token: resetToken,
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      success: true,
      message: 'Password reset code generated successfully.',
      resetToken, // Returned for dev simulation ease
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    resetTokens.delete(email.toLowerCase());

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
};
