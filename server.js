const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors());

// DB Pool (Neon/Render Postgres)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Routes
app.get('/', (req, res) => res.send('Alix API working!'));

app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.send('DB connected!');
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// Future: AdMob, Agora endpoints
app.get('/ads', (req, res) => res.json({ admob_id: process.env.ADMOB_APP_ID }));
app.get('/agora', (req, res) => res.json({ agora_id: process.env.AGORA_APP_ID }));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
