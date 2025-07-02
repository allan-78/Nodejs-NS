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
            // Generate a verification token and an API token
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const apiToken = crypto.randomBytes(32).toString('hex');
            // Set token expiration (e.g., 24 hours from now)
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            // Insert user with verification_token and api_token
            const userSql = `INSERT INTO users (name, email, password, verification_token, api_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;
            connection.execute(userSql, [name, email, hashedPassword, verificationToken, apiToken], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false, message: 'Registration failed', error: err });
                }
                // Save verification token in user_tokens table with expires_at
                const saveVerificationTokenSql = 'INSERT INTO user_tokens (user_id, token, type, created_at, expires_at) VALUES (?, ?, ?, NOW(), ?)';
                // Save api token in user_tokens table (optional: add expires_at if you want expiration)
                const saveApiTokenSql = 'INSERT INTO user_tokens (user_id, token, type, created_at) VALUES (?, ?, ?, NOW())';
                connection.execute(saveVerificationTokenSql, [result.insertId, verificationToken, 'verification', expiresAt], (err2) => {
                    if (err2) {
                        console.log(err2);
                        return res.status(500).json({ success: false, message: 'Failed to save verification token', error: err2 });
                    }
                    // Save api token in user_tokens table
                    connection.execute(saveApiTokenSql, [result.insertId, apiToken, 'auth'], (err3) => {
                        if (err3) {
                            console.log(err3);
                            return res.status(500).json({ success: false, message: 'Failed to save api token', error: err3 });
                        }
                        // Send verification email
                        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/v1/user/verify-email?token=${verificationToken}`;
                        const mailOptions = {
                            from: process.env.EMAIL_USER,
                            to: email,
                            subject: 'Verify your email',
                            html: `<p>Hi ${name},</p><p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`
                        };
                        transporter.sendMail(mailOptions, (err4, info) => {
                            if (err4) {
                                console.log(err4);
                                return res.status(500).json({ success: false, message: 'Failed to send verification email', error: err4 });
                            }
                            return res.status(200).json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });
                        });
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
    const sql = 'SELECT id, name, email, password, email_verified_at, api_token FROM users WHERE email = ?';
    connection.execute(sql, [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error logging in', details: err });
        }
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'No account found with that email.' });
        }
        const user = results[0];
        console.log('Login attempt:', { email, user }); // Debug log
        // Check if email is verified
        if (!user.email_verified_at) {
            return res.status(403).json({ success: false, message: 'Your account is not verified. Please check your email for the verification link.' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }
        // If user does not have an api_token (should not happen, but just in case)
        if (!user.api_token) {
            return res.status(401).json({ success: false, message: 'Invalid token or not yet verified. Please contact support or re-register.' });
        }
        delete user.password;
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        // Save auth token in user_tokens table
        const saveTokenSql = 'INSERT INTO user_tokens (user_id, token, type, created_at) VALUES (?, ?, ?, NOW())';
        // Also update users.api_token column
        const updateUserTokenSql = 'UPDATE users SET api_token = ? WHERE id = ?';
        connection.execute(saveTokenSql, [user.id, token, 'auth'], (err2) => {
            if (err2) {
                console.log(err2);
                return res.status(500).json({ success: false, message: 'Failed to save auth token', error: err2 });
            }
            connection.execute(updateUserTokenSql, [token, user.id], (err3) => {
                if (err3) {
                    console.log(err3);
                    return res.status(500).json({ success: false, message: 'Failed to update api_token in users', error: err3 });
                }
                return res.status(200).json({
                    success: true,
                    user: { ...user, api_token: token },
                    token
                });
            });
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
    const sql = 'UPDATE users SET is_active = 0 WHERE email = ?';
    connection.execute(sql, [email], (err, result) => {
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
            email
        });
    });
};
// Admin: Update user role
const updateUserRole = (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) {
        return res.status(400).json({ error: 'User ID and role are required' });
    }
    const sql = 'UPDATE users SET role = ? WHERE id = ?';
    connection.execute(sql, [role, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error updating user role', details: err });
        }
        return res.status(200).json({ success: true, message: 'User role updated', userId, role });
    });
};

// Admin: List users for datatable
const listUsers = (req, res) => {
    const sql = 'SELECT id, name, email, role, is_active, created_at, updated_at FROM users';
    connection.execute(sql, [], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching users', details: err });
        }
        return res.status(200).json({ users: results });
    });
};

const verifyEmail = (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).send('Invalid verification link.');
    }
    // Find user by verification_token in users table
    const userSql = 'SELECT id FROM users WHERE verification_token = ?';
    connection.execute(userSql, [token], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send('Invalid or expired verification link.');
        }
        const userId = results[0].id;
        // Check user_tokens table for unused, unexpired verification token
        const tokenSql = `SELECT * FROM user_tokens WHERE user_id = ? AND token = ? AND type = 'verification' AND used_at IS NULL AND expires_at > NOW()`;
        connection.execute(tokenSql, [userId, token], (err2, tokenRows) => {
            if (err2 || tokenRows.length === 0) {
                return res.status(400).send('Invalid or expired verification link.');
            }
            // Mark token as used
            const markUsedSql = 'UPDATE user_tokens SET used_at = NOW() WHERE id = ?';
            connection.execute(markUsedSql, [tokenRows[0].id], (err3) => {
                if (err3) {
                    return res.status(500).send('Failed to mark token as used.');
                }
                // Set email_verified_at and clear verification_token in users
                const updateSql = 'UPDATE users SET email_verified_at = NOW(), verification_token = NULL WHERE id = ?';
                connection.execute(updateSql, [userId], (err4) => {
                    if (err4) {
                        return res.status(500).send('Failed to verify email.');
                    }
                    return res.send('Email verified! You can now log in.');
                });
            });
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

module.exports = { registerUser, loginUser, updateUser, deactivateUser, verifyEmail, getProfile, updateProfile, changePassword, getUserReviews, getUnreviewedProducts, uploadProfilePhoto, updateUserRole, listUsers };