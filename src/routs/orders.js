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







  app.get('/BestSellers', async (req, res) => {
    const { startDate, endDate } = req.query;
  
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing date range" });
    }
  
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: "Invalid date range" });
    }
  
    try {
      const result = await pool.query(`
        -- Query for best-selling coffee machines
        SELECT cm.name, SUM(op.quantity) AS total_sold
        FROM ordered_products op
        JOIN orders o ON o.id = op.order_id
        JOIN coffee_machines cm ON cm.id = op.product_id
        WHERE o.order_date BETWEEN $1 AND $2
        GROUP BY cm.name
  
        UNION ALL
  
        -- Query for best-selling milk frothers
        SELECT mf.name, SUM(op.quantity) AS total_sold
        FROM ordered_products op
        JOIN orders o ON o.id = op.order_id
        JOIN milk_frothers mf ON mf.id = op.product_id
        WHERE o.order_date BETWEEN $1 AND $2
        GROUP BY mf.name
  
        UNION ALL
  
        -- Query for best-selling capsules
        SELECT c.name, SUM(op.quantity) AS total_sold
        FROM ordered_products op
        JOIN orders o ON o.id = op.order_id
        JOIN capsules c ON c.id = op.product_id
        WHERE o.order_date BETWEEN $1 AND $2
        GROUP BY c.name
        ORDER BY total_sold DESC
      `, [startDate, endDate]);
  
      if (result.rows.length === 0) {
        return res.status(200).json({ message: "No data for selected period." });
      }
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching best sellers:", err);  // הוצאת השגיאה המלאה
      res.status(500).json({ error: "Server error", details: err.stack });  // הוספת פרטי שגיאה מדויקים יותר
    }
  
  });
  app.get('/search-products', async (req, res) => {
    const { query } = req.query;
  
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: "Missing search term" });
    }
  
    try {
      const searchQuery = `%${query}%`;
  
      const result = await pool.query(`
        SELECT id, name, price, image_path, 'coffee_machine' AS type
        FROM coffee_machines
        WHERE name ILIKE $1
  
        UNION ALL
  
        SELECT id, name, price, image_path, 'capsule' AS type
        FROM capsules
        WHERE name ILIKE $1
  
        UNION ALL
  
        SELECT id, name, price, image_path, 'milk_frother' AS type
        FROM milk_frothers
        WHERE name ILIKE $1
      `, [searchQuery]);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error searching products:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
export default app;