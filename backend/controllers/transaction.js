const connection = require('../config/database');
const transporter = require('../utils/mailer');
const { generateOrderReceipt } = require('../utils/pdf');
const path = require('path');
const fs = require('fs');

// Get user's transaction list with items
exports.getTransactionList = (req, res) => {
    const userId = req.user.id;
    
    // Get all transactions for the user
    const txSql = `
        SELECT t.*, u.name as customer_name, u.email 
        FROM transactions t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.user_id = ? 
        ORDER BY t.created_at DESC
    `;
    
    connection.execute(txSql, [userId], (err, transactions) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch transactions', 
                error: err.message 
            });
        }

        if (!transactions || transactions.length === 0) {
            return res.json({ 
                success: true, 
                transactions: [] 
            });
        }

        // Convert MySQL datetime to ISO string for JSON
        transactions = transactions.map(tx => ({
            ...tx,
            created_at: tx.created_at ? new Date(tx.created_at).toISOString() : null,
            updated_at: tx.updated_at ? new Date(tx.updated_at).toISOString() : null
        }));

        // Get all items for all transactions in a single query
        const transactionIds = transactions.map(t => t.id);
        const placeholders = transactionIds.map(() => '?').join(',');
        const itemsSql = `
            SELECT 
                ti.*,
                p.name,
                pi.image_path as image,
                p.description,
                p.category_id
            FROM transaction_items ti 
            JOIN products p ON ti.product_id = p.id 
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE ti.transaction_id IN (${placeholders})
        `;

        connection.execute(itemsSql, transactionIds, (err, allItems) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to fetch transaction items', 
                    error: err.message 
                });
            }

            try {
                // Clean and prepare items data
                const cleanItems = allItems.map(item => {
                    // Parse the images string if it exists
                    let imageUrl = null;
                    if (item.image) {
                        try {
                            // If it's a JSON string, parse it and take the first image
                            const images = JSON.parse(item.image);
                            imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : null;
                        } catch (e) {
                            // If parsing fails, use the string as is
                            imageUrl = item.image;
                        }
                    }

                    return {
                        ...item,
                        price: parseFloat(item.price),
                        quantity: parseInt(item.quantity, 10),
                        image: imageUrl,
                        created_at: item.created_at ? new Date(item.created_at).toISOString() : null,
                        updated_at: item.updated_at ? new Date(item.updated_at).toISOString() : null
                    };
                });

                // Group items by transaction
                const transactionsWithItems = transactions.map(tx => {
                    const items = cleanItems.filter(item => item.transaction_id === tx.id);
                    return {
                        ...tx,
                        items: items
                    };
                });

                res.json({
                    success: true,
                    transactions: transactionsWithItems
                });
            } catch (error) {
                console.error('Error processing transaction data:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error processing transaction data',
                    error: error.message
                });
            }
        });
    });
};

// Update transaction status and send email with PDF receipt
exports.updateTransaction = (req, res) => {
    const { transactionId, status } = req.body;
    if (!transactionId || !status) {
        return res.status(400).json({ success: false, message: 'Missing transactionId or status' });
    }
    // Update transaction status
    const updateSql = 'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?';
    connection.execute(updateSql, [status, transactionId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to update transaction', error: err });
        }
        // Fetch transaction, user, and items for receipt
        const txSql = 'SELECT t.*, u.name, u.email FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.id = ?';
        connection.execute(txSql, [transactionId], (err2, txRows) => {
            if (err2 || txRows.length === 0) {
                return res.status(500).json({ success: false, message: 'Failed to fetch transaction details', error: err2 });
            }
            const transaction = txRows[0];
            const itemsSql = 'SELECT ti.*, p.name FROM transaction_items ti JOIN products p ON ti.product_id = p.id WHERE ti.transaction_id = ?';
            connection.execute(itemsSql, [transactionId], async (err3, items) => {
                if (err3) {
                    return res.status(500).json({ success: false, message: 'Failed to fetch transaction items', error: err3 });
                }
                // Generate PDF receipt
                const pdfPath = path.join(__dirname, '../receipts', `receipt_${transactionId}.pdf`);
                // Ensure receipts directory exists
                fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
                await generateOrderReceipt(transaction, items, transaction, pdfPath);
                // Send email with PDF and download link
                // Build absolute URL for receipt
                const protocol = process.env.BACKEND_PROTOCOL || 'http';
                const host = process.env.BACKEND_HOST || req.headers.host || 'localhost:3000';
                const receiptUrl = `${protocol}://${host}/receipts/receipt_${transactionId}.pdf`;
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: transaction.email,
                    subject: `Your Order Receipt (Transaction #${transactionId})`,
                    text: `Your order status has been updated to: ${status}.\n\nThe PDF of your receipt is attached to this email.`,
                    html: `<p>Your order status has been updated to: <b>${status}</b>.</p><p>The PDF of your receipt is attached to this email.</p>`,
                    attachments: [
                        {
                            filename: `receipt_${transactionId}.pdf`,
                            path: pdfPath
                        }
                    ]
                };
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.log('Failed to send receipt email:', err);
                        return res.status(500).json({ success: false, message: 'Failed to send email', error: err });
                    }
                    console.log('Receipt email sent:', info);
                    return res.json({ success: true, message: 'Transaction updated and receipt sent via email.' });
                });
            });
        });
    });
};
