const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will store hashed value
  role:     { type: String, enum: ['farmer', 'buyer', 'admin'], required: true },
  createdAt:{ type: Date, default: Date.now }
});

// Compare password method (plain bcrypt.compare against stored hash)
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
