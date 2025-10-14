const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ===== REGISTER ROUTE =====
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      collegeEmail,
      password,
      mobile,
      rollNo,
      regNo,
      collegeName,
      specialization,
      branch,
      year,
      passoutYear,
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !collegeEmail ||
      !password ||
      !mobile ||
      !rollNo ||
      !regNo ||
      !collegeName ||
      !specialization ||
      !branch ||
      !year ||
      !passoutYear
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if regNo already exists
    const existingRegNo = await User.findOne({ regNo });
    if (existingRegNo) {
      return res.status(400).json({ message: 'Registration number already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      collegeEmail,
      password,
      mobile,
      rollNo,
      regNo,
      collegeName,
      specialization,
      branch,
      year,
      passoutYear,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// ===== LOGIN ROUTE =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        collegeEmail: user.collegeEmail,
        specialization: user.specialization,
        branch: user.branch,
        year: user.year,
        passoutYear: user.passoutYear,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// ===== GET PROFILE ROUTE (Protected) =====
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Middleware: Verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Get token from "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;