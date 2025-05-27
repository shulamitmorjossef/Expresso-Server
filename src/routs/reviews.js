import express from 'express';
import pool from '../data-access/db.js';

const app = express.Router();

app.get('/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/reviews', async (req, res) => {
console.log("Received POST /reviews");
console.log("Request body:", req.body);

  const { content } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Review content is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO reviews (content) VALUES ($1) RETURNING *',
      [content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
