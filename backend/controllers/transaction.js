const connection = require('../config/database');
const transporter = require('../utils/mailer');
const { generateOrderReceipt } = require('../utils/pdf');
const path = require('path');
const fs = require('fs');

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
                    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                    to: transaction.email,
                    subject: `Your Order Receipt (Transaction #${transactionId})`,
                    text: `Thank you for your order!\n\nDownload your receipt: ${receiptUrl}\n\nOr click the link below:\n${receiptUrl}`,
                    html: `<p>Thank you for your order!</p><p><b>Download your receipt:</b> <a href="${receiptUrl}">${receiptUrl}</a></p>`,
                    attachments: [
                        {
                            filename: `receipt_${transactionId}.pdf`,
                            path: pdfPath
                        }
                    ]
                };
                transporter.sendMail(mailOptions, (err4, info) => {
                    if (err4) {
                        return res.status(500).json({ success: false, message: 'Failed to send email', error: err4 });
                    }
                    return res.json({ success: true, message: 'Transaction updated and receipt sent via email.', receiptUrl });
                });
            });
        });
    });
};
