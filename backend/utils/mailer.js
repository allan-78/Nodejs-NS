const nodemailer = require('nodemailer');

// Configure transporter for Mailtrap (development) or real SMTP
let transporter;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use configured SMTP settings (for production)
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log('Using configured SMTP email service');
} else {
    // Use Mailtrap for development/testing
    console.log('=== USING MAILTRAP FOR EMAIL TESTING ===');
    console.log('To set up Mailtrap:');
    console.log('1. Go to https://mailtrap.io');
    console.log('2. Create a free account');
    console.log('3. Go to your Inbox');
    console.log('4. Click "Show Credentials"');
    console.log('5. Copy the SMTP settings to your .env file');
    console.log('==========================================');
    
    // Mailtrap configuration (you can replace these with your actual Mailtrap credentials)
    transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
        port: process.env.MAILTRAP_PORT || 2525,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_USER || 'your-mailtrap-user',
            pass: process.env.MAILTRAP_PASS || 'your-mailtrap-pass'
        }
    });
    
    console.log('Mailtrap email service configured');
}

module.exports = transporter;
