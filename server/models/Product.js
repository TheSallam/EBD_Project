const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  description: String,
  dateListed: { type: Date, default: Date.now },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', ProductSchema);
