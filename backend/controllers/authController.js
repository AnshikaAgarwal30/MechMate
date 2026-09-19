const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'customer',
      address: address || {}
    });

    // Mechanics must be approved by an admin before they can log in.
    if (user.role === 'mechanic') {
      // Notify all admins about new mechanic registration
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await Notification.create({
          recipient: admin._id,
          type: 'mechanic_approval',
          title: 'New Mechanic Registration',
          message: `Mechanic ${user.name} (${user.email}) has registered and requires admin approval.`,
          relatedId: user._id,
          relatedModel: 'User'
        });
      }
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message: 'Mechanic registration successful. Please wait for admin approval before logging in.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    }

    const token = user.getJwtToken();

    res.status(201).json({
      success: true,
      pendingApproval: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.role === 'mechanic' && !user.mechanicDetails.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your mechanic account is pending approval'
      });
    }

    const token = user.getJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
