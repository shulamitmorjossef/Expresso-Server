// src/routs/orders.js
import express from 'express'
import pool from '../data-access/db.js'

const app = express()

// we’re going to mount this file directly with app.use(), so…
app.use(express.json())

/**
 * Create a new order
 */
app.post('/add-order', async (req, res) => {
  const { user_id, status, order_date } = req.body
  if (!user_id || !status || !order_date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO orders (user_id, status, order_date)
         VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, status, order_date]
    )
    res.status(201).json({ order: result.rows[0] })
  } catch (err) {
    console.error('❌ Error inserting order:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * List all orders
 */
app.get('/get-all-orders', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY order_date DESC'
    )
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Error fetching orders:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * Add a product to an order
 * (now requires product_type)
 */
app.post('/add-ordered-product', async (req, res) => {
  const { order_id, product_id, product_type, quantity } = req.body

  // basic presence check
  if (!order_id || !product_id || !product_type || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  // validate product_type against your table’s CHECK constraint
  if (!['coffee_machines','milk_frothers','capsules'].includes(product_type)) {
    return res.status(400).json({ error: 'Invalid product_type' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO ordered_products
         (order_id, product_id, product_type, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, product_id, product_type, quantity]
    )
    res.status(201).json({ orderedProduct: result.rows[0] })
  } catch (err) {
    console.error('❌ Error inserting ordered product:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * List all ordered‐products
 */
app.get('/get-all-ordered-products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT order_id, product_id, product_type, quantity
      FROM ordered_products
      ORDER BY order_id
    `)
    res.json(result.rows)
  } catch (err) {
    console.error('❌ Error fetching ordered products:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default app
