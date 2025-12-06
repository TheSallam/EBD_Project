const express = require('express');
const router = express.Router();
const { logPurchase, getHistory } = require('../controllers/transactionController');

// Route to get the transaction history
// GET /api/transactions
router.get('/', getHistory);

// Route to log a new purchase
// POST /api/transactions
router.post('/', logPurchase);

module.exports = router;

// Don't forget to import this into your main server file (e.g., server.js or app.js)
// app.use('/api/transactions', require('./routes/transactionRoutes'));