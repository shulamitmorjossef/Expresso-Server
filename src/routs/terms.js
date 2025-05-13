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


app.put('/terms', async (req, res) => {
    try {
      const { title, section1, section2, section3, section4, section5 } = req.body;
  
      const result = await pool.query(
        `UPDATE terms 
         SET title = $1, section1 = $2, section2 = $3, section3 = $4, section4 = $5, section5 = $6
         WHERE id = (SELECT MIN(id) FROM terms)
         RETURNING *`,
        [title, section1, section2, section3, section4, section5]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Terms not found' });
      }
  
      res.status(200).json({ success: true, terms: result.rows[0] });
    } catch (err) {
      console.error('Error updating terms:', err);
      res.status(500).send({ success: false, message: 'Server error' });
    }
  });
  
export default app;