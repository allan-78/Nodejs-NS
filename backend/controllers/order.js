const connection = require('../config/database');

// Create an order using laravel.sql schema: orders, order_items, carts, products, users
exports.createOrder = (req, res, next) => {
    const { userId, cart } = req.body;
    const dateOrdered = new Date();

    if (!userId || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: 'Missing user or cart data' });
    }

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
                // You may want to fetch product price from DB for security
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
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    if (!res.headersSent) {
                                        res.status(500).json({ error: 'Commit error', details: err });
                                    }
                                });
                            }
                            if (!res.headersSent) {
                                res.status(201).json({
                                    success: true,
                                    order_id,
                                    dateOrdered,
                                    message: 'Order placed successfully',
                                    cart
                                });
                            }
                        });
                    }
                });
            });
        });
    });
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

