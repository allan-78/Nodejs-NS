const connection = require('../config/db');
const fs = require('fs');

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
    if (req.query.search) {
        const searchQuery = `%${req.query.search}%`;
        filters.push('(p.name LIKE ? OR p.description LIKE ?)');
        values.push(searchQuery, searchQuery);
    }
    
    // Handle sorting
    let orderBy = 'p.id DESC'; // Default sorting
    if (req.query.sort) {
        switch (req.query.sort) {
            case 'name_asc':
                orderBy = 'p.name ASC';
                break;
            case 'name_desc':
                orderBy = 'p.name DESC';
                break;
            case 'price_asc':
                orderBy = 'p.price ASC';
                break;
            case 'price_desc':
                orderBy = 'p.price DESC';
                break;
            case 'rating_desc':
                orderBy = 'avg_rating DESC NULLS LAST';
                break;
            case 'rating_asc':
                orderBy = 'avg_rating ASC NULLS LAST';
                break;
            default:
                orderBy = 'p.id DESC';
        }
    }
    
    let sql = `SELECT p.*, c.name as category_name,
        (SELECT AVG(CAST(rating AS DECIMAL(2,1))) FROM reviews WHERE product_id = p.id) as avg_rating
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id`;
    if (filters.length) {
        sql += ' WHERE ' + filters.join(' AND ');
    }
    sql += ` ORDER BY ${orderBy}`;
    try {
        connection.query(sql, values, async (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(500).json({ error: 'Database error', details: err });
            }
            // For each product, fetch its images
            const productIds = rows.map(r => r.id);
            if (productIds.length === 0) {
                return res.status(200).json({ products: [] });
            }
            connection.query('SELECT product_id, image_path FROM product_images WHERE product_id IN (?)', [productIds], (imgErr, imgRows) => {
                if (imgErr) {
                    console.log(imgErr);
                    return res.status(500).json({ error: 'Database error', details: imgErr });
                }
                // Map images to products
                const imagesMap = {};
                imgRows.forEach(img => {
                    if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
                    // Ensure image path has the correct format
                    let imagePath;
                    if (img.image_path.startsWith('http://') || img.image_path.startsWith('https://')) {
                        // If path already starts with http:// or https://, return as is
                        imagePath = img.image_path;
                    } else if (img.image_path.startsWith('/')) {
                        // If path starts with /, it's already a full path
                        imagePath = img.image_path;
                    } else if (img.image_path.includes('products/')) {
                        // If path includes 'products/', it's a relative path from images directory
                        imagePath = '/images/' + img.image_path;
                    } else {
                        // Otherwise, assume it's a product image filename in the products folder
                        imagePath = '/images/products/' + img.image_path;
                    }
                    imagesMap[img.product_id].push({ id: img.id, path: imagePath });
                });
                const products = rows.map(prod => {
                    return {
                        ...prod,
                        images: imagesMap[prod.id] || []
                    };
                });
                return res.status(200).json({ products });
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
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const sql = `SELECT p.*, c.name as category_name 
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE p.id = ?`;
    
    connection.query(sql, [productId], (err, results) => {
        if (err) {
            console.error('SQL Error in getSingleItem:', err);
            return res.status(500).json({ error: 'Database error while fetching product.', details: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const productData = results[0];

        connection.query('SELECT id, image_path FROM product_images WHERE product_id = ?', [productId], (imgErr, imgRows) => {
            if (imgErr) {
                console.error('SQL Error in getSingleItem (images):', imgErr);
                return res.status(500).json({ error: 'Database error while fetching images.', details: imgErr });
            }

                            const product = {
                    ...productData,
                    images: imgRows ? imgRows.map(i => {
                        // Ensure image path has the correct format
                        let imagePath;
                        if (i.image_path.startsWith('http://') || i.image_path.startsWith('https://')) {
                            // If path already starts with http:// or https://, return as is
                            imagePath = i.image_path;
                        } else if (i.image_path.startsWith('/')) {
                            // If path starts with /, it's already a full path
                            imagePath = i.image_path;
                        } else if (i.image_path.includes('products/')) {
                            // If path includes 'products/', it's a relative path from images directory
                            imagePath = '/images/' + i.image_path;
                        } else {
                            // Otherwise, assume it's a product image filename in the products folder
                            imagePath = '/images/products/' + i.image_path;
                        }
                        return { id: i.id, path: imagePath };
                    }) : []
                };

            return res.status(200).json({
                success: true,
                product
            });
        });
    });
};

// Create a new product (hardware item)
exports.createItem = (req, res) => {
    // Accept both form-data and JSON
    let name, description, price, category_id, stock;
    if (req.body) {
        name = req.body.name;
        description = req.body.description;
        price = req.body.price;
        category_id = req.body.category_id;
        stock = req.body.stock;
    }
    // Try to parse if sent as stringified JSON (for AJAX FormData)
    if (typeof stock === 'string') stock = Number(stock);
    if (typeof price === 'string') price = Number(price);
    if (!name || !price || stock === undefined || !description || !category_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    // Insert product (all required fields)
    const sql = 'INSERT INTO products (name, description, price, category_id, stock) VALUES (?, ?, ?, ?, ?)';
    const values = [name, description, price, category_id, stock];
    connection.execute(sql, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error inserting product', details: err });
        }
        const productId = result.insertId;
        // Insert images if provided
        if (req.files && req.files.length) {
            const imgSql = 'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)';
            const filesToProcess = req.files.length;
            let completedFiles = 0;
            const imagePaths = []; // Initialize imagePaths array
 
            req.files.forEach(file => {
                const imgPath = file.path.replace(/\\/g, "/").replace('images/', '');
                imagePaths.push(imgPath); // Add image path to array
                connection.execute(imgSql, [productId, imgPath], (imgErr) => {
                    if (imgErr) {
                        console.error('Error inserting image for new product:', imgErr);
                    }
                    completedFiles++;
                    if (completedFiles === filesToProcess) {
                        // All images processed, send response
                        return res.status(201).json({
                            success: true,
                            productId,
                            images: imagePaths,
                            stock
                        });
                    }
                });
            });
         } else {
             // No images uploaded, send response immediately
             return res.status(201).json({
                 success: true,
                 productId,
                 images: [],
                 stock
             });
        }
    });
}

// Search products
exports.searchItems = (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    const searchQuery = `%${query}%`;
    const sql = `SELECT p.*, c.name as category_name,
        (SELECT AVG(CAST(rating AS DECIMAL(2,1))) FROM reviews WHERE product_id = p.id) as avg_rating
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.name LIKE ? OR p.description LIKE ?`;

    connection.query(sql, [searchQuery, searchQuery], (err, rows) => {
        if (err) {
            console.error('SQL Error in searchItems:', err);
            return res.status(500).json({ error: 'Database error during search.', details: err });
        }

        const productIds = rows.map(r => r.id);
        if (productIds.length === 0) {
            return res.status(200).json({ items: [] });
        }

        connection.query('SELECT product_id, image_path FROM product_images WHERE product_id IN (?)', [productIds], (imgErr, imgRows) => {
            if (imgErr) {
                console.error('SQL Error in searchItems (images):', imgErr);
                return res.status(500).json({ error: 'Database error while fetching images for search results.', details: imgErr });
            }

            const imagesMap = {};
            imgRows.forEach(img => {
                if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
                // Ensure image path has the correct format
                let imagePath;
                if (img.image_path.startsWith('http://') || img.image_path.startsWith('https://')) {
                    // If path already starts with http:// or https://, return as is
                    imagePath = img.image_path;
                } else if (img.image_path.startsWith('/')) {
                    // If path starts with /, it's already a full path
                    imagePath = img.image_path;
                } else if (img.image_path.includes('products/')) {
                    // If path includes 'products/', it's a relative path from images directory
                    imagePath = '/images/' + img.image_path;
                } else {
                    // Otherwise, assume it's a product image filename in the products folder
                    imagePath = '/images/products/' + img.image_path;
                }
                imagesMap[img.product_id].push({ id: img.id, path: imagePath });
            });

            const items = rows.map(prod => {
                return {
                    ...prod,
                    images: imagesMap[prod.id] || []
                };
            });
            return res.status(200).json({ items });
        });
    });
};

// Update an existing product (hardware item)
exports.updateItem = async (req, res) => {
    let imagePaths = [];

    const id = req.params.id;
    const fields = [];
    const values = [];

    // Validate category_id first if it exists
    if (req.body.category_id) {
        const categoryId = parseInt(req.body.category_id, 10);
        if (isNaN(categoryId)) {
            return res.status(400).json({ error: 'Invalid category ID format.' });
        }

        try {
            const [rows] = await connection.promise().query('SELECT id FROM categories WHERE id = ?', [categoryId]);
            if (rows.length === 0) {
                return res.status(400).json({ error: 'Invalid category ID.' });
            }

        } catch (dbError) {
            console.error('Error validating category ID:', dbError);
            return res.status(500).json({ error: 'Database error during category validation.' });
        }
        fields.push('category_id = ?');
        values.push(categoryId);
    }

    // Only update fields that are provided (partial update)
    if (req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
            fields.push('name = ?');
            values.push(req.body.name);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
            fields.push('description = ?');
            values.push(req.body.description);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, 'price')) {
            let price = req.body.price;
            if (typeof price === 'string') price = Number(price);
            fields.push('price = ?');
            values.push(price);
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'stock')) {
            let stock = req.body.stock;
            if (typeof stock === 'string') stock = Number(stock);
            fields.push('stock = ?');
            values.push(stock);
        }
    }
    // If there are fields to update, run the update query
    const doUpdate = (cb) => {
        if (fields.length > 0) {
            const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
            values.push(id);
            connection.execute(sql, values, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Error updating product', details: err });
                }
                cb();
            });
        } else {
            cb();
        }
    };
    // Handle image removal and insertion
    doUpdate(async () => {
        const imagesToRemove = req.body.imagesToRemove ? JSON.parse(req.body.imagesToRemove) : [];

        if (imagesToRemove.length > 0) {
            try {
                // Fetch image paths before deleting from DB to delete files
                const [imgPathsToDelete] = await connection.promise().query(
                    'SELECT image_path FROM product_images WHERE id IN (?)', [imagesToRemove]
                );

                // Delete from database
                await connection.promise().query(
                    'DELETE FROM product_images WHERE id IN (?)', [imagesToRemove]
                );

                // Delete actual files from disk
                imgPathsToDelete.forEach(img => {
                    const filePath = `./images/${img.image_path}`;
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`Failed to delete image file ${filePath}:`, err);
                    });
                });
            } catch (dbError) {
                console.error('Error deleting images:', dbError);
                return res.status(500).json({ error: 'Database error during image deletion.' });
            }
        }

        if (req.files && req.files.length) {
            const imgSql = 'INSERT INTO product_images (product_id, image_path) VALUES (?, ?)';
            let completed = 0;
            const filesToProcess = req.files.length;



            req.files.forEach(file => {
                const imgPath = file.path.replace(/\\/g, "/").replace('images/', '');
                imagePaths.push(imgPath);

                connection.execute(imgSql, [id, imgPath], (imgErr) => {
                    if (imgErr) {
                        console.error('Error inserting image:', imgErr);
                    }
                    completed++;
                    if (completed === filesToProcess) {
                        // All images processed, send final response
                    }
                });
            });
        } else {
            // If no fields and no images, treat as no-op and return success
            if (fields.length === 0 && imagesToRemove.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No changes made.'
                });
            }
        }
        // Send final success response after all operations (including image processing) are complete
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
            images: imagePaths // Include imagePaths if new images were added
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
            product.images = images ? images.map(i => {
                // Ensure image path has the correct format
                let imagePath;
                if (i.image_path.startsWith('http://') || i.image_path.startsWith('https://')) {
                    // If path already starts with http:// or https://, return as is
                    imagePath = i.image_path;
                } else if (i.image_path.startsWith('/')) {
                    // If path starts with /, it's already a full path
                    imagePath = i.image_path;
                } else if (i.image_path.includes('products/')) {
                    // If path includes 'products/', it's a relative path from images directory
                    imagePath = '/images/' + i.image_path;
                } else {
                    // Otherwise, assume it's a product image filename in the products folder
                    imagePath = '/images/products/' + i.image_path;
                }
                return { path: imagePath };
            }) : [];
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

