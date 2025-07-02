const connection = require('../config/database');

// Get all products (hardware items)
exports.getAllItems = (req, res) => {
    // Filtering
    let filters = [];
    let values = [];
    if (req.query.categories) {
        const cats = req.query.categories.split(',').map(Number).filter(Boolean);
        if (cats.length) {
            filters.push(`p.category_id IN (${cats.map(() => '?').join(',')})`);
            values.push(...cats);
        }
    }
    if (req.query.min_price) {
        filters.push('p.price >= ?');
        values.push(Number(req.query.min_price));
    }
    if (req.query.max_price) {
        filters.push('p.price <= ?');
        values.push(Number(req.query.max_price));
    }
    let sql = `SELECT p.*, c.name as category_name, pi.image_path,
        (SELECT AVG(CAST(rating AS DECIMAL(2,1))) FROM reviews WHERE product_id = p.id) as avg_rating
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id`;
    if (filters.length) {
        sql += ' WHERE ' + filters.join(' AND ');
    }
    try {
        connection.query(sql, values, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(500).json({ error: 'Database error', details: err });
            }
            return res.status(200).json({
                products: rows,
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error', details: error });
    }
};

// Get all categories (for filter sidebar)
exports.getAllCategories = (req, res) => {
    connection.query('SELECT id, name FROM categories ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        res.json({ categories: rows });
    });
};

// Get a single product by ID
exports.getSingleItem = (req, res) => {
    const sql = `SELECT p.*, c.name as category_name, pi.image_path FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 LEFT JOIN product_images pi ON p.id = pi.product_id
                 WHERE p.id = ?`;
    const values = [parseInt(req.params.id)];
    try {
        connection.execute(sql, values, (err, result, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(500).json({ error: 'Database error', details: err });
            }
            return res.status(200).json({
                success: true,
                product: result[0]
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error', details: error });
    }
}

// Create a new product (hardware item)
exports.createItem = (req, res) => {
    const { name, description, price, category_id, stock } = req.body;
    let imagePath = null;
    if (req.file) {
        imagePath = req.file.path.replace(/\\/g, "/");
    }
    if (!name || !description || !price || !category_id || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Insert product
    const sql = 'INSERT INTO products (name, description, price, category_id, stock) VALUES (?, ?, ?, ?, ?)';
    const values = [name, description, price, category_id, stock];
    connection.execute(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error inserting product', details: err });
        }
        const productId = result.insertId;
        // Insert image if provided
        if (imagePath) {
            const imgSql = 'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)';
            connection.execute(imgSql, [productId, imagePath], (imgErr) => {
                if (imgErr) {
                    console.log(imgErr);
                }
            });
        }
        return res.status(201).json({
            success: true,
            productId,
            image: imagePath,
            stock
        });
    });
}

// Update an existing product (hardware item)
exports.updateItem = (req, res) => {
    const id = req.params.id;
    const { name, description, price, category_id, stock } = req.body;
    let imagePath = null;
    if (req.file) {
        imagePath = req.file.path.replace(/\\/g, "/");
    }
    if (!name || !description || !price || !category_id || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Update product
    const sql = 'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ? WHERE id = ?';
    const values = [name, description, price, category_id, stock, id];
    connection.execute(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error updating product', details: err });
        }
        // Update image if provided
        if (imagePath) {
            const imgSql = 'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)';
            connection.execute(imgSql, [id, imagePath], (imgErr) => {
                if (imgErr) {
                    console.log(imgErr);
                }
            });
        }
        return res.status(200).json({
            success: true,
        });
    });
}

// Delete a product (hardware item)
exports.deleteItem = (req, res) => {
    const id = req.params.id;
    // Delete product images first
    const imgSql = 'DELETE FROM product_images WHERE product_id = ?';
    connection.execute(imgSql, [id], (imgErr) => {
        if (imgErr) {
            console.log(imgErr);
        }
        // Then delete the product
        const sql = 'DELETE FROM products WHERE id = ?';
        connection.execute(sql, [id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error deleting product', details: err });
            }
            return res.status(200).json({
                success: true,
                message: 'Product deleted'
            });
        });
    });
}

// Get product details (with images, avg rating)
exports.getProductDetails = (req, res) => {
    const product_id = req.params.id;
    const sql = `SELECT p.*, 
        (SELECT AVG(CAST(rating AS DECIMAL(2,1))) FROM reviews WHERE product_id = p.id) as avg_rating
        FROM products p WHERE p.id = ?`;
    connection.query(sql, [product_id], (err, results) => {
        if (err || !results.length) return res.status(404).json({ error: 'Product not found' });
        const product = results[0];
        // Get images
        connection.query('SELECT image_path FROM product_images WHERE product_id = ?', [product_id], (err, images) => {
            product.images = images ? images.map(i => i.image_path) : [];
            res.json({ product });
        });
    });
};

// Get product reviews
exports.getProductReviews = (req, res) => {
    const product_id = req.params.id;
    const sql = `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`;
    connection.query(sql, [product_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        res.json({ reviews: results });
    });
};

// Add a review (user only)
exports.addProductReview = (req, res) => {
    const product_id = req.params.id;
    const jwtUserId = req.user && req.user.id; // Use req.user.id from auth middleware
    if (!jwtUserId) return res.status(401).json({ error: 'Not logged in' });
    const { rating, comment } = req.body;
    if (!rating || !comment) return res.status(400).json({ error: 'Missing rating or comment' });
    const sql = 'INSERT INTO reviews (user_id, product_id, comment, rating, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
    connection.query(sql, [jwtUserId, product_id, comment, rating], (err) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        res.json({ success: true });
    });
};

// Edit a review (user only)
exports.editProductReview = (req, res) => {
    const review_id = req.params.review_id;
    const jwtUserId = req.user && req.user.id;
    const { rating, comment } = req.body;
    if (!jwtUserId) return res.status(401).json({ error: 'Not logged in' });
    if (!rating || !comment) return res.status(400).json({ error: 'Missing rating or comment' });
    // Only allow editing own review
    const sql = 'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ? AND user_id = ?';
    connection.query(sql, [rating, comment, review_id, jwtUserId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        if (result.affectedRows === 0) return res.status(403).json({ error: 'Not allowed to edit this review' });
        res.json({ success: true });
    });
};

// Delete a review (user only)
exports.deleteProductReview = (req, res) => {
    const review_id = req.params.review_id;
    const jwtUserId = req.user && req.user.id;
    if (!jwtUserId) return res.status(401).json({ error: 'Not logged in' });
    // Only allow deleting own review
    const sql = 'DELETE FROM reviews WHERE id = ? AND user_id = ?';
    connection.query(sql, [review_id, jwtUserId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        if (result.affectedRows === 0) return res.status(403).json({ error: 'Not allowed to delete this review' });
        res.json({ success: true });
    });
};

// Product search for autocomplete
exports.searchItems = (req, res) => {
    const q = req.query.q ? req.query.q.trim() : '';
    if (!q || q.length < 2) {
        return res.json({ items: [] });
    }
    const sql = `SELECT id, name FROM products WHERE name LIKE ? ORDER BY name LIMIT 10`;
    connection.execute(sql, [`%${q}%`], (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.json({ items: rows });
    });
};

