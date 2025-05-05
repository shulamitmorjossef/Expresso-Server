import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();

app.get('/terms', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM terms LIMIT 1');
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ Error fetching terms:', err);
      res.status(500).send('Server error');
    }
  });


export default app;