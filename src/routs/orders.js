import express from 'express';
import pool from '../data-access/db.js';
import { sendOrderConfirmationEmail } from '../utils/mailer.js';

const router = express.Router();
router.use(express.json());

// Confirm order: 
 
router.post('/confirm-order/:userId', async (req, res) => {
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

    const emailRes = await client.query(
      `SELECT email FROM users WHERE id = $1`,
      [userId]
    );
    const userEmail = emailRes.rows[0]?.email;
    if (userEmail) {
      await sendOrderConfirmationEmail(userEmail, orderId);
    }

    const cartRes = await client.query(
      `SELECT product_id, product_type, quantity
         FROM shopping_cart
        WHERE user_id = $1`,
      [userId]
    );
    const cartItems = cartRes.rows;
    if (cartItems.length === 0) {
      throw new Error('🛒 Cart is empty');
    }

    for (const { product_id, product_type, quantity } of cartItems) {
      await client.query(
        `INSERT INTO ordered_products
           (order_id, product_id, product_type, quantity)
         VALUES ($1,$2,$3,$4)`,
        [orderId, product_id, product_type, quantity]
      );
      await client.query(
        `UPDATE ${product_type}
            SET sum_of = sum_of - $1
          WHERE id = $2`,
        [quantity, product_id]
      );
    }

    await client.query(
      `DELETE FROM shopping_cart WHERE user_id = $1`,
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
    console.error('Error confirming order:', err);
    res.status(500).json({ error: 'Server error during order confirmation' });
  } finally {
    client.release();
  }
});


/**
 * 2) Create a new order manually
 */
