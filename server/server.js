const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const statsRoute = require('./routes/stats'); // Add this

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is required in env');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in env');
}

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoute = require('./routes/auth');
const productsRoute = require('./routes/products');
const buyerRoute = require('./routes/buyerVerification');
const transactionsRoute = require('./routes/transactions');

app.use('/api/auth', authRoute);
app.use('/api/products', productsRoute);
app.use('/api/buyer-verification', buyerRoute);
app.use('/api/transactions', transactionsRoute);
app.use('/api/stats', statsRoute);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState });
});

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'Digital B2B Farmers Marketplace API - Milestone 1' });
});

// Global error handler placeholder
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
