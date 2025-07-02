const express = require('express');

const router = express.Router();

const {createOrder, getUserOrders} = require('../controllers/order')
const {isAuthenticatedUser} = require('../middlewares/auth')

router.post('/create-order', isAuthenticatedUser, createOrder)

// Public guest checkout (no auth)
router.post('/orders/create', createOrder)

// Get all orders for a user (fix path to / for /api/v1/orders?user_id=...)
router.get('/', isAuthenticatedUser, getUserOrders);

module.exports = router;