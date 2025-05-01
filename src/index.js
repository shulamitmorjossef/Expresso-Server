import express from 'express';
import cors from 'cors';
import pool from './data-access/db.js';
import RegisterRoute from './RegisterRoute.js'; 


const app = express();
const port = process.env.PORT || 3000; 

app.use(express.json());

app.use(cors());

app.use(RegisterRoute);

app.get('/', (req, res) => {
  res.send('Hello Shulamit!');
});

app.get('/terms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM terms LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching terms:', err);
    res.status(500).send('Server error');
  }
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`✅ DB connected! Current time from DB: ${result.rows[0].now}`);
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).send('❌ Failed to connect to DB');
  }
});


app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).send('❌ Failed to fetch users');
  }
});

// ✅ נתיב להוספת משתמש ללא בדיקות
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('LOGIN REQUEST:', { username, password });
  if (!username || !password) {
    return res.status(400).send({ message: 'Missing username or password' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    console.log('LOGIN RESULT:', result.rows); // תוספת ללוג

    if (result.rows.length > 0) {
      res.status(200).send({ message: 'Login successful', user: result.rows[0] });
      console.log(res.message); // תוספת ללוג
    } else {
      res.status(401).send({ message: 'Invalid username or password' });
      console.log(res.message); // תוספת ללוג
    }
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).send({ message: '❌ Failed to login' });
  }
});


app.get('/about', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM about LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('No about content found.');
    }
  } catch (err) {
    console.error('❌ Error fetching about content:', err);
    res.status(500).send('❌ Failed to fetch about content');
  }
});


app.get('/ping', (req, res) => {
  console.log('Received ping request');
  res.send('pong 8');
  console.log('Sent pong response');
});


app.post('/add-coffee-machines', async (req, res) => {
  try {
    const { name, color, capacity, price, image_path } = req.body;

    const result = await pool.query(
      `INSERT INTO coffee_machines (name, color, capacity, price, image_path)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, color, capacity, price, image_path]
    );

    res.status(201).json({ message: "☕ Coffee machine added successfully", machine: result.rows[0] });
  } catch (err) {
    console.error("❌ Error inserting coffee machine:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/get-coffee-machine/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM coffee_machines WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Machine not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching coffee machine:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Capsule 
app.post('/add-capsule', async (req, res) => {
  try {
    const { name, flavor, quantity_per_package, net_weight_grams, price, image_path } = req.body;

    const result = await pool.query(
      `INSERT INTO capsules (name, flavor, quantity_per_package, net_weight_grams, price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, flavor, quantity_per_package, net_weight_grams, price, image_path]
    );

    res.status(201).json({ message: "🧃 Capsule added successfully", capsule: result.rows[0] });
  } catch (err) {
    console.error("❌ Error inserting capsule:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/get-capsule/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM capsules WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Capsule not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching capsule:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/get-all-capsule', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM capsules');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).send('❌ Failed to fetch v');
  }
});
// milk-frother 
app.post('/add-milk-frother', async (req, res) => {
  try {
    const { name, color, frothing_type, capacity, price, image_path } = req.body;

    const result = await pool.query(
      `INSERT INTO milk_frothers (name, color, frothing_type, capacity, price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, color, frothing_type, capacity, price, image_path]
    );

    res.status(201).json({ message: "🥛 Milk frother added successfully", frother: result.rows[0] });
  } catch (err) {
    console.error("❌ Error inserting milk frother:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get('/get-milk-frother/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM milk_frothers WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Milk frother not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching milk frother:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/get-all-milk-frothers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM milk_frothers');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching milk frothers:', err);
    res.status(500).send('❌ Failed to fetch milk frothers');
  }
});
// ingredient
app.post('/add-ingredient', async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      `INSERT INTO ingredients (name)
       VALUES ($1) RETURNING *`,
      [name]
    );

    res.status(201).json({ message: "🥗 Ingredient added successfully", ingredient: result.rows[0] });
  } catch (err) {
    console.error("❌ Error inserting ingredient:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get('/get-ingredient/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM ingredients WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching ingredient:", err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get('/get-all-ingredients', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingredients');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching ingredients:', err);
    res.status(500).send('❌ Failed to fetch ingredients');
  }
});

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


