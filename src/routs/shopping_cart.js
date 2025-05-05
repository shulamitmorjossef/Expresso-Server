import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();


// add-to-cart
app.post('/add-to-cart', async (req, res) => {
    try {
      const { user_id, product_id, quantity } = req.body;
  
      const result = await pool.query(
        `INSERT INTO shopping_cart (user_id, product_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id)
         DO UPDATE SET quantity = shopping_cart.quantity + EXCLUDED.quantity
         RETURNING *`,
        [user_id, product_id, quantity]
      );
  
      res.status(201).json({ message: "🛒 Product added to cart", cartItem: result.rows[0] });
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
app.get('/get-cart/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await pool.query(
        `SELECT * FROM shopping_cart WHERE user_id = $1`,
        [userId]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

export default app;