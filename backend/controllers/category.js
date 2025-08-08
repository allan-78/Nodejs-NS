const connection = require('../config/database');

// Get all categories
exports.getAllCategories = (req, res) => {
    connection.query('SELECT id, name FROM categories ORDER BY name', (err, rows) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.json({ categories: rows });
    });
};

// Get a single category by ID
exports.getSingleCategory = (req, res) => {
    const categoryId = parseInt(req.params.id, 10);
    if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID.' });
    }

    connection.query('SELECT id, name FROM categories WHERE id = ?', [categoryId], (err, results) => {
        if (err) {
            console.error('Error fetching single category:', err);
            return res.status(500).json({ error: 'Database error', details: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        res.status(200).json({ success: true, category: results[0] });
    });
};

// Create a new category
exports.createCategory = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
    }

    connection.query('INSERT INTO categories (name) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.error('Error creating category:', err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.status(201).json({ success: true, message: 'Category created successfully.', categoryId: result.insertId });
    });
};

// Update an existing category
exports.updateCategory = (req, res) => {
    const categoryId = parseInt(req.params.id, 10);
    const { name } = req.body;

    if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID.' });
    }
    if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
    }

    connection.query('UPDATE categories SET name = ? WHERE id = ?', [name, categoryId], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.status(200).json({ success: true, message: 'Category updated successfully.' });
    });
};

// Delete a category
exports.deleteCategory = (req, res) => {
    const categoryId = parseInt(req.params.id, 10);

    if (isNaN(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID.' });
    }

    connection.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.status(200).json({ success: true, message: 'Category deleted successfully.' });
    });
};