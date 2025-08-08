const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')
const {registerUser, loginUser, updateUser, deactivateUser, verifyEmail, getProfile, updateProfile, changePassword, getUserReviews, getUnreviewedProducts, uploadProfilePhoto, updateUserRole, listUsers, reactivateUser, deleteUser} = require('../controllers/user')
const {isAuthenticatedUser} = require('../middlewares/auth')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/update-profile', isAuthenticatedUser, upload.single('image'), updateUser)
router.delete('/deactivate', isAuthenticatedUser, deactivateUser)
router.get('/verify-email', verifyEmail)

// Profile endpoints
router.get('/profile', isAuthenticatedUser, getProfile)
router.put('/profile', isAuthenticatedUser, updateProfile)
router.put('/password', isAuthenticatedUser, changePassword)

// Profile photo upload endpoint
router.post('/profile-photo', isAuthenticatedUser, upload.single('profile_photo'), require('../controllers/user').uploadProfilePhoto);

// User reviews endpoint
router.get('/reviews', isAuthenticatedUser, getUserReviews);

// User unreviewed products endpoint
router.get('/unreviewed-products', isAuthenticatedUser, getUnreviewedProducts);

// Admin: Delete user by ID
router.delete('/admin/:id', isAuthenticatedUser, (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can delete users' });
    }
    next();
}, deleteUser);

module.exports = router;