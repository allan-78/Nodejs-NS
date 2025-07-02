const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateOrderReceipt(order, orderItems, user, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(20).text('Order Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${order.id}`);
        doc.text(`Order Date: ${order.created_at}`);
        doc.text(`Customer: ${user.name} (${user.email})`);
        doc.moveDown();
        doc.text('Items:');
        orderItems.forEach((item, idx) => {
            doc.text(`${idx + 1}. ${item.name} x${item.quantity} - $${item.price}`);
        });
        doc.moveDown();
        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        doc.text(`Total: $${total}`);
        doc.end();
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}

module.exports = { generateOrderReceipt };
