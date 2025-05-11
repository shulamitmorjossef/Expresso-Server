import express from 'express';
import pool from '../data-access/db.js'; 
import multer from 'multer';
import path from 'path';


const app = express.Router();
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: 'public/images',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// new one
app.post('/add-coffee-machines', upload.single('image'), async (req, res) => {
  const { name, color, capacity, price} = req.body;
  const imagePath = `/images/${req.file.filename}`;

  try {

    const result = await pool.query(
      `INSERT INTO coffee_machines 
        (name, color, capacity, price, image_path)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, color, capacity, price, imagePath]
    );

    res.status(201).json({ message: " Coffee machine added successfully", machine: result.rows[0] });
  } catch (err) {
    console.error("Error inserting coffee machine:", err);
    res.status(500).json({ error: 'Error adding coffee machine' });
  }
});


// original - aderet
// app.post('/add-coffee-machines', upload.none(), async (req, res) => {
//   try {
//     console.log("Add coffee request body:", req.body); 

//     const { name, color, capacity, price} = req.body;


//     const result = await pool.query(
//       `INSERT INTO coffee_machines (name, color, capacity, price)
//        VALUES ($1, $2, $3, $4) RETURNING *`,
//       [name, color, capacity, price]
//     );

//     res.status(201).json({ message: "☕ Coffee machine added successfully", machine: result.rows[0] });
//   } catch (err) {
//     console.error("Error inserting coffee machine:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// app.post('/add-coffee-machines', async (req, res) => {
//     try {
//       console.log("Add coffee request body:", req.body); 

//       const { name, color, capacity, price, image_path } = req.body;

  
//       const result = await pool.query(
//         `INSERT INTO coffee_machines (name, color, capacity, price, image_path)
//          VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//         [name, color, capacity, price, image_path]
//       );
  
//       res.status(201).json({ message: "☕ Coffee machine added successfully", machine: result.rows[0] });
//     } catch (err) {
//       console.error("Error inserting coffee machine:", err);
//       res.status(500).json({ error: "Server error" });
//     }
//   });
  
app.get("/get-coffee-machine/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        "SELECT * FROM coffee_machines WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error fetching coffee machine:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  
app.get('/get-all-coffee-machines', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM coffee_machines');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Failed to fetch v');
    }
  });


app.put('/update-coffee-machine/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, color, capacity, price } = req.body;
    let imagePath = req.body.image_path;
    try {
      if (req.file) {
        imagePath = `/images/${req.file.filename}`;
      }
      const result = await pool.query(
        `UPDATE coffee_machines 
         SET name = $1, color = $2, capacity = $3, price = $4, image_path = $5 
         WHERE id = $6 RETURNING *`,
        [name, color, capacity, price, imagePath, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json({ message: "Machine updated successfully", machine: result.rows[0] });
    } catch (err) {
      console.error("Error updating machine:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  // original - aderet
// app.put('/update-coffee-machine/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, color, capacity, price, image_path } = req.body;
//     try {
//       const result = await pool.query(
//         `UPDATE coffee_machines SET name = $1, color = $2, capacity = $3, price = $4, image_path = $5 WHERE id = $6 RETURNING *`,
//         [name, color, capacity, price, image_path, id]
//       );
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: "Machine not found" });
//       }
//       res.json({ message: "Machine updated", machine: result.rows[0] });
//     } catch (err) {
//       console.error("Error updating machine:", err);
//       res.status(500).json({ error: "Server error" });
//     }
//   });

app.put('/update-coffee-machine-stock/:id', async (req, res) => {
    const { id } = req.params;
    const { sum_of } = req.body;
    try {
      const result = await pool.query(
        `UPDATE coffee_machines SET sum_of = $1 WHERE id = $2 RETURNING *`,
        [sum_of, id]
      );
      res.json({ message: 'Stock updated', machine: result.rows[0] });
    } catch (err) {
      console.error('Error updating coffee machine stock:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

app.delete('/delete-coffee-machine/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM coffee_machines WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Coffee machine not found' });
    }
    res.json({ message: 'Coffee machine deleted successfully', machine: result.rows[0] });
  } catch (err) {
    console.error('Error deleting coffee machine:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Capsule 
// app.post('/add-capsule',  async (req, res) => {
//     try {
//       console.log("Add capsule request body:", req.body); 

//       const { name, flavor, quantity_per_package, net_weight_grams, price, ingredients, image_path } = req.body;
  
//       const result = await pool.query(
//         `INSERT INTO capsules (name, flavor, quantity_per_package, net_weight_grams, price, image_path, ingredients)
//          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//         [name, flavor, quantity_per_package, net_weight_grams, price, image_path, ingredients]
//       );

  
//       res.status(201).json({ message: "Capsule added successfully", capsule: result.rows[0] });
//     } catch (err) {
//       console.error("Error inserting capsule:", err);
//       res.status(500).json({ error: "Server error" });
//     }
//   });

app.post('/add-capsule', upload.none(), async (req, res) => {
  try {
    console.log("Add capsule request body:", req.body); 

    const { name, flavor, quantity_per_package, net_weight_grams, price, ingredients } = req.body;

    const result = await pool.query(
      `INSERT INTO capsules (name, flavor, quantity_per_package, net_weight_grams, price, ingredients)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, flavor, quantity_per_package, net_weight_grams, price, ingredients]
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

  app.put('/update-capsule-stock/:id', async (req, res) => {
    const { id } = req.params;
    const { sum_of } = req.body;
    try {
      const result = await pool.query(
        `UPDATE capsules SET sum_of = $1 WHERE id = $2 RETURNING *`,
        [sum_of, id]
      );
      res.json({ message: 'Stock updated', capsule: result.rows[0] });
    } catch (err) {
      console.error('Error updating capsule stock:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

app.delete('/delete-capsule/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM capsules WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      res.json({ message: "Capsule deleted", capsule: result.rows[0] });
    } catch (err) {
      console.error("Error deleting capsule:", err);
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
  });

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

  app.put('/update-milk-frother-stock/:id', async (req, res) => {
    const { id } = req.params;
    const { sum_of } = req.body;
    try {
      const result = await pool.query(
        `UPDATE milk_frothers SET sum_of = $1 WHERE id = $2 RETURNING *`,
        [sum_of, id]
      );
      res.json({ message: 'Stock updated', frother: result.rows[0] });
    } catch (err) {
      console.error('Error updating frother stock:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  //  Search across all products by name prefix
app.get('/search-products', async (req, res) => {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    const [coffee, capsules, frothers] = await Promise.all([
      pool.query(`SELECT *, 'coffee_machine' as type FROM coffee_machines WHERE LOWER(name) LIKE LOWER($1)`, [`${query}%`]),
      pool.query(`SELECT *, 'capsule' as type FROM capsules WHERE LOWER(name) LIKE LOWER($1)`, [`${query}%`]),
      pool.query(`SELECT *, 'milk_frother' as type FROM milk_frothers WHERE LOWER(name) LIKE LOWER($1)`, [`${query}%`]),
    ]);

    const results = [...coffee.rows, ...capsules.rows, ...frothers.rows];
    res.json(results);
  } catch (err) {
    console.error("Error in search:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.delete('/delete-milk-frother/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM milk_frothers WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Frother not found" });
      }
      res.json({ message: "Frother deleted", frother: result.rows[0] });
    } catch (err) {
      console.error("Error deleting frother:", err);
      res.status(500).json({ error: "Server error" });
    }
  });



export default app;