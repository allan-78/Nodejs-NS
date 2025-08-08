const express = require('express');
const router = express.Router();

const { getTransactionDetails } = require('../controllers/cart');
const { updateTransaction, getTransactionList } = require('../controllers/transaction');
const { isAuthenticatedUser } = require('../middlewares/auth');

// GET /api/v1/transaction/list
router.get('/transaction/list', isAuthenticatedUser, getTransactionList);

// GET /api/v1/transaction/:id
router.get('/transaction/:id', isAuthenticatedUser, getTransactionDetails);

// PATCH /api/v1/transaction/update
router.patch('/transaction/update', isAuthenticatedUser, updateTransaction);

module.exports = router;
