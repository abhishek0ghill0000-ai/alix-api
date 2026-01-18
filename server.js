const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.send('DB connected!');
  } catch (err) {
    res.status(500).send('DB error');
  }
});
