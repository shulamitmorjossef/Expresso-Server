import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();
  


app.post('/add-coupon', async (req, res) => {
    try {
      const { codename, discount_percent } = req.body;
  
      const result = await pool.query(
        `INSERT INTO coupons (codename, discount_percent)
         VALUES ($1, $2) RETURNING *`,
        [codename, discount_percent]
      );
  
      res.status(201).json({ message: "🏷️ Coupon added successfully", coupon: result.rows[0] });
    } catch (err) {
      console.error("❌ Error inserting coupon:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  // coupon
app.get('/get-coupon/:code', async (req, res) => {
    const { code } = req.params;
  
    try {
      const result = await pool.query("SELECT * FROM coupons WHERE codename = $1", [code]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("❌ Error fetching coupon:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

app.get('/get-all-coupons', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM coupons');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ Error fetching coupons:', err);
      res.status(500).send('❌ Failed to fetch coupons');
    }
  });


export default app;