const mongoose = require('mongoose');

const BuyerVerificationSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedStatus: { type: Boolean, default: false },
  verificationDate: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin
});

module.exports = mongoose.model('BuyerVerification', BuyerVerificationSchema);
