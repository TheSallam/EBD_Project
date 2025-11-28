// features/products/product.model.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  description: { type: String },
  dateListed: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
