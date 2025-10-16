// backend/routes/placement.js

const express = require("express");
const router = express.Router();
const PlacementDrive = require("../models/PlacementDrive");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware: Verify Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Helper function to check if deadline has passed
function isDeadlinePassed(deadline) {
  return new Date(deadline) < new Date();
}

// ===== ADMIN: CREATE NEW PLACEMENT DRIVE =====
router.post("/create-drive", authenticateToken, async (req, res) => {
  try {
    const {
      companyName,
      statuses,
      deadline,
      eligibleCourses,
      eligiblePassoutYears,
    } = req.body;

    if (
      !companyName ||
      !statuses ||
      !deadline ||
      !eligibleCourses ||
      !eligiblePassoutYears
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newDrive = new PlacementDrive({
      companyName,
      statuses,
      deadline: new Date(deadline),
      eligibleCourses,
      eligiblePassoutYears,
    });

    await newDrive.save();

    res.status(201).json({
      message: "Placement drive created successfully",
      drive: newDrive,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating drive", error: error.message });
  }
});

// ===== STUDENT: GET DRIVES FOR THEIR SPECIALIZATION AND PASSOUT YEAR =====
router.get("/get-drives", authenticateToken, async (req, res) => {
  try {
    // Get user details to find specialization and passoutYear
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all drives that include user's specialization AND passout year
    // Returns both current and past drives (frontend will filter by deadline)
    const drives = await PlacementDrive.find({
      eligibleCourses: user.specialization,
      eligiblePassoutYears: user.passoutYear,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(drives);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching drives", error: error.message });
  }
});

// ===== STUDENT: UPDATE STATUS FOR A DRIVE =====
router.post("/update-status", authenticateToken, async (req, res) => {
  try {
    const { driveId, status } = req.body;
    const userId = req.user.id;

    if (!driveId || !status) {
      return res.status(400).json({ message: "Drive ID and status required" });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the drive
    const drive = await PlacementDrive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    // CRITICAL: Check if deadline has passed
    if (isDeadlinePassed(drive.deadline)) {
      return res.status(403).json({ 
        message: "This drive has ended. You cannot update your status after the deadline." 
      });
    }

    // Check if user already registered - FIXED: Compare as strings
    const existingRegIndex = drive.registrations.findIndex(
      (reg) => reg.userId.toString() === userId.toString()
    );

    if (existingRegIndex !== -1) {
      // Update existing registration
      drive.registrations[existingRegIndex].status = status;
      drive.registrations[existingRegIndex].timestamp = new Date();
      
      // Optionally update other fields if user profile changed
      drive.registrations[existingRegIndex].userName = user.name;
      drive.registrations[existingRegIndex].userEmail = user.email;
      drive.registrations[existingRegIndex].userMobile = user.mobile;
    } else {
      // Add new registration
      drive.registrations.push({
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        userRegNo: user.regNo,
        userMobile: user.mobile,
        userSpecialization: user.specialization,
        userBranch: user.branch,
        userYear: user.year,
        userPassoutYear: user.passoutYear,
        status,
        timestamp: new Date(),
      });
    }

    await drive.save();

    res.status(200).json({
      message: "Status updated successfully",
      drive,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating status", error: error.message });
  }
});

// ===== ADMIN: GET ALL PLACEMENT DRIVES =====
router.get("/admin/all-drives", authenticateToken, async (req, res) => {
  try {
    const drives = await PlacementDrive.find().sort({ createdAt: -1 });

    // Add isPast flag to each drive
    const drivesWithStatus = drives.map(drive => ({
      ...drive.toObject(),
      isPast: isDeadlinePassed(drive.deadline)
    }));

    res.status(200).json(drivesWithStatus);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching drives", error: error.message });
  }
});

// ===== ADMIN: GET SINGLE DRIVE WITH REGISTRATIONS =====
router.get("/admin/drive/:driveId", authenticateToken, async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.driveId).populate(
      "registrations.userId",
      "name email specialization branch year"
    );

    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    // Add isPast flag
    const driveWithStatus = {
      ...drive.toObject(),
      isPast: isDeadlinePassed(drive.deadline)
    };

    res.status(200).json(driveWithStatus);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching drive", error: error.message });
  }
});

// ===== ADMIN: UPDATE PLACEMENT DRIVE =====
router.put(
  "/admin/update-drive/:driveId",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        companyName,
        statuses,
        deadline,
        eligibleCourses,
        eligiblePassoutYears,
        isActive,
      } = req.body;

      const drive = await PlacementDrive.findByIdAndUpdate(
        req.params.driveId,
        {
          companyName,
          statuses,
          deadline: new Date(deadline),
          eligibleCourses,
          eligiblePassoutYears,
          isActive,
        },
        { new: true }
      );

      if (!drive) {
        return res.status(404).json({ message: "Drive not found" });
      }

      res.status(200).json({
        message: "Drive updated successfully",
        drive,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error updating drive", error: error.message });
    }
  }
);

// ===== ADMIN: DELETE PLACEMENT DRIVE =====
router.delete(
  "/admin/delete-drive/:driveId",
  authenticateToken,
  async (req, res) => {
    try {
      const drive = await PlacementDrive.findByIdAndDelete(req.params.driveId);

      if (!drive) {
        return res.status(404).json({ message: "Drive not found" });
      }

      res.status(200).json({ message: "Drive deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error deleting drive", error: error.message });
    }
  }
);

// ===== STUDENT: GET PAST DRIVES =====
router.get("/past-drives", authenticateToken, async (req, res) => {
  try {
    const drives = await PlacementDrive.find({
      "registrations.userId": req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(drives);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching past drives", error: error.message });
  }
});

module.exports = router;