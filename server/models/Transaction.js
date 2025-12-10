const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // SNAPSHOT FIELDS: Store these permanently so history never breaks
  productNameSnapshot: { type: String }, 
  priceSnapshot: { type: Number },
  
  quantityPurchased: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'], 
    default: 'pending' 
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);