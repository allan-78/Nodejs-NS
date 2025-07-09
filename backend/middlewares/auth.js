// Middleware to check user role
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user.id is set by isAuthenticatedUser
        const sql = 'SELECT id, role FROM users WHERE id = ?';
        connection.execute(sql, [req.user.id], (err, results) => {
            if (err || results.length === 0) {
                return res.status(403).json({ message: 'User not found or unauthorized' });
            }
            const user = results[0];
            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: `Access denied. Only [${roles.join(', ')}] can access this resource.` });
            }
            next();
        });
    };
};
const jwt = require("jsonwebtoken");
const connection = require('../config/database');

exports.isAuthenticatedUser = (req, res, next) => {
    if (!req.header('Authorization')) {
        return res.status(401).json({ message: 'Login first to access this resource' });
    }
    const token = req.header('Authorization').split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Login first to access this resource' });
    }
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
    // Check if token matches the user's api_token in DB
    const sql = 'SELECT id, api_token, role FROM users WHERE id = ?';
    connection.execute(sql, [decoded.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }
        const user = results[0];
        if (user.api_token !== token) {
            return res.status(401).json({ message: 'Token mismatch. Please login again.' });
        }
        req.user = { id: user.id, role: user.role };
        next();
    });
};

