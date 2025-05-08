import express from 'express';
import pool from '../data-access/db.js'; 
import { sendOrderConfirmationEmail } from '../utils/mailer.js';
// src/routs/orders.js
import express from 'express'
import pool from '../data-access/db.js'

const app = express()

// we’re going to mount this file directly with app.use(), so…
app.use(express.json())

// order
// app.post('/add-order/:userId', async (req, res) => {
//   const { userId } = req.params
//     try {
//       const result = await pool.query(
//         `INSERT INTO orders (user_id, status, order_date)
//          VALUES ($1, $2, $3) RETURNING *`,
//         [userId, 'pending', CURRENT_DATE]
        
//       );
//       const newOrder = result.rows[0];
//       const orderId = newOrder.order_id;
//       const shoopingCardProd=await pool.query()
   
//       res.status(201).json({ message: "📦 Order added successfully", order: result.rows[0] });
//     } catch (err) {
//       console.error("❌ Error inserting order:", err);
//       res.status(500).json({ error: "Server error" });
//     }
//   });


app.post('/confirm-order/:userId', async (req, res) => {
  const { userId } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, order_date)
       VALUES ($1, 'pending', CURRENT_DATE)
       RETURNING id`,
      [userId]
    );
    const orderId = orderResult.rows[0].id;
    // שליפת כתובת האימייל של המשתמש
    const emailResult = await pool.query(
      `SELECT email FROM users WHERE id = $1`,
      [userId]
    );
    const userEmail = emailResult.rows[0]?.email;
        // שליחת מייל אישור הזמנה
    if (userEmail) {
      await sendOrderConfirmationEmail(userEmail, orderId);
    }

   
    const cartItemsResult = await client.query(
      `SELECT product_id, product_type, quantity
       FROM shopping_cart
       WHERE user_id = $1`,
      [userId]
    );

    const cartItems = cartItemsResult.rows;

    if (cartItems.length === 0) {
      throw new Error("🛒 Cart is empty.");
    }

    
    for (const item of cartItems) {
      const { product_id, product_type, quantity } = item;

      await client.query(
        `INSERT INTO ordered_products (order_id, product_id, product_type, quantity)
         VALUES ($1, $2, $3, $4)`,
        [orderId, product_id, product_type, quantity]
      );

    
      const tableName = product_type; 
      await client.query(
        `UPDATE ${tableName}
         SET sum_of = sum_of - $1
         WHERE id = $2`,
        [quantity, product_id]
      );
    }

    await client.query(
      `DELETE FROM shopping_cart
       WHERE user_id = $1`,
      [userId]
    );

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Order confirmed successfully',
      orderId,
      itemsCount: cartItems.length
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error confirming order:", err);
    res.status(500).json({ error: "Server error during order confirmation" });
  } finally {
    client.release();
  }
});

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
    try {
      const { order_id, product_id,product_type, quantity } = req.body;
  
      const result = await pool.query(
        `INSERT INTO ordered_products (order_id, product_id,product_type,quantity)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [order_id, product_id,product_type, quantity]
      );
  
      res.status(201).json({ message: "🛒 Product added to order", orderedProduct: result.rows[0] });
    } catch (err) {
      console.error("❌ Error inserting ordered product:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
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
      const result = await pool.query('SELECT * FROM ordered_products ORDER BY order_id');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching ordered products:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
app.delete('/delete-all-orders', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders');
    res.status(200).json({ message: '🗑️ All orders deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting orders:', err);
    res.status(500).json({ error: 'Server error while deleting orders' });
  }
});


app.put('/set-status-order/:orderId', async (req, res) => {
  try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status value' });
      }

      const result = await pool.query(
          `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
          [status, orderId]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ message: 'Order status updated successfully', order: result.rows[0] });
  } catch (err) {
      console.error(' Error updating order status:', err);
      res.status(500).json({ error: 'Server error' });
  }
});


app.get('/get-order-details/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
      // שליפת פרטי ההזמנה
      const orderResult = await pool.query(
          `SELECT o.id AS order_id, o.status, o.order_date, u.email
           FROM orders o
           JOIN users u ON o.user_id = u.id
           WHERE o.id = $1`,
          [orderId]
      );

      if (orderResult.rows.length === 0) {
          return res.status(404).json({ error: 'Order not found' });
      }

      const order = orderResult.rows[0];

      // שליפת המוצרים שהוזמנו
      const productsResult = await pool.query(
          `SELECT op.product_id, op.product_type, op.quantity,
                  COALESCE(cm.name, mf.name, c.name) AS product_name, 
                  COALESCE(cm.price, mf.price, c.price) AS price
           FROM ordered_products op
           LEFT JOIN coffee_machines cm ON op.product_id = cm.id AND op.product_type = 'coffee_machines'
           LEFT JOIN milk_frothers mf ON op.product_id = mf.id AND op.product_type = 'milk_frothers'
           LEFT JOIN capsules c ON op.product_id = c.id AND op.product_type = 'capsules'
           WHERE op.order_id = $1`,
          [orderId]
      );

      order.products = productsResult.rows;

      res.status(200).json({
          orderId: order.order_id,
          status: order.status,
          orderDate: order.order_date,
          email: order.email,
          products: order.products
      });
  } catch (err) {
      console.error("❌ Error fetching order details:", err);
      res.status(500).json({ error: 'Server error while fetching order details' });
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

  app.delete('/delete-all-orders', async (req, res) => {
    try {
      await pool.query('DELETE FROM orders');
      res.status(200).json({ message: '🗑️ All orders deleted successfully' });
    } catch (err) {
      console.error('❌ Error deleting orders:', err);
      res.status(500).json({ error: 'Server error while deleting orders' });
    }
  });
  
  
export default app;
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
