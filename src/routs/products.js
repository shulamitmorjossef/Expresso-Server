import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();


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
      console.error("Error inserting coffee machine:", err);
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
      console.error("Error fetching coffee machine:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put('/update-coffee-machine/:id', async (req, res) => {
    const { id } = req.params;
    const { name, color, capacity, price, image_path } = req.body;
    try {
      const result = await pool.query(
        `UPDATE coffee_machines SET name = $1, color = $2, capacity = $3, price = $4, image_path = $5 WHERE id = $6 RETURNING *`,
        [name, color, capacity, price, image_path, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json({ message: "Machine updated", machine: result.rows[0] });
    } catch (err) {
      console.error("Error updating machine:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  




// Capsule 
app.post('/add-capsule', async (req, res) => {
    try {
      const { name, flavor, quantity_per_package, net_weight_grams, price, image_path } = req.body;
  
      const result = await pool.query(
        `INSERT INTO capsules (name, flavor, quantity_per_package, net_weight_grams, price, image_path, ingredients)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, flavor, quantity_per_package, net_weight_grams, price, image_path, ingredients]
      );
  
      res.status(201).json({ message: "Capsule added successfully", capsule: result.rows[0] });
    } catch (err) {
      console.error("Error inserting capsule:", err);
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
      console.error("Error fetching capsule:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

app.get('/get-all-capsule', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM capsules');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Failed to fetch v');
    }
  });

  app.put('/update-capsule/:id', async (req, res) => {
    const { id } = req.params;
    const { name, flavor, quantity_per_package, net_weight_grams, price, image_path, ingredients } = req.body;
    try {
      const result = await pool.query(
        `UPDATE capsules SET name = $1, flavor = $2, quantity_per_package = $3, net_weight_grams = $4, price = $5, image_path = $6, ingredients = $7 WHERE id = $8 RETURNING *`,
        [name, flavor, quantity_per_package, net_weight_grams, price, image_path, ingredients, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      res.json({ message: "Capsule updated", capsule: result.rows[0] });
    } catch (err) {
      console.error("Error updating capsule:", err);
      res.status(500).json({ error: "Server error" });
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
  
      res.status(201).json({ message: "Milk frother added successfully", frother: result.rows[0] });
    } catch (err) {
      console.error("Error inserting milk frother:", err);
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
      console.error("Error fetching milk frother:", err);
      res.status(500).json({ message: "Server error" });
    }
  }o);

app.get('/get-all-milk-frothers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM milk_frothers');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching milk frothers:', err);
      res.status(500).send('Failed to fetch milk frothers');
    }
  });

  app.put('/update-milk-frother/:id', async (req, res) => {
    const { id } = req.params;
    const { name, color, frothing_type, capacity, price, image_path } = req.body;
    try {
      const result = await pool.query(
        `UPDATE milk_frothers SET name = $1, color = $2, frothing_type = $3, capacity = $4, price = $5, image_path = $6 WHERE id = $7 RETURNING *`,
        [name, color, frothing_type, capacity, price, image_path, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Frother not found" });
      }
      res.json({ message: "Frother updated", frother: result.rows[0] });
    } catch (err) {
      console.error("Error updating frother:", err);
      res.status(500).json({ error: "Server error" });
    }
  });



export default app;