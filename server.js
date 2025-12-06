// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./features/products/product.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Feature routes
app.use('/api/products', productRoutes);

// MongoDB connection
 const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
