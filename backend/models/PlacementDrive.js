// backend/models/PlacementDrive.js

const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  statuses: {
    type: [String],
    required: true,
    default: [],
  },
  deadline: {
    type: Date,
    required: true,
  },
  eligibleCourses: {
    type: [String],
    required: true,
    default: [],
  },
  eligiblePassoutYears: {
    type: [String],
    required: true,
    default: [],
  },
  registrations: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      userName: String,
      userEmail: String,
      userSpecialization: String,
      userBranch: String,
      userYear: String,
      userPassoutYear: String,
      status: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);