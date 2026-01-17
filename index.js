const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Alix backend running ✅');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return res.json({
      ok: true,
      time: result.rows.now
    });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

app.get('/api/auth/test', (req, res) => {
  res.json({ ok: true, message: 'Auth route working' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
