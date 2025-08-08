
const express = require('express');

const router = express.Router();
const { deleteOrder, createOrder, getUserOrders, updateTransactionStatus, getAllOrders } = require('../controllers/order');
const { isAuthenticatedUser } = require('../middlewares/auth');

// Admin: delete order and related records
router.delete('/admin/orders/:id', isAuthenticatedUser, (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can delete orders' });
    }
    next();
}, deleteOrder);

router.post('/create-order', isAuthenticatedUser, createOrder)

// Public guest checkout (no auth)
router.post('/orders/create', createOrder)

// Get all orders for a user (fix path to / for /api/v1/orders?user_id=...)
router.get('/', isAuthenticatedUser, getUserOrders);

// Admin: Get all orders
router.get('/admin/orders', isAuthenticatedUser, (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can view all orders' });
    }
    next();
}, getAllOrders);

// Admin: update transaction status and send email with PDF
router.put('/admin/orders/:id/status', isAuthenticatedUser, (req, res, next) => {
    // Only allow admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can update order status' });
    }
    next();
}, updateTransactionStatus);

module.exports = router;