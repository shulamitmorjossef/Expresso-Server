// import express from 'express';

// import pool from '../data-access/db.js'; 

// const app = express.Router();

// //TODO: ADD CHECK THAT PRODUCT EXIST
// app.post('/add-to-cart', async (req, res) => {
//   const { user_id, product_id, quantity, product_type } = req.body;
//   // console.log("📥 Server received:", { user_id, product_id, quantity, product_type });

//   if (!user_id || !product_id || !quantity || !product_type) {
//     return res.status(400).json({ error: 'Missing parameters' });
//   }

//   try {
//     const existing = await pool.query(
//       'SELECT * FROM shopping_cart WHERE user_id = $1 AND product_id = $2 AND product_type = $3',
//       [user_id, product_id, product_type]
//     );

//     if (existing.rows.length > 0) {
//       // console.log(" Updating existing item in cart...");
//       await pool.query(
//         'UPDATE shopping_cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 AND product_type = $4',
//         [quantity, user_id, product_id, product_type]
//       );
//     } else {
//       // console.log(" Inserting new item into cart...");
//       // console.log(product_type);

//       await pool.query(
//         'INSERT INTO shopping_cart (user_id, product_id, quantity, product_type) VALUES ($1, $2, $3, $4)',
//         [user_id, product_id, quantity, product_type]
//       );
//     }

//     res.status(200).json({ message: 'Item added to cart' });
//   } catch (err) {
//     console.error(" Error adding to cart:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });


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


//     const cartWithBase64Images = result.rows.map(item => ({
//       ...item,
//       image: item.image ? Buffer.from(item.image).toString('base64') : null
//     }));

//     res.status(200).json(cartWithBase64Images);
//   } catch (err) {
//     console.error("Error fetching cart:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });



// app.get('/get-all-shopping-carts', async (req, res) => {
//     try {
//       const result = await pool.query(
//         `SELECT * FROM shopping_cart`
//       );
//       res.status(200).json(result.rows);
//     } catch (err) {
//       console.error("❌ Error fetching cart:", err);
//       res.status(500).json({ error: "Server error" });
//     }
// });
// app.delete('/clear-cart/:userId', async (req, res) => {
//   const { userId } = req.params;
//   try {
//     await pool.query('DELETE FROM shopping_cart WHERE user_id = $1', [userId]);
//     res.status(200).json({ message: `🧹 Cart cleared for user ${userId}` });
//   } catch (err) {
//     console.error('❌ Error clearing cart:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// app.get('/shopping-cart-columns', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT column_name
//       FROM information_schema.columns
//       WHERE table_name = 'shopping_cart'
//       ORDER BY ordinal_position;
//     `);

//     const columns = result.rows.map(row => row.column_name);
//     res.status(200).json(columns);
//   } catch (err) {
//     console.error('❌ Error fetching columns:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.delete('/remove-from-cart', async (req, res) => {
//   const { user_id, product_id } = req.body;

//   if (!user_id || !product_id) {
//     return res.status(400).json({ error: 'Missing user_id or product_id' });
//   }

//   try {
//     await pool.query(
//       'DELETE FROM shopping_cart WHERE user_id = $1 AND product_id = $2',
//       [user_id, product_id]
//     );
//     res.status(200).json({ message: 'Item removed from cart' });
//   } catch (err) {
//     console.error(' Error removing from cart:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// app.patch('/update-cart-quantity', async (req, res) => {
//   const { user_id, product_id, product_type, quantity } = req.body;
//   if (!user_id || !product_id || !product_type || quantity < 1) {
//     return res.status(400).json({ error: 'Invalid input' });
//   }

//   try {
//     await pool.query(
//       `UPDATE shopping_cart 
//        SET quantity = $1 
//        WHERE user_id = $2 AND product_id = $3 AND product_type = $4`,
//       [quantity, user_id, product_id, product_type]
//     );
//     res.status(200).json({ message: 'Quantity updated' });
//   } catch (err) {
//     console.error('❌ Error updating quantity:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// export default app;



import express from 'express';
import pool from '../data-access/db.js';

const app = express.Router();

//TODO: ADD CHECK THAT PRODUCT EXIST
// app.post('/add-to-cart', async (req, res) => {
//   let { user_id, product_id, quantity, product_type } = req.body;

//   // המרה למספר
//   quantity = parseInt(quantity, 10);

//   if (!user_id || !product_id || !quantity || !product_type) {
//     return res.status(400).json({ error: 'Missing parameters' });
//   }

//   try {
//     // 1. שליפת מלאי קיים מהטבלה הנכונה
//     let stockQuery;
//     if (product_type === 'capsule') {
//       stockQuery = await pool.query('SELECT sum_of FROM capsules WHERE id = $1', [product_id]);
//     } else if (product_type === 'coffee_machine') {
//       stockQuery = await pool.query('SELECT sum_of FROM coffee_machines WHERE id = $1', [product_id]);
//     } else if (product_type === 'milk_frother') {
//       stockQuery = await pool.query('SELECT sum_of FROM milk_frothers WHERE id = $1', [product_id]);
//     } else {
//       return res.status(400).json({ error: 'Invalid product type' });
//     }

//     if (stockQuery.rows.length === 0) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     const availableStock = stockQuery.rows[0].sum_of;

