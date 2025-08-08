const connection = require('../config/database');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/mailer');

// Helper to get user_id from JWT
function getUserIdFromRequest(req) {
    const auth = req.header('Authorization');
    if (!auth) return null;
    try {
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch {
        return null;
    }
}

// Add product to cart (user only)
exports.addToCart = (req, res) => {
    let user_id = req.body.user_id;
    // Prefer JWT user if available
    const jwtUserId = getUserIdFromRequest(req);
    if (jwtUserId) user_id = jwtUserId;
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity || !user_id) {
        return res.status(400).json({ error: 'Missing product_id, quantity, or user_id' });
    }
    // Insert or update quantity if already exists
    const sql = 'INSERT INTO carts (user_id, product_id, quantity, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()';
    connection.execute(sql, [user_id, product_id, quantity], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.json({ success: true, message: 'Product added to cart successfully!' });
    });
};

// Get cart count for logged-in user
exports.getCartCount = (req, res) => {
    let user_id = null;
    const jwtUserId = getUserIdFromRequest(req);
    if (jwtUserId) user_id = jwtUserId;
    else if (req.query.user_id) user_id = req.query.user_id;
    if (!user_id) return res.json({ count: 0 });
    const sql = 'SELECT SUM(quantity) as count FROM carts WHERE user_id = ?';
    connection.execute(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.json({ count: results[0].count || 0 });
    });
};

// Get all cart items for logged-in user (with product details and first image)
exports.getCartItems = (req, res) => {
    let user_id = null;
    const jwtUserId = getUserIdFromRequest(req);
    if (jwtUserId) user_id = jwtUserId;
    else if (req.query.user_id) user_id = req.query.user_id;
    if (!user_id) return res.status(401).json({ error: 'Not logged in' });
    // Join with products and product_images (first image only)
    const sql = `SELECT c.id as cart_id, c.product_id, c.quantity, c.created_at, c.updated_at, p.name, p.price, p.stock,
                 (SELECT 
                    CASE 
                      WHEN image_path LIKE 'http://%' OR image_path LIKE 'https://%' OR image_path LIKE '/%' THEN image_path
                      WHEN image_path LIKE '%products/%' THEN CONCAT('/images/', image_path)
                      ELSE CONCAT('/images/products/', image_path)
                    END
                  FROM product_images WHERE product_id = p.id LIMIT 1) as image
                 FROM carts c
                 JOIN products p ON c.product_id = p.id
                 WHERE c.user_id = ?`;
    connection.execute(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }
        res.json({ items: results });
    });
};

