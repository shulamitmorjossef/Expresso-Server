import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();


// order
app.post('/add-order', async (req, res) => {
    try {
      const { user_id, status, order_date } = req.body;
  
      const result = await pool.query(
        `INSERT INTO orders (user_id, status, order_date)
         VALUES ($1, $2, $3) RETURNING *`,
        [user_id, status, order_date]
      );
  
      res.status(201).json({ message: "📦 Order added successfully", order: result.rows[0] });
    } catch (err) {
      console.error("❌ Error inserting order:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

app.get('/get-all-orders', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ordered-product
app.post('/add-ordered-product', async (req, res) => {
    try {
      const { order_id, product_id, quantity } = req.body;
  
      const result = await pool.query(
        `INSERT INTO ordered_products (order_id, product_id, quantity)
         VALUES ($1, $2, $3) RETURNING *`,
        [order_id, product_id, quantity]
      );
  
      res.status(201).json({ message: "🛒 Product added to order", orderedProduct: result.rows[0] });
    } catch (err) {
      console.error("❌ Error inserting ordered product:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
app.get('/get-all-ordered-products', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM ordered_products ORDER BY order_id');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching ordered products:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

export default app;