//     // 2. בדיקה אם כבר קיים בעגלה
//     const existing = await pool.query(
//       'SELECT quantity FROM shopping_cart WHERE user_id = $1 AND product_id = $2 AND product_type = $3',
//       [user_id, product_id, product_type]
//     );

//     const currentInCart = existing.rows.length > 0 ? existing.rows[0].quantity : 0;
//     const totalRequested = currentInCart + quantity;

//     // 3. בדיקת חריגה מהמלאי
//     if (totalRequested > availableStock) {
//       return res.status(400).json({
//         error: `Only ${availableStock} in stock. You already have ${currentInCart} in your cart.`
//       });
//     }

//     // 4. עדכון או הוספה לעגלה
//     if (existing.rows.length > 0) {
//       await pool.query(
//         'UPDATE shopping_cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 AND product_type = $4',
//         [quantity, user_id, product_id, product_type]
//       );
//     } else {
//       await pool.query(
//         'INSERT INTO shopping_cart (user_id, product_id, quantity, product_type) VALUES ($1, $2, $3, $4)',
//         [user_id, product_id, quantity, product_type]
//       );
//     }

//     res.status(200).json({ message: 'Item added to cart' });

//   } catch (err) {
//     console.error("❌ Error adding to cart:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.post('/add-to-cart', async (req, res) => {
  const { user_id, product_id, quantity, product_type } = req.body;
  console.log("📥 Server received:", { user_id, product_id, quantity, product_type });

  if (!user_id || !product_id || !quantity || !product_type) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // 1. בדיקה אם כבר קיים בעגלה
    const existing = await pool.query(
      'SELECT quantity FROM shopping_cart WHERE user_id = $1 AND product_id = $2 AND product_type = $3',
      [user_id, product_id, product_type]
    );

    const quantityInCart = existing.rows.length > 0 ? existing.rows[0].quantity : 0;

    // 2. שליפת המלאי של המוצר מהטבלה המתאימה
    const stockResult = await pool.query(
      `SELECT sum_of FROM ${product_type} WHERE id = $1`,
      [product_id]
    );

    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in inventory' });
    }

    const stockAvailable = stockResult.rows[0].sum_of;
    const remainingStock = stockAvailable - quantityInCart;

    // 3. בדיקת זמינות
    if (quantity > remainingStock) {
      return res.status(400).json({
        error: `Only ${remainingStock} item(s) available in stock`
      });
    }

    // 4. עדכון/הוספה לעגלה
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE shopping_cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 AND product_type = $4',
        [quantity, user_id, product_id, product_type]
      );
    } else {
      await pool.query(
        'INSERT INTO shopping_cart (user_id, product_id, quantity, product_type) VALUES ($1, $2, $3, $4)',
        [user_id, product_id, quantity, product_type]
      );
    }

    res.status(200).json({ message: 'Item added to cart' });

  } catch (err) {
    console.error("Error adding to cart:", err.message);
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


//     const cartWithBase64Images = result.rows.map(item => ({
//       ...item,
//       image: item.image ? Buffer.from(item.image).toString('base64') : null
//     }));

//     res.status(200).json(cartWithBase64Images);
//   } catch (err) {
//     console.error("Error fetching cart:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


app.get('/get-cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        sc.user_id,
        sc.product_id,
        sc.quantity,
        sc.product_type,
        COALESCE(c.name, m.name, f.name) AS name,
        COALESCE(c.price, m.price, f.price) AS price,
        COALESCE(c.image, m.image, f.image) AS image,
        COALESCE(c.sum_of, m.sum_of, f.sum_of) AS sum_of
      FROM shopping_cart sc
      LEFT JOIN capsules c ON sc.product_type = 'capsules' AND sc.product_id = c.id
      LEFT JOIN coffee_machines m ON sc.product_type = 'coffee_machines' AND sc.product_id = m.id
      LEFT JOIN milk_frothers f ON sc.product_type = 'milk_frothers' AND sc.product_id = f.id
      WHERE sc.user_id = $1
    `, [userId]);

    // המרת תמונות לפורמט base64
    const cartWithBase64Images = result.rows.map(item => ({
      ...item,
      image: item.image ? Buffer.from(item.image).toString('base64') : null
    }));

    res.status(200).json(cartWithBase64Images);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Server error" });
  }
});

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
    let stockQuery;
    if (product_type === 'capsules') {
      stockQuery = await pool.query('SELECT sum_of FROM capsules WHERE id = $1', [product_id]);
    } else if (product_type === 'coffee_machines') {
      stockQuery = await pool.query('SELECT sum_of FROM coffee_machines WHERE id = $1', [product_id]);
    } else if (product_type === 'milk_frothers') {
      stockQuery = await pool.query('SELECT sum_of FROM milk_frothers WHERE id = $1', [product_id]);
    } else {
      return res.status(400).json({ error: 'Invalid product type' });
    }

    if (stockQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const availableStock = stockQuery.rows[0].sum_of;

    if (quantity > availableStock) {
      return res.status(400).json({
        error: `Only ${availableStock} in stock. Cannot set quantity to ${quantity}.`
      });
    }

    await pool.query(
      `UPDATE shopping_cart
       SET quantity = $1
       WHERE user_id = $2 AND product_id = $3 AND product_type = $4`,
      [quantity, user_id, product_id, product_type]
    );

    res.status(200).json({ message: 'Quantity updated' });
  } catch (err) {
    console.error(' Error updating quantity:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


export default app;
