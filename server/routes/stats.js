const express = require('express');
const Product = require('../models/Product');
const BuyerVerification = require('../models/BuyerVerification');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // 1. Count Active Listings
    const activeListings = await Product.countDocuments({ isAvailable: true });

    // 2. Count Verified Buyers
    const verifiedBuyers = await BuyerVerification.countDocuments({ verifiedStatus: true });

    // 3. Count Transactions (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTransactions = await Transaction.countDocuments({
      transactionDate: { $gte: sevenDaysAgo }
    });

    // 4. Calculate Total Revenue (Sum of totalPrice in all transactions)
    // Using MongoDB Aggregation for performance
    const revenueAgg = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.json({
      activeListings,
      verifiedBuyers,
      recentTransactions,
      totalRevenue
    });

  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;