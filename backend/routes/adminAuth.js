// backend/routes/adminAuth.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (adminId) => {
  return jwt.sign({ adminId, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Admin Login Route
router.post('/login', (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password required' });
    }

    // Check against admin password in .env
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }

    // Generate token
    const token = generateToken('admin');

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: {
        id: 'admin',
        role: 'admin',
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Middleware: Verify Admin JWT token
function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
    if (err || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.admin = admin;
    next();
  });
}

module.exports = { router, authenticateAdminToken };