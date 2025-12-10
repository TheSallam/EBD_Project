const express = require('express');
const BuyerVerification = require('../models/BuyerVerification');
const User = require('../models/User'); 
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all users (farmers + buyers) + their verification status
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    // 1. Fetch all users who are buyers OR farmers
    const users = await User.find({ role: { $in: ['buyer', 'farmer'] } }).select('username email role _id');

    // 2. Fetch all existing verification records
    const verifications = await BuyerVerification.find();

    // 3. Merge them
    const results = users.map(user => {
      // Find matching verification record (checking buyerId against user._id)
      const record = verifications.find(v => v.buyerId.toString() === user._id.toString());
      return {
        userInfo: user, // Contains _id, username, email, role
        verifiedStatus: record ? record.verifiedStatus : false,
        verificationDate: record ? record.verificationDate : null,
        _id: record ? record._id : null // verification doc ID
      };
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT: Toggle verification status (Works for both farmers and buyers)
router.put('/:userId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { status } = req.body; 

    let verification = await BuyerVerification.findOne({ buyerId: userId });

    if (verification) {
      verification.verifiedStatus = status;
      verification.verificationDate = status ? new Date() : null;
      verification.verifiedBy = req.user._id;
    } else {
      // Create new record using 'buyerId' field to store the user ID (reusing schema)
      verification = new BuyerVerification({
        buyerId: userId, 
        verifiedStatus: status,
        verificationDate: status ? new Date() : null,
        verifiedBy: req.user._id
      });
    }

    await verification.save();
    res.json(verification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;