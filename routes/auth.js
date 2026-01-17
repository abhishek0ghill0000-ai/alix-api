const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

function generateUniqueId() {
  const prefix = 'ALX';
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
}

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, location } = req.body;

// Location compulsory: object with lat + lng
if (!username || !email || !password || !location || location.lat == null || location.lng == null) {
  return res.status(400).json({ ok: false, error: 'Missing username/email/password/location' });
}

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ ok: false, error: 'Email already used' });
    }

    const hash = await bcrypt.hash(password, 10);

    let uniqueId;
    while (true) {
      uniqueId = generateUniqueId();
      const check = await pool.query(
        'SELECT id FROM users WHERE unique_id = $1',
        [uniqueId]
      );
      if (check.rows.length === 0) break;
    }

    const result = await pool.query(
      `INSERT INTO users (unique_id, username, email, password_hash, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, unique_id, username, email`,
      [uniqueId, username, email, hash, location]
    );

    const user = result.rows;

    const token = jwt.sign(
      { userId: user.id, uniqueId: user.unique_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      ok: true,
      token,
      user
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ ok: false, error: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, location } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ ok: false, error: 'User not found' });
    }

    const user = result.rows;

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ ok: false, error: 'Wrong password' });
    }

      await pool.query(
        'UPDATE users SET location = $1 WHERE id = $2',
        [location, user.id]
      );

    const token = jwt.sign(
      { userId: user.id, uniqueId: user.unique_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        unique_id: user.unique_id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, error: 'Login failed' });
  }
});

router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Auth route working' });
});

module.exports = router;
