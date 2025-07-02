const connection = require('../config/database');

// Create an order using laravel.sql schema: orders, order_items, carts, products, users
exports.createOrder = (req, res, next) => {
    const { userId, cart } = req.body;
    const dateOrdered = new Date();

    if (!userId || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: 'Missing user or cart data' });
    }

    // Import dependencies for PDF/email logic
    const transporter = require('../utils/mailer');
    const { generateOrderReceipt } = require('../utils/pdf');
    const path = require('path');
    const fs = require('fs');
    // Debug: log when starting order creation
    console.log('Starting order creation for user:', userId);

    connection.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: 'Transaction error', details: err });
        }

        // Insert into orders table
        const orderSql = 'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES (?, ?, ?, ?)';
        connection.execute(orderSql, [userId, 'pending', dateOrdered, dateOrdered], (err, result) => {
            if (err) {
                return connection.rollback(() => {
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Error inserting order', details: err });
                    }
                });
            }

            const order_id = result.insertId;
            // Insert each cart item into order_items
            const orderItemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
            let errorOccurred = false;
            let completed = 0;

            cart.forEach((item, idx) => {
                connection.execute(orderItemSql, [order_id, item.product_id, item.quantity, item.price, dateOrdered, dateOrdered], (err) => {
                    if (err && !errorOccurred) {
                        errorOccurred = true;
                        return connection.rollback(() => {
                            if (!res.headersSent) {
                                res.status(500).json({ error: 'Error inserting order item', details: err });
                            }
                        });
                    }
                    completed++;
                    if (completed === cart.length && !errorOccurred) {
                        connection.commit(async err => {
                            if (err) {
                                return connection.rollback(() => {
                                    if (!res.headersSent) {
                                        res.status(500).json({ error: 'Commit error', details: err });
                                    }
                                });
                            }
                            // After order is placed, create a transaction and send receipt email
                            // Insert into transactions table
                            const txSql = 'INSERT INTO transactions (user_id, order_id, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())';
                            connection.execute(txSql, [userId, order_id, 'pending'], (err2, txResult) => {
                                if (err2) {
                                    return res.status(500).json({ error: 'Failed to create transaction', details: err2 });
                                }
                                const transactionId = txResult.insertId;
                                // Fetch transaction, user, and items for receipt
                                const fetchTxSql = 'SELECT t.*, u.name, u.email FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = ?';
                                connection.execute(fetchTxSql, [transactionId], (err3, txRows) => {
                                    if (err3 || txRows.length === 0) {
                                        return res.status(500).json({ error: 'Failed to fetch transaction details', details: err3 });
                                    }
                                    const transaction = txRows[0];
                                    const itemsSql = 'SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?';
                                    connection.execute(itemsSql, [order_id], async (err4, items) => {
                                        if (err4) {
                                            console.error('Order item fetch error:', err4);
                                            return res.status(500).json({ error: 'Failed to fetch order items', details: err4 });
                                        }
                                        // Defensive: ensure items is an array
                                        if (!Array.isArray(items) || items.length === 0) {
                                            console.error('No order items found for PDF:', items);
                                            return res.status(500).json({ error: 'No order items found for PDF', details: items });
                                        }
                                        // Defensive: ensure transaction has id and email
                                        if (!transaction || !transaction.id || !transaction.email) {
                                            console.error('Transaction missing id or email:', transaction);
                                            return res.status(500).json({ error: 'Transaction missing id or email', details: transaction });
                                        }
                                        // Generate PDF receipt with debug and error handling
                                        const pdfPath = path.join(__dirname, '../receipts', `receipt_${transactionId}.pdf`);
                                        fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
                                        console.log('Attempting to generate PDF at:', pdfPath);
                                        try {
                                            await generateOrderReceipt(transaction, items, transaction, pdfPath);
                                            if (!fs.existsSync(pdfPath)) {
                                                console.error('PDF not generated:', pdfPath);
                                            } else {
                                                console.log('PDF generated at:', pdfPath);
                                            }
                                        } catch (pdfErr) {
                                            console.error('Error during PDF generation:', pdfErr);
                                            return res.status(500).json({ error: 'Failed to generate PDF receipt', details: pdfErr });
                                        }
                                        // Build absolute URL for receipt
                                        const protocol = process.env.BACKEND_PROTOCOL || 'http';
                                        const host = process.env.BACKEND_HOST || req.headers.host || 'localhost:3000';
                                        const receiptUrl = `${protocol}://${host}/receipts/receipt_${transactionId}.pdf`;
                                        // Debug: log mail options
                                        console.log('Preparing to send email to:', transaction.email);
                                        console.log('Attachment path:', pdfPath);
                                        console.log('Receipt URL:', receiptUrl);
                                        const mailOptions = {
                                            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                                            to: transaction.email,
                                            subject: `Your Order Receipt (Transaction #${transactionId})`,
                                            text: `Thank you for your order!\n\nDownload your receipt: ${receiptUrl}\n\nOr click the link below:\n${receiptUrl}`,
                                            html: `<p>Thank you for your order!</p><p><b>Download your receipt:</b> <a href=\"${receiptUrl}\">${receiptUrl}</a></p>`,
                                            attachments: [
                                                {
                                                    filename: `receipt_${transactionId}.pdf`,
                                                    path: pdfPath
                                                }
                                            ]
                                        };
                                        transporter.sendMail(mailOptions, (err5, info) => {
                                            if (err5) {
                                                console.error('Failed to send email:', err5);
                                                return res.status(500).json({ error: 'Failed to send email', details: err5 });
                                            }
                                            console.log('Email sent:', info);
                                            res.status(201).json({
                                                success: true,
                                                order_id,
                                                transaction_id: transactionId,
                                                dateOrdered,
                                                message: 'Order placed successfully. Receipt sent via email.',
                                                cart,
                                                receiptUrl
                                            });
                                        }); // transporter.sendMail
                                    }); // itemsSql
                                }); // fetchTxSql
                            }); // txSql
                        }); // connection.commit
                    }
                }); // orderItemSql
            }); // cart.forEach
        }); // orderSql
    }); // beginTransaction
}

// Get all transactions for a user (with items)
exports.getUserOrders = (req, res) => {
    const userId = req.query.user_id || req.user.id;
    const sql = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC';
    connection.execute(sql, [userId], (err, transactions) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch orders', details: err });
        if (!transactions.length) return res.json({ orders: [] });
        // For each transaction, fetch items
        const transactionIds = transactions.map(t => t.id);
        if (!transactionIds.length) return res.json({ orders: [] });
        const itemSql = 'SELECT ti.*, p.name FROM transaction_items ti LEFT JOIN products p ON ti.product_id = p.id WHERE ti.transaction_id IN (' + transactionIds.map(() => '?').join(',') + ')';
        connection.execute(itemSql, transactionIds, (err2, items) => {
            if (err2) {
                console.log('Transaction items SQL error:', err2);
                return res.status(500).json({ error: 'Failed to fetch order items', details: err2 });
            }
            // Group items by transaction_id
            const itemsByTransaction = {};
            items.forEach(i => {
                if (!itemsByTransaction[i.transaction_id]) itemsByTransaction[i.transaction_id] = [];
                itemsByTransaction[i.transaction_id].push(i);
            });
            // Attach items to transactions
            transactions.forEach(t => { t.items = itemsByTransaction[t.id] || []; });
            res.json({ orders: transactions });
        });
    });
};

