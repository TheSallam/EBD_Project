const express = require('express');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const BuyerVerification = require('../models/BuyerVerification'); // Import for verification check
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET transactions (Filtered by Role)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};

    // 1. Farmers: See sales of their own products
    if (req.user.role === 'farmer') {
      const myProducts = await Product.find({ farmerId: req.user._id }).select('_id');
      const productIds = myProducts.map(p => p._id);
      query = { productId: { $in: productIds } };
    } 
    // 2. Buyers: See only their own purchases
    else if (req.user.role === 'buyer') {
      query = { buyerId: req.user._id };
    }
    // 3. Admins see all (query remains {})

    const transactions = await Transaction.find(query)
      .populate('buyerId', 'username email')
      .populate({
        path: 'productId',
        select: 'productName pricePerUnit farmerId',
        populate: { path: 'farmerId', select: 'username' }
      })
      .sort({ transactionDate: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create transaction (Buy Product)
router.post('/', authMiddleware, requireRole('buyer'), async (req, res) => {
  try {
    const { productId, quantityPurchased } = req.body;
    
    // 1. Define qty immediately to avoid "qty is not defined" errors
    const qty = Number(quantityPurchased);

    // 2. Validate Input
    if (!productId || !quantityPurchased) {
      return res.status(400).json({ message: 'productId and quantityPurchased are required' });
    }
    if (Number.isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: 'quantityPurchased must be a positive number' });
    }

    // 3. Check Verification Status
    const verification = await BuyerVerification.findOne({ buyerId: req.user._id });
    if (!verification || !verification.verifiedStatus) {
      return res.status(403).json({ 
        message: "Account not verified. You cannot make purchases until approved by an Admin." 
      });
    }

    // 4. Find Product
    const product = await Product.findById(productId);
    if (!product || product.isAvailable === false) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }

    // 5. Check Stock
    if (product.quantity < qty) {
      return res.status(400).json({ 
        message: `Not enough stock. Only ${product.quantity} kg available.` 
      });
    }

    // 6. Update Inventory
    product.quantity -= qty;
    if (product.quantity === 0) {
      product.isAvailable = false;
    }
    await product.save();

    // 7. Calculate Price
    const totalPrice = qty * Number(product.pricePerUnit || 0);

    // 8. Create Transaction (With Snapshots)
    const transaction = new Transaction({
      buyerId: req.user._id,
      productId,
      // Save snapshots so history stays accurate even if product is deleted
      productNameSnapshot: product.productName,
      priceSnapshot: product.pricePerUnit,
      
      quantityPurchased: qty,
      totalPrice,
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json({ 
      transaction, 
      message: 'Transaction successful',
      remainingStock: product.quantity 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PATCH: Update Transaction Status (Farmer or Admin)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const transaction = await Transaction.findById(req.params.id).populate('productId');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Auth Check
    const isOwner = req.user.role === 'farmer' && transaction.productId.farmerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    transaction.status = status;
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;