router.post('/add-order', async (req, res) => {
  const { user_id, status, order_date } = req.body;
  if (!user_id || !status || !order_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO orders (user_id, status, order_date)
         VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, status, order_date]
    );
    res.status(201).json({ order: result.rows[0] });
  } catch (err) {
    console.error('Error inserting order:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * 3) List all orders
 */
router.get('/get-all-orders', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM orders ORDER BY order_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * 4) Add a product to an order (with product_type)
 */
router.post('/add-ordered-product', async (req, res) => {
  const { order_id, product_id, product_type, quantity } = req.body;

  if (!order_id || !product_id || !product_type || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['coffee_machines', 'milk_frothers', 'capsules'].includes(product_type)) {
    return res.status(400).json({ error: 'Invalid product_type' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO ordered_products
         (order_id, product_id, product_type, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, product_id, product_type, quantity]
    );
    res.status(201).json({ orderedProduct: result.rows[0] });
  } catch (err) {
    console.error('Error inserting ordered product:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * 5) List all ordered‐products
 */
router.get('/get-all-ordered-products', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT order_id, product_id, product_type, quantity
         FROM ordered_products
        ORDER BY order_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching ordered products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * 6) Delete all orders
 */
router.delete('/delete-all-orders', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders');
    res.json({ message: '🗑️ All orders deleted successfully' });
  } catch (err) {
    console.error('Error deleting orders:', err);
    res.status(500).json({ error: 'Server error while deleting orders' });
  }
});


/**
 * 7) Update order status
 */
router.put('/set-status-order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, orderId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




/**
 * 8) Get order details with products & user email
 */
router.get('/get-order-details/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const orderRes = await pool.query(
      `SELECT o.id AS order_id, o.status, o.order_date, u.email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderRes.rows[0];

    const productsRes = await pool.query(
      `SELECT 
         op.product_id, 
         op.product_type, 
         op.quantity,
         COALESCE(cm.name, mf.name, c.name) AS product_name,
         COALESCE(cm.price, mf.price, c.price) AS price,
         COALESCE(cm.image, mf.image, c.image) AS image -- this is BYTEA
       FROM ordered_products op
       LEFT JOIN coffee_machines cm 
         ON op.product_type = 'coffee_machines' AND cm.id = op.product_id
       LEFT JOIN milk_frothers mf 
         ON op.product_type = 'milk_frothers' AND mf.id = op.product_id
       LEFT JOIN capsules c 
         ON op.product_type = 'capsules' AND c.id = op.product_id
       WHERE op.order_id = $1`,
      [orderId]
    );

    const products = productsRes.rows.map(p => ({
      ...p,
      image: p.image ? Buffer.from(p.image).toString('base64') : null
    }));

    order.products = products;

    res.json(order);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Server error fetching order details' });
  }
});



/**
 * 9) Best Sellers
 */
// in src/routes/orders.js (or statistics.js)

router.get('/best-sellers', async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing date range' });
  }

  const sql = `
    SELECT
      op.product_type,
      op.product_id,
      SUM(op.quantity) AS total_sold,
      -- grab the image and name from the correct table
      COALESCE(cm.name, mf.name, c.name)     AS name,
      COALESCE(cm.image_path, mf.image_path, c.image_path) AS image_path
    FROM ordered_products op
    JOIN orders o    ON o.id = op.order_id
    LEFT JOIN coffee_machines   cm ON op.product_type='coffee_machines' AND cm.id=op.product_id
    LEFT JOIN milk_frothers     mf ON op.product_type='milk_frothers'   AND mf.id=op.product_id
    LEFT JOIN capsules          c  ON op.product_type='capsules'        AND c.id=op.product_id
    WHERE o.order_date BETWEEN $1 AND $2
    GROUP BY op.product_type, op.product_id, cm.name, mf.name, c.name, cm.image_path, mf.image_path, c.image_path
    ORDER BY total_sold DESC
  `;
  try {
    const { rows } = await pool.query(sql, [startDate, endDate]);
    if (!rows.length) return res.json({ message: 'No data for selected period.' });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching best sellers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



/**
 * 10) Search products
 */
router.get('/search-products', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Missing search term' });
  }
  try {
    const q = `%${query}%`;
    const result = await pool.query(`
      SELECT id,name,price,image_path,'coffee_machines' AS type
        FROM coffee_machines WHERE name ILIKE $1
      UNION ALL
      SELECT id,name,price,image_path,'capsules'       AS type
        FROM capsules       WHERE name ILIKE $1
      UNION ALL
      SELECT id,name,price,image_path,'milk_frothers'  AS type
        FROM milk_frothers  WHERE name ILIKE $1
    `, [q]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * 11) Get orders
 */
router.get('/orders/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, status, order_date
       FROM orders
       WHERE user_id = $1
       ORDER BY order_date DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/full/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await pool.query(`
      SELECT o.id, o.order_date, o.status,
        COALESCE(SUM(p.price * op.quantity), 0) AS total
      FROM orders o
      LEFT JOIN ordered_products op ON o.id = op.order_id
      LEFT JOIN (
        SELECT id, price, 'coffee_machines' AS type FROM coffee_machines
        UNION ALL
        SELECT id, price, 'milk_frothers' FROM milk_frothers
        UNION ALL
        SELECT id, price, 'capsules' FROM capsules
      ) p ON p.id = op.product_id AND p.type = op.product_type
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `, [userId]);

    res.json(orders.rows);
  } catch (err) {
    console.error('Error loading orders with total:', err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});
/**
 * 13) Delete orders
 */
router.delete('/cancel-order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    
    const orderCheck = await client.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    
    const productsRes = await client.query(
      `SELECT product_id, product_type, quantity
       FROM ordered_products
       WHERE order_id = $1`,
      [orderId]
    );

    
    for (const item of productsRes.rows) {
      const { product_id, product_type, quantity } = item;
      await client.query(
        `UPDATE ${product_type}
         SET sum_of = sum_of + $1
         WHERE id = $2`,
        [quantity, product_id]
      );
    }

    const result = await client.query(
      `UPDATE orders
       SET status = 'cancelled'
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Order cancelled successfully', order: result.rows[0] });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to cancel order:', err);
    res.status(500).json({ error: 'Failed to cancel order' });
  } finally {
    client.release();
  }
});





export default router;