// backend/routes/placement.js

const express = require('express');
const router = express.Router();
const PlacementDrive = require('../models/PlacementDrive');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware: Verify Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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

// ===== ADMIN: CREATE NEW PLACEMENT DRIVE =====
router.post('/create-drive', authenticateToken, async (req, res) => {
  try {
    const { companyName, statuses, deadline, eligibleCourses } = req.body;

    if (!companyName || !statuses || !deadline || !eligibleCourses) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newDrive = new PlacementDrive({
      companyName,
      statuses,
      deadline: new Date(deadline),
      eligibleCourses,
    });

    await newDrive.save();

    res.status(201).json({
      message: 'Placement drive created successfully',
      drive: newDrive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating drive', error: error.message });
  }
});

// ===== STUDENT: GET DRIVES FOR THEIR SPECIALIZATION =====
router.get('/get-drives', authenticateToken, async (req, res) => {
  try {
    // Get user details to find specialization
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find active drives that include user's specialization
    const drives = await PlacementDrive.find({
      eligibleCourses: user.specialization,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(drives);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching drives', error: error.message });
  }
});

// ===== STUDENT: UPDATE STATUS FOR A DRIVE =====
router.post('/update-status', authenticateToken, async (req, res) => {
  try {
    const { driveId, status } = req.body;
    const userId = req.user.id;

    if (!driveId || !status) {
      return res.status(400).json({ message: 'Drive ID and status required' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the drive
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    // Check if user already registered
    const existingReg = drive.registrations.findIndex(
      (reg) => reg.userId.toString() === userId
    );

    if (existingReg !== -1) {
      // Update existing registration
      drive.registrations[existingReg].status = status;
      drive.registrations[existingReg].timestamp = new Date();
    } else {
      // Add new registration
      drive.registrations.push({
        userId,
        userName: user.name,
        userEmail: user.email,
        userSpecialization: user.specialization,
        userBranch: user.branch,
        userYear: user.year,
        status,
        timestamp: new Date(),
      });
    }

    await drive.save();

    res.status(200).json({
      message: 'Status updated successfully',
      drive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

// ===== ADMIN: GET ALL PLACEMENT DRIVES =====
router.get('/admin/all-drives', authenticateToken, async (req, res) => {
  try {
    const drives = await PlacementDrive.find().sort({ createdAt: -1 });

    res.status(200).json(drives);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching drives', error: error.message });
  }
});

// ===== ADMIN: GET SINGLE DRIVE WITH REGISTRATIONS =====
router.get('/admin/drive/:driveId', authenticateToken, async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.driveId).populate(
      'registrations.userId',
      'name email specialization branch year'
    );

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    res.status(200).json(drive);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching drive', error: error.message });
  }
});

// ===== ADMIN: UPDATE PLACEMENT DRIVE =====
router.put('/admin/update-drive/:driveId', authenticateToken, async (req, res) => {
  try {
    const { companyName, statuses, deadline, eligibleCourses, isActive } = req.body;

    const drive = await PlacementDrive.findByIdAndUpdate(
      req.params.driveId,
      {
        companyName,
        statuses,
        deadline: new Date(deadline),
        eligibleCourses,
        isActive,
      },
      { new: true }
    );

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    res.status(200).json({
      message: 'Drive updated successfully',
      drive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating drive', error: error.message });
  }
});

// ===== ADMIN: DELETE PLACEMENT DRIVE =====
router.delete('/admin/delete-drive/:driveId', authenticateToken, async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndDelete(req.params.driveId);

    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    res.status(200).json({ message: 'Drive deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting drive', error: error.message });
  }
});

// ===== STUDENT: GET PAST DRIVES =====
router.get('/past-drives', authenticateToken, async (req, res) => {
  try {
    const drives = await PlacementDrive.find({
      'registrations.userId': req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(drives);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching past drives', error: error.message });
  }
});

module.exports = router;