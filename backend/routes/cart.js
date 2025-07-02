const express = require('express');
const router = express.Router();
const { addToCart, getCartCount, getCartItems, checkout } = require('../controllers/cart');
const { isAuthenticatedUser } = require('../middlewares/auth');

// Public add to cart endpoint
router.post('/cart/add', addToCart);
// Public get cart count endpoint
router.get('/cart/count', getCartCount);
// Get all cart items for logged-in user
router.get('/cart/items', getCartItems);
// POST /api/v1/cart/checkout
router.post('/cart/checkout', isAuthenticatedUser, checkout);

module.exports = router;
