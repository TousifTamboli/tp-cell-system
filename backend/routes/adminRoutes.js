// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware: Verify Admin Token
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

// Get college stats (count of students per college)
router.get('/college-stats', authenticateAdminToken, async (req, res) => {
  try {
    const result = await User.aggregate([
      { $group: { _id: "$collegeName", count: { $sum: 1 } } }
    ]);

    const stats = {};
    result.forEach(item => {
      stats[item._id] = item.count;
    });

    // Optional: Ensure all known colleges appear (even if 0)
    const colleges = ['GHRCEM', 'GHRCACS', 'GHRISTU', 'GHRUA'];
    colleges.forEach(college => {
      if (!stats[college]) stats[college] = 0;
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching college stats:", error);
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
});


// Get all students by college
router.get('/students-by-college/:college', authenticateAdminToken, async (req, res) => {
  try {
    const students = await User.find({ 
      collegeName: req.params.college 
    }).select('-password').sort({ name: 1 });

    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

module.exports = router;