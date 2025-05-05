import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();


app.get('/about', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM about LIMIT 1');
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).send('No about content found.');
      }
    } catch (err) {
      console.error('❌ Error fetching about content:', err);
      res.status(500).send('❌ Failed to fetch about content');
    }
  });

export default app;