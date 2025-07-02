const express = require('express');
const router = express.Router();
const upload = require('../utils/multer')


const { getAllItems,
    getSingleItem,
    createItem,
    updateItem,
    deleteItem,
    getProductDetails,
    getProductReviews,
    addProductReview,
    editProductReview,
    deleteProductReview
} = require('../controllers/item')

const {isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth')

router.get('/items', getAllItems);
router.get('/categories', require('../controllers/item').getAllCategories);
router.get('/items/:id', getSingleItem)
router.post('/items', isAuthenticatedUser, authorizeRoles('admin'), upload.single('image'), createItem)
router.put('/items/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.single('image'), updateItem)
router.delete('/items/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteItem)
router.get('/product/:id', getProductDetails);
router.get('/product/:id/reviews', getProductReviews);
router.post('/product/:id/reviews', isAuthenticatedUser, addProductReview);
router.put('/review/:review_id', isAuthenticatedUser, editProductReview);
router.delete('/review/:review_id', isAuthenticatedUser, deleteProductReview);
// Product search autocomplete
router.get('/items/search', require('../controllers/item').searchItems);
module.exports = router;
