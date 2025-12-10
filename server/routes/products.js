const express = require('express');
const Product = require('../models/Product');
const BuyerVerification = require('../models/BuyerVerification'); // Import Verification Model
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET all products (Public/Buyers can see)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true }).populate('farmerId', 'username');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET my products (Farmer Dashboard) - NEW ROUTE
router.get('/my-products', authMiddleware, requireRole('farmer'), async (req, res) => {
  try {
    // Return all products for this farmer, regardless of isAvailable status
    const products = await Product.find({ farmerId: req.user._id }).sort({ dateListed: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create product (Farmers only + Verified Check)
router.post('/', authMiddleware, requireRole('farmer'), async (req, res) => {
  try {
    // 1. Check Verification Status
    const verification = await BuyerVerification.findOne({ buyerId: req.user._id });
    
    if (!verification || !verification.verifiedStatus) {
      return res.status(403).json({ 
        message: "Account not verified. You cannot post listings until approved by an Admin." 
      });
    }

    // 2. Create Product
    const { productName, pricePerUnit, quantity } = req.body;
    if (!productName || !pricePerUnit || !quantity) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const product = new Product({
      farmerId: req.user._id,
      productName,
      pricePerUnit,
      quantity,
      isAvailable: true
    });

    await product.save();
    res.status(201).json(product);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE product
router.delete('/:id', authMiddleware, requireRole('farmer'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmerId: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found or unauthorized' });

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;