const express = require('express');

const router = express.Router();


const { addressChart, salesChart, itemsChart, mostBoughtProduct, mostBuyingUser } = require('../controllers/dashboard');
const { listUsers, updateUserRole, deactivateUser, reactivateUser, addUserByAdmin } = require('../controllers/user');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
// Only admin can access dashboard charts
router.get('/address-chart', isAuthenticatedUser, authorizeRoles('admin'), addressChart);
router.get('/sales-chart', isAuthenticatedUser, authorizeRoles('admin'), salesChart);
router.get('/items-chart', isAuthenticatedUser, authorizeRoles('admin'), itemsChart);
router.get('/most-bought-product', isAuthenticatedUser, authorizeRoles('admin'), mostBoughtProduct);
router.get('/most-buying-user', isAuthenticatedUser, authorizeRoles('admin'), mostBuyingUser);

// User management for admin
router.get('/users', isAuthenticatedUser, authorizeRoles('admin'), listUsers); // paginated
router.get('/users/count', isAuthenticatedUser, authorizeRoles('admin'), (req, res) => {
    // Count users for pagination
    const connection = require('../config/database');
    connection.query('SELECT COUNT(*) as total FROM users', (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error', details: err });
        res.json({ total: rows[0].total });
    });
});
router.put('/users/role', isAuthenticatedUser, authorizeRoles('admin'), updateUserRole);
router.put('/users/:id/deactivate', isAuthenticatedUser, authorizeRoles('admin'), deactivateUser);
router.put('/users/:id/reactivate', isAuthenticatedUser, authorizeRoles('admin'), reactivateUser);
router.post('/users/add', isAuthenticatedUser, authorizeRoles('admin'), addUserByAdmin);

module.exports = router;




