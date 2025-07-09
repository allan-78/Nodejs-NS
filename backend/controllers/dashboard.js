const connection = require('../config/database');

// Address chart: show number of users per city (using users table)
exports.addressChart = (req, res) => {
    const sql = `SELECT COUNT(*) as total, LEFT(email, INSTR(email, '@')-1) as addressline FROM users GROUP BY addressline ORDER BY total DESC LIMIT 10`;
    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(500).json({ error: 'DB error', details: err });
            }
            return res.status(200).json({ rows });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error', details: error });
    }
};

// Sales chart: show total sales per month (using transactions table)
exports.salesChart = (req, res) => {
    const sql = `SELECT DATE_FORMAT(created_at, '%b %Y') as month, SUM(total_price) as total FROM transactions WHERE status = 'completed' GROUP BY YEAR(created_at), MONTH(created_at) ORDER BY YEAR(created_at), MONTH(created_at)`;
    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(500).json({ error: 'DB error', details: err });
            }
            return res.status(200).json({ rows });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error', details: error });
    }
};

// Items chart: show quantity sold per product (using transaction_items and products)
exports.itemsChart = (req, res) => {
    const sql = `SELECT p.name as items, SUM(ti.quantity) as total FROM transaction_items ti JOIN products p ON ti.product_id = p.id GROUP BY p.name ORDER BY total DESC LIMIT 10`;
    try {
        connection.query(sql, (err, rows, fields) => {
            if (err instanceof Error) {
                console.log(err);
                return res.status(500).json({ error: 'DB error', details: err });
            }
            return res.status(200).json({ rows });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error', details: error });
    }
};

// Most bought product (by quantity)
exports.mostBoughtProduct = (req, res) => {
    const sql = `SELECT p.name, SUM(ti.quantity) as total_bought
                 FROM transaction_items ti
                 JOIN products p ON ti.product_id = p.id
                 GROUP BY p.id
                 ORDER BY total_bought DESC
                 LIMIT 1`;
    connection.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'DB error', details: err });
        }
        return res.status(200).json({ product: rows[0] || null });
    });
};

// Most buying user (by number of completed transactions)
exports.mostBuyingUser = (req, res) => {
    const sql = `SELECT u.id, u.name, u.email, COUNT(t.id) as completed_orders
                 FROM users u
                 JOIN transactions t ON t.user_id = u.id AND t.status = 'completed'
                 GROUP BY u.id
                 ORDER BY completed_orders DESC
                 LIMIT 1`;
    connection.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'DB error', details: err });
        }
        return res.status(200).json({ user: rows[0] || null });
    });
};