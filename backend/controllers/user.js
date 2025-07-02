const connection = require('../config/database');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const transporter = require('../utils/mailer');
const crypto = require('crypto');

const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    try {
        // Check for duplicate email (no deleted_at column)
        const checkSql = 'SELECT id FROM users WHERE email = ?';
        connection.execute(checkSql, [email], async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false, message: 'Database error', error: err });
            }
            if (results.length > 0) {
                return res.status(400).json({ success: false, message: 'Email already registered.' });
            }
            // Hash password and insert new user (set created_at/updated_at)
            const hashedPassword = await bcrypt.hash(password, 10);
            const userSql = `INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`;
            connection.execute(userSql, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false, message: 'Registration failed', error: err });
                }
                // Generate a verification token
                const token = crypto.randomBytes(32).toString('hex');
                // Save token in DB (for demo, you can use a new table or add a column to users)
                const saveTokenSql = 'UPDATE users SET remember_token = ? WHERE id = ?';
                connection.execute(saveTokenSql, [token, result.insertId], (err2) => {
                    if (err2) {
                        console.log(err2);
                        return res.status(500).json({ success: false, message: 'Failed to save verification token', error: err2 });
                    }
                    // Send verification email
                    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/v1/user/verify-email?token=${token}`;
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'Verify your email',
                        html: `<p>Hi ${name},</p><p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`
                    };
                    transporter.sendMail(mailOptions, (err3, info) => {
                        if (err3) {
                            console.log(err3);
                            return res.status(500).json({ success: false, message: 'Failed to send verification email', error: err3 });
                        }
                        return res.status(200).json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });
                    });
                });
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server error', error });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT id, name, email, password, email_verified_at FROM users WHERE email = ?';
    connection.execute(sql, [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error logging in', details: err });
        }
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const user = results[0];
        console.log('Login attempt:', { email, user }); // Debug log
        // Check if email is verified
        if (!user.email_verified_at) {
            return res.status(403).json({ success: false, message: 'Please verify your account first.' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        delete user.password;
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        return res.status(200).json({
            success: true,
            user,
            token
        });
    });
};

const updateUser = (req, res) => {
    // {
    //   "name": "steve",
    //   "email": "steve@gmail.com",
    //   "password": "password"
    // }
    console.log(req.body, req.file)
    const { title, fname, lname, addressline, town, zipcode, phone, userId, } = req.body;

    if (req.file) {
        image = req.file.path.replace(/\\/g, "/");
    }
    //     INSERT INTO users(user_id, username, email)
    //   VALUES(1, 'john_doe', 'john@example.com')
    // ON DUPLICATE KEY UPDATE email = 'john@example.com';
    const userSql = `
  INSERT INTO customer 
    (title, fname, lname, addressline, town, zipcode, phone, image_path, user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    fname = VALUES(fname),
    lname = VALUES(lname),
    addressline = VALUES(addressline),
    town = VALUES(town),
    zipcode = VALUES(zipcode),
    phone = VALUES(phone),
    image_path = VALUES(image_path)`;
    const params = [title, fname, lname, addressline, town, zipcode, phone, image, userId];

    try {
        connection.execute(userSql, params, (err, result) => {
            if (err instanceof Error) {
                console.log(err);

                return res.status(401).json({
                    error: err
                });
            }

            return res.status(200).json({
                success: true,
                result
            })
        });
    } catch (error) {
        console.log(error)
    }

};

const deactivateUser = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const sql = 'UPDATE users SET deleted_at = ? WHERE email = ?';
    const timestamp = new Date();

    connection.execute(sql, [timestamp, email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error deactivating user', details: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            email,
            deleted_at: timestamp
        });
    });
};

const verifyEmail = (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send('Invalid verification link.');
    }
    // Find user by token
    const sql = 'SELECT id FROM users WHERE remember_token = ?';
    connection.execute(sql, [token], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('Invalid or expired verification link.');
        }
        const userId = results[0].id;
        // Set email_verified_at and clear token
        const updateSql = 'UPDATE users SET email_verified_at = NOW(), remember_token = NULL WHERE id = ?';
        connection.execute(updateSql, [userId], (err2) => {
            if (err2) {
                return res.status(500).send('Failed to verify email.');
            }
            // You can redirect to login or show a success message
            return res.send('Email verified! You can now log in.');
        });
    });
};

// Get logged-in user's profile
const getProfile = (req, res) => {
    const userId = req.user.id;
    const sql = 'SELECT id, name, email, profile_photo_path FROM users WHERE id = ?';
    connection.execute(sql, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({ user: results[0] });
    });
};
// Upload profile photo
const uploadProfilePhoto = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const userId = req.user.id;
    // Always use /images/profiles/ as the public path
    const photoPath = `images/profiles/${req.file.filename}`;
    const sql = 'UPDATE users SET profile_photo_path = ?, updated_at = NOW() WHERE id = ?';
    connection.execute(sql, [photoPath, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Failed to update profile photo' });
        }
        return res.json({ success: true, profile_photo_path: `/${photoPath}` });
    });
};

// Update logged-in user's profile
const updateProfile = (req, res) => {
    const userId = req.user.id;
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    const sql = 'UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?';
    connection.execute(sql, [name, email, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update profile', details: err });
        }
        // Fetch updated user info including profile_photo_path
        connection.execute('SELECT id, name, email, profile_photo_path FROM users WHERE id = ?', [userId], (err2, results) => {
            if (err2 || results.length === 0) {
                return res.status(500).json({ error: 'Profile updated but failed to fetch user info' });
            }
            return res.json({ success: true, user: results[0] });
        });
    });
};

// Change password
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
        return res.status(400).json({ error: 'Current and new password are required' });
    }
    // Get current hash
    connection.execute('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = results[0];
        const match = await bcrypt.compare(current_password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const hashed = await bcrypt.hash(new_password, 10);
        connection.execute('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashed, userId], (err2) => {
            if (err2) {
                return res.status(500).json({ error: 'Failed to change password' });
            }
            return res.json({ success: true });
        });
    });
};

// User reviews endpoint for profile page
const getUserReviews = (req, res) => {
    const userId = req.query.user_id || req.user.id;
    const sql = `SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id WHERE r.user_id = ? ORDER BY r.created_at DESC`;
    connection.execute(sql, [userId], (err, reviews) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch reviews', details: err });
        res.json({ reviews });
    });
};

// User unreviewed products endpoint for profile page
const getUnreviewedProducts = (req, res) => {
    const userId = req.query.user_id || req.user.id;
    // Find all products the user has purchased (completed transactions), but not reviewed
    const purchasedSql = `SELECT DISTINCT ti.product_id, p.name
        FROM transaction_items ti
        JOIN transactions t ON ti.transaction_id = t.id
        JOIN products p ON ti.product_id = p.id
        WHERE t.user_id = ? AND t.status = 'completed'`;
    connection.execute(purchasedSql, [userId], (err, purchased) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch purchased products', details: err });
        if (!purchased.length) return res.json({ products: [] });
        // Find products already reviewed
        const productIds = purchased.map(p => p.product_id);
        const reviewSql = `SELECT product_id FROM reviews WHERE user_id = ? AND product_id IN (${productIds.map(() => '?').join(',')})`;
        connection.execute(reviewSql, [userId, ...productIds], (err2, reviewed) => {
            if (err2) return res.status(500).json({ error: 'Failed to fetch reviewed products', details: err2 });
            const reviewedIds = reviewed.map(r => r.product_id);
            // Filter out reviewed products and map to {id, name}
            const unreviewed = purchased.filter(p => !reviewedIds.includes(p.product_id)).map(p => ({ id: p.product_id, name: p.name }));
            res.json({ products: unreviewed });
        });
    });
};

module.exports = { registerUser, loginUser, updateUser, deactivateUser, verifyEmail, getProfile, updateProfile, changePassword, getUserReviews, getUnreviewedProducts, uploadProfilePhoto };