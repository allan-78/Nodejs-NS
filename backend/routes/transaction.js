const express = require('express');
const router = express.Router();
const { getTransactionDetails } = require('../controllers/cart');
const { isAuthenticatedUser } = require('../middlewares/auth');

// GET /api/v1/transaction/:id
router.get('/transaction/:id', isAuthenticatedUser, getTransactionDetails);

module.exports = router;
