const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { getAllReviews, getSingleReview, createReview, updateReview, deleteReview } = require('../controllers/review');

router.get('/reviews', isAuthenticatedUser, authorizeRoles('admin'), getAllReviews);
router.get('/reviews/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleReview);
router.post('/reviews', isAuthenticatedUser, authorizeRoles('admin'), createReview);
router.put('/reviews/:id', isAuthenticatedUser, authorizeRoles('admin'), updateReview);
router.delete('/reviews/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteReview);

module.exports = router;