// Checkout: move cart items to transaction, decrement stock, empty cart, and send receipt email
exports.checkout = (req, res) => {
    console.log('Checkout endpoint hit');
    let user_id = null;
    const jwtUserId = getUserIdFromRequest(req);
    console.log('JWT user id:', jwtUserId);
    if (jwtUserId) user_id = jwtUserId;
    else if (req.body.user_id) user_id = req.body.user_id;
    console.log('Final user id:', user_id);
    if (!user_id) {
        console.log('Not logged in');
        return res.status(401).json({ error: 'Not logged in' });
    }

    // Import dependencies for PDF/email logic
    const transporter = require('../utils/mailer');
    const { generateOrderReceipt } = require('../utils/pdf');
    const path = require('path');
    const fs = require('fs');

    // Start transaction using the default single connection
    connection.beginTransaction(err => {
        if (err) { console.log('Begin transaction error:', err); return res.status(500).json({ error: 'Database error', details: err }); }

        // 1. Get all cart items for user (with product name)
        const getCartSql = 'SELECT c.product_id, c.quantity, p.price, p.name, u.email, u.name as user_name FROM carts c JOIN products p ON c.product_id = p.id JOIN users u ON c.user_id = u.id WHERE c.user_id = ?';
        connection.query(getCartSql, [user_id], (err, cartItems) => {
            if (err) { console.log('Get cart error:', err); return connection.rollback(() => { res.status(500).json({ error: 'Database error', details: err }); }); }
            if (!cartItems.length) { console.log('Cart is empty'); return connection.rollback(() => { res.status(400).json({ error: 'Cart is empty' }); }); }

            // 2. Create transaction row
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const insertTransSql = 'INSERT INTO transactions (user_id, total_price, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())';
            connection.query(insertTransSql, [user_id, total, 'pending'], (err, result) => {
                if (err) { console.log('Insert transaction error:', err); return connection.rollback(() => { res.status(500).json({ error: 'Database error', details: err }); }); }
                const transaction_id = result.insertId;

                // 3. Insert transaction_items (with created_at/updated_at)
                const now = new Date();
                const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
                const itemsData = cartItems.map(item => [transaction_id, item.product_id, item.quantity, item.price, nowStr, nowStr]);
                const insertItemsSql = 'INSERT INTO transaction_items (transaction_id, product_id, quantity, price, created_at, updated_at) VALUES ?';
                connection.query(insertItemsSql, [itemsData], (err) => {
                    if (err) { console.log('Insert transaction_items error:', err); return connection.rollback(() => { res.status(500).json({ error: 'Database error', details: err }); }); }

                    // 4. Decrement product stock
                    const stockUpdates = cartItems.map(item => {
                        return new Promise((resolve, reject) => {
                            const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?';
                            connection.query(updateStockSql, [item.quantity, item.product_id, item.quantity], (err, result) => {
                                if (err || result.affectedRows === 0) { console.log('Stock update error:', err || 'Insufficient stock'); return reject(err || 'Insufficient stock'); }
                                resolve();
                            });
                        });
                    });
                    Promise.all(stockUpdates).then(() => {
                        // 5. Empty cart
                        const deleteCartSql = 'DELETE FROM carts WHERE user_id = ?';
                        connection.query(deleteCartSql, [user_id], (err) => {
                            if (err) { console.log('Delete cart error:', err); return connection.rollback(() => { res.status(500).json({ error: 'Database error', details: err }); }); }
                            connection.commit(async err => {
                                if (err) { console.log('Commit error:', err); return res.status(500).json({ error: 'Database error', details: err }); }
                                
                                // Generate PDF receipt and send email with attachment
                                try {
                                    const userEmail = cartItems[0].email;
                                    const userName = cartItems[0].user_name;
                                    
                                    console.log('Preparing to send email to:', userEmail);
                                    console.log('Transaction ID:', transaction_id);
                                    
                                    // Create transaction object for PDF generation
                                    const transaction = {
                                        id: transaction_id,
                                        created_at: now,
                                        total_price: total
                                    };
                                    
                                    // Create items array for PDF generation
                                    const itemsForPdf = cartItems.map(item => ({
                                        name: item.name,
                                        quantity: item.quantity,
                                        price: item.price
                                    }));
                                    
                                    console.log('Items for PDF:', itemsForPdf);
                                    
                                    // Generate PDF receipt
                                    const pdfPath = path.join(__dirname, '../receipts', `receipt_${transaction_id}.pdf`);
                                    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
                                    console.log('Generating PDF receipt at:', pdfPath);
                                    
                                    await generateOrderReceipt(transaction, itemsForPdf, { name: userName, email: userEmail }, pdfPath);
                                    
                                    // Check if PDF was created
                                    if (fs.existsSync(pdfPath)) {
                                        console.log('PDF generated successfully at:', pdfPath);
                                    } else {
                                        console.error('PDF was not created at:', pdfPath);
                                    }
                                    
                                    // Create HTML email content
                                    let itemsHtml = cartItems.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₱${Number(item.price).toFixed(2)}</td><td>₱${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('');
                                    const html = `<h3>Thank you for your purchase, ${userName}!</h3><p>The PDF of your receipt is attached to this email.</p><table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><th colspan="3">Total</th><th>₱${total.toFixed(2)}</th></tr></tfoot></table><p>Status: <b>Pending</b></p>`;
                                    
                                    // Send email with PDF attachment
                                    const mailOptions = {
                                        from: process.env.EMAIL_USER,
                                        to: userEmail,
                                        subject: `Your Hardware Store Receipt (Transaction #${transaction_id})`,
                                        html: html,
                                        attachments: [
                                            {
                                                filename: `receipt_${transaction_id}.pdf`,
                                                path: pdfPath
                                            }
                                        ]
                                    };
                                    
                                    console.log('Sending email with options:', {
                                        to: mailOptions.to,
                                        subject: mailOptions.subject,
                                        attachments: mailOptions.attachments.length
                                    });
                                    
                                    transporter.sendMail(mailOptions, (err, info) => {
                                        if (err) {
                                            console.log('Failed to send receipt email:', err);
                                            // Don't fail the checkout if email fails
                                        } else {
                                            console.log('Receipt email sent:', info);
                                        }
                                    });
                                    
                                } catch (mailErr) {
                                    console.error('Failed to send receipt email with PDF:', mailErr);
                                    console.error('Error details:', mailErr.message);
                                    // Don't fail the checkout if email fails
                                }
                                
                                res.json({ success: true, message: 'Checkout successful! Receipt with PDF attachment sent to your email.', transaction_id, total });
                            });
                        });
                    }).catch(stockErr => {
                        console.log('Stock error:', stockErr);
                        connection.rollback(() => {
                            res.status(400).json({ error: 'Insufficient stock for one or more items', details: stockErr });
                        });
                    });
                });
            });
        });
    });
};

// Fetch transaction details (for receipt display)
exports.getTransactionDetails = (req, res) => {
    const transaction_id = req.params.id;
    let user_id = null;
    const jwtUserId = getUserIdFromRequest(req);
    if (jwtUserId) user_id = jwtUserId;
    else if (req.query.user_id) user_id = req.query.user_id;
    if (!user_id) return res.status(401).json({ error: 'Not logged in' });
    // Get transaction (ensure it belongs to user)
    const sql = `SELECT t.id, t.total_price, t.status, t.created_at, u.name as user_name, u.email
                 FROM transactions t JOIN users u ON t.user_id = u.id
                 WHERE t.id = ? AND t.user_id = ?`;
    connection.query(sql, [transaction_id, user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error', details: err });
        if (!results.length) return res.status(404).json({ error: 'Transaction not found' });
        const transaction = results[0];
        // Get items
        const itemsSql = `SELECT ti.product_id, ti.quantity, ti.price, p.name, ti.created_at, ti.updated_at
                          FROM transaction_items ti JOIN products p ON ti.product_id = p.id
                          WHERE ti.transaction_id = ?`;
        connection.query(itemsSql, [transaction_id], (err, items) => {
            if (err) return res.status(500).json({ error: 'Database error', details: err });
            transaction.items = items;
            res.json({ transaction });
        });
    });
};
