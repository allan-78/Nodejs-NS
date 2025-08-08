const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateOrderReceipt(order, orderItems, user, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('HARDWARE STORE', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text('Your Trusted Hardware Partner', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).text('123 Main Street, City, State 12345', { align: 'center' });
        doc.text('Phone: (555) 123-4567 | Email: info@hardwarestore.com', { align: 'center' });
        doc.moveDown(2);

        // Receipt Title
        doc.fontSize(18).font('Helvetica-Bold').text('ORDER RECEIPT', { align: 'center' });
        doc.moveDown(1);

        // Order Information
        doc.fontSize(12).font('Helvetica-Bold').text('Order Details:');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Order ID: ${order.id}`);
        doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`);
        doc.text(`Customer: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.moveDown(1);

        // Items Table Header
        doc.fontSize(12).font('Helvetica-Bold').text('Items Ordered:');
        doc.moveDown(0.5);

        // Table headers
        const tableTop = doc.y;
        const itemCol = 50;
        const qtyCol = 250;
        const priceCol = 320;
        const totalCol = 420;

        // Draw table headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Item', itemCol, tableTop);
        doc.text('Qty', qtyCol, tableTop);
        doc.text('Price', priceCol, tableTop);
        doc.text('Subtotal', totalCol, tableTop);

        // Draw header line
        doc.moveTo(itemCol, tableTop + 15).lineTo(500, tableTop + 15).stroke();
        doc.moveDown(0.5);

        // Items
        let currentY = doc.y;
        doc.fontSize(10).font('Helvetica');
        
        orderItems.forEach((item, idx) => {
            const itemName = item.name.length > 30 ? item.name.substring(0, 27) + '...' : item.name;
            const priceNum = Number(item.price);
            const subtotal = (priceNum * item.quantity).toFixed(2);
            
            doc.text(itemName, itemCol, currentY);
            doc.text(item.quantity.toString(), qtyCol, currentY);
            doc.text(`php${priceNum.toFixed(2)}`, priceCol, currentY);
            doc.text(`php${subtotal}`, totalCol, currentY);
            
            currentY += 20;
            
            // Add line between items
            if (idx < orderItems.length - 1) {
                doc.moveTo(itemCol, currentY - 5).lineTo(500, currentY - 5).stroke();
            }
        });

        // Total line
        doc.moveDown(1);
        doc.moveTo(itemCol, doc.y).lineTo(500, doc.y).stroke();
        doc.moveDown(0.5);

        // Calculate and display total
        const total = orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Amount: php${total.toFixed(2)}`, totalCol - 100, doc.y);

        doc.moveDown(2);

        // Footer
        doc.fontSize(10).font('Helvetica');
        doc.text('Thank you for your purchase!', { align: 'center' });
        doc.moveDown(0.5);
        doc.text('For any questions or concerns, please contact our customer service.', { align: 'center' });
        doc.moveDown(0.5);
        doc.text('This receipt serves as proof of purchase.', { align: 'center' });

        // Add page number
        doc.fontSize(8).text(`Page 1 of 1`, 50, doc.page.height - 100);

        doc.end();
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}

module.exports = { generateOrderReceipt };
