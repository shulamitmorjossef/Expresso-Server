import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();

//TODO: ADD CHECK THAT PRODUCT EXIST
app.post('/add-to-cart', async (req, res) => {
  const { user_id, product_id, quantity, product_type } = req.body;
  // console.log("📥 Server received:", { user_id, product_id, quantity, product_type });

  if (!user_id || !product_id || !quantity || !product_type) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM shopping_cart WHERE user_id = $1 AND product_id = $2 AND product_type = $3',
      [user_id, product_id, product_type]
    );

    if (existing.rows.length > 0) {
      // console.log("🔄 Updating existing item in cart...");
      await pool.query(
        'UPDATE shopping_cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 AND product_type = $4',
        [quantity, user_id, product_id, product_type]
      );
    } else {
      // console.log("🆕 Inserting new item into cart...");
      // console.log(product_type);

      await pool.query(
        'INSERT INTO shopping_cart (user_id, product_id, quantity, product_type) VALUES ($1, $2, $3, $4)',
        [user_id, product_id, quantity, product_type]
      );
    }

    res.status(200).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error("❌ Error adding to cart:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


app.get('/get-cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        sc.user_id,
        sc.product_id,
        sc.quantity,
        sc.product_type,
        COALESCE(c.name, m.name, f.name) as name,
        COALESCE(c.price, m.price, f.price) as price,
        CASE
          WHEN sc.product_type = 'capsules' THEN c.image
          WHEN sc.product_type = 'coffee_machines' THEN m.image
          WHEN sc.product_type = 'milk_frothers' THEN f.image
          ELSE NULL
        END as image
      FROM shopping_cart sc
      LEFT JOIN capsules c ON sc.product_type = 'capsules' AND sc.product_id = c.id
      LEFT JOIN coffee_machines m ON sc.product_type = 'coffee_machines' AND sc.product_id = m.id
      LEFT JOIN milk_frothers f ON sc.product_type = 'milk_frothers' AND sc.product_id = f.id
      WHERE sc.user_id = $1
    `, [userId]);

    // Convert images to base64
    const cartItems = result.rows.map(item => ({
      ...item,
      image: item.image ? `data:image/jpeg;base64,${Buffer.from(item.image).toString('base64')}` : null,
    }));

    res.status(200).json(cartItems);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Server error" });
  }
});


 
// app.get('/get-cart/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const result = await pool.query(`
//       SELECT 
//         sc.user_id,
//         sc.product_id,
//         sc.quantity,
//         sc.product_type,
//         COALESCE(c.name, m.name, f.name) as name,
//         COALESCE(c.price, m.price, f.price) as price,
//         COALESCE(c.image, m.image, f.image) as image
//       FROM shopping_cart sc
//       LEFT JOIN capsules c ON sc.product_type = 'capsules' AND sc.product_id = c.id
//       LEFT JOIN coffee_machines m ON sc.product_type = 'coffee_machines' AND sc.product_id = m.id
//       LEFT JOIN milk_frothers f ON sc.product_type = 'milk_frothers' AND sc.product_id = f.id
//       WHERE sc.user_id = $1
//     `, [userId]);

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error("Error fetching cart:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


app.get('/get-all-shopping-carts', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM shopping_cart`
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("❌ Error fetching cart:", err);
      res.status(500).json({ error: "Server error" });
    }
});
app.delete('/clear-cart/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query('DELETE FROM shopping_cart WHERE user_id = $1', [userId]);
    res.status(200).json({ message: `🧹 Cart cleared for user ${userId}` });
  } catch (err) {
    console.error('❌ Error clearing cart:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/shopping-cart-columns', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'shopping_cart'
      ORDER BY ordinal_position;
    `);

    const columns = result.rows.map(row => row.column_name);
    res.status(200).json(columns);
  } catch (err) {
    console.error('❌ Error fetching columns:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/remove-from-cart', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({ error: 'Missing user_id or product_id' });
  }

  try {
    await pool.query(
      'DELETE FROM shopping_cart WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('❌ Error removing from cart:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.patch('/update-cart-quantity', async (req, res) => {
  const { user_id, product_id, product_type, quantity } = req.body;
  if (!user_id || !product_id || !product_type || quantity < 1) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    await pool.query(
      `UPDATE shopping_cart 
       SET quantity = $1 
       WHERE user_id = $2 AND product_id = $3 AND product_type = $4`,
      [quantity, user_id, product_id, product_type]
    );
    res.status(200).json({ message: 'Quantity updated' });
  } catch (err) {
    console.error('❌ Error updating quantity:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;