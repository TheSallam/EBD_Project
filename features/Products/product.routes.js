// features/products/product.routes.js
const express = require('express');
const Product = require('./product.model');

const router = express.Router();

// CREATE - farmer lists a new product
// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { farmerId, productName, quantity, pricePerUnit, description } = req.body;

    const product = await Product.create({
      farmerId,
      productName,
      quantity,
      pricePerUnit,
      description
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// READ ALL - buyers view all products
// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ dateListed: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// READ ONE - buyers view a single product
// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// UPDATE - farmer updates a product listing
// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE - farmer removes a product listing
// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
