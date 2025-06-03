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

  const { content, username } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Review content is required' });
  }

  if (!username || username.trim() === '') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO reviews (content, username) VALUES ($1, $2) RETURNING *',
      [content.trim(), username.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default app;
