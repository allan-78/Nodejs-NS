const connection = require('../config/db');

// Get all reviews
exports.getAllReviews = (req, res) => {
    const sql = `SELECT r.*, p.name as product_name, u.name as user_name
                 FROM reviews r
                 JOIN products p ON r.product_id = p.id
                 JOIN users u ON r.user_id = u.id`;
    connection.query(sql, (err, rows) => {
        if (err) {
            console.error('Error fetching reviews:', { error: err });
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.json({ reviews: rows });
    });
};

// Get a single review by ID
exports.getSingleReview = (req, res) => {
    const reviewId = req.params.id;
    const sql = `SELECT r.*, p.name as product_name, u.name as user_name
                 FROM reviews r
                 JOIN products p ON r.product_id = p.id
                 JOIN users u ON r.user_id = u.id
                 WHERE r.id = ?`;
    connection.query(sql, [reviewId], (err, rows) => {
        if (err) {
            console.error('Error fetching single review:', { error: err });
            return res.status(500).json({ error: 'Database error', details: err });
        }
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ review: rows[0] });
    });
};

// Create a new review
exports.createReview = (req, res) => {
    const { product_id, user_id, rating, comment } = req.body;
    if (!product_id || !user_id || !rating || !comment) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const sql = 'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
    connection.query(sql, [product_id, user_id, rating, comment], (err, result) => {
        if (err) {
            console.error('Error creating review:', { error: err });
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.status(201).json({ message: 'Review created successfully', id: result.insertId });
    });
};

// Update an existing review
exports.updateReview = (req, res) => {
    const reviewId = req.params.id;
    const { product_id, user_id, rating, comment } = req.body;
    if (!product_id || !user_id || !rating || !comment) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    const sql = 'UPDATE reviews SET product_id = ?, user_id = ?, rating = ?, comment = ? WHERE id = ?';
    connection.query(sql, [product_id, user_id, rating, comment, reviewId], (err, result) => {
        if (err) {
            console.error('Error updating review:', { error: err });
            return res.status(500).json({ error: 'Database error', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review updated successfully' });
    });
};

// Delete a review
exports.deleteReview = (req, res) => {
    const reviewId = req.params.id;
    const sql = 'DELETE FROM reviews WHERE id = ?';
    connection.query(sql, [reviewId], (err, result) => {
        if (err) {
            console.error('Error deleting review:', { error: err });
            return res.status(500).json({ error: 'Database error', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted successfully' });
    });
};