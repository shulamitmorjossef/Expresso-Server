import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();


// delivery-date
app.post('/add-delivery-date', async (req, res) => {
    try {
      const { day, month, year } = req.body;
  
      const result = await pool.query(
        `INSERT INTO delivery_dates (day, month, year)
         VALUES ($1, $2, $3) RETURNING *`,
        [day, month, year]
      );
  
      res.status(201).json({ message: "📦 Delivery date added", date: result.rows[0] });
    } catch (err) {
      console.error("❌ Error inserting delivery date:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
app.get('/get-all-delivery-dates', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM delivery_dates ORDER BY year, month, day');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching delivery dates:", err);
      res.status(500).json({ error: "Server error" });
    }
  });


  app.delete('/remove-delivery-date', async (req, res) => {
    try {
        const { day, month, year } = req.body;

        const result = await pool.query(
            `DELETE FROM delivery_dates WHERE day = $1 AND month = $2 AND year = $3 RETURNING *`,
            [day, month, year]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "⚠️ Delivery date not found" });
        }

        res.status(200).json({ message: "🗑️ Delivery date removed", date: result.rows[0] });
    } catch (err) {
        console.error("❌ Error removing delivery date:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default app;