const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const connection = require('./config/database');

const itemRoutes = require('./routes/item');
const users = require('./routes/user');
const orders = require('./routes/order');
const dashboard = require('./routes/dashboard');
const cart = require('./routes/cart');
const transaction = require('./routes/transaction');

app.use(cors());
app.use(express.json());

// Register API routes FIRST
app.use('/api/v1', itemRoutes);
app.use('/api/v1/user', users);
app.use('/api/v1/orders', orders);
app.use('/api/v1', dashboard);
app.use('/api/v1', cart);
app.use('/api/v1', transaction);

// Health check endpoint for frontend-backend connection
app.get('/api/v1/health', (req, res) => {
    connection.ping(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database connection failed', error: err });
        }
        res.json({ success: true, message: 'Backend and database connected successfully!' });
    });
});

app.use('/images', express.static(path.join(__dirname, 'images')))

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Clean URL rewrites for user pages
app.get('/user/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/user/home.html'));
});
app.get('/user/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/user/cart.html'));
});
app.get('/user/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/user/checkout.html'));
});


module.exports = app