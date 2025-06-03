import express from 'express';
import pool from '../data-access/db.js'; 
import multer from 'multer';
import path from 'path';


const app = express.Router();

const storage = multer.memoryStorage(); 

const upload = multer({ storage });

// add product
app.post('/add-coffee-machines', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      color,
      capacity,
      price
    } = req.body;

    const imageBuffer = req.file.buffer;

    await pool.query(
      `INSERT INTO coffee_machines
       (name, color, capacity, price, image)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, color, capacity, price, imageBuffer]
    );

    res.status(200).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Server error while adding product' });
  }
});

app.get('/get-coffee-machine/:id', async (req, res) => {
  
  const { id } = req.params;
  try {
      const result = await pool.query(
          `SELECT id, name, color, capacity, price, image 
          FROM coffee_machines 
          WHERE id = $1`,
          [id]
      );

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Coffee machine not found' });
      }

      const coffeeMachine = result.rows[0];
      const productData = {
      id: coffeeMachine.id,
      name: coffeeMachine.name,
      color: coffeeMachine.color,
      capacity: coffeeMachine.capacity,
      price: coffeeMachine.price,
      image_url: `data:image/jpeg;base64,${Buffer.from(coffeeMachine.image).toString('base64')}`      };

      res.json(productData);
  } catch (error) {
      console.error('Error fetching coffee machine:', error);
      res.status(500).send('Server error');
  }
});

app.put('/update-coffee-machine/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
      name,
      color,
      capacity,
      price
  } = req.body;
  
  try {
      // step 1: Check if the product exists
      const existingResult = await pool.query(
      `SELECT * FROM coffee_machines WHERE id = $1`,
      [id]
      );
  
      if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
      }
  
      const existing = existingResult.rows[0];
  
      // step 2: Check if any changes were made
      const noChange =
      existing.name === name &&
      (existing.color || '') === (color || '') &&
      existing.capacity === capacity &&
      Number(existing.price) === Number(price) &&
      !req.file; 
  
      if (noChange) {
      return res.status(200).json({ message: 'No changes detected, nothing was updated.' });
      }
  
      // step 3: Update the product
      let query = `
      UPDATE coffee_machines SET
          name = $1,
          color = $2,
          capacity = $3,
          price = $4
      `;
      const values = [
      name,
      color,
      capacity,
      price
      ];
  
      if (req.file) {
      query += `, image = $5 WHERE id = $6`;
      values.push(req.file.buffer, id);
      } else {
      query += ` WHERE id = $5`;
      values.push(id);
      }
  
      await pool.query(query, values);
  
      res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
      console.error('Failed to update product:', error);
      res.status(500).send('Server error');
  }
});

// app.get('/get-all-coffee-machines', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT id, name, color, capacity, price, image, sum_of FROM coffee_machines ');
    
  
//     const coffeeMachines = result.rows.map(p => ({
//       id: p.id,
//       name: p.name,
//       color: p.color,
//       capacity: p.capacity,
//       price: p.price,
//       sum_of: p.sum_of,
//       image: Buffer.from(p.image).toString('base64')
//     }));
//     res.json(coffeeMachines);
// } catch (err) {
//     console.error('Failed to fetch products', err);
//     res.status(500).send('Server error');
// }
// });

app.get('/get-all-coffee-machines', async (req, res) => {
  try {
    const currentDate = new Date();

    const [machinesResult, pricePeriodsResult] = await Promise.all([
      pool.query('SELECT id, name, color, capacity, price, image, sum_of FROM coffee_machines'),
      pool.query('SELECT start_date, end_date, percentage_change FROM price_periods')
    ]);

    const pricePeriods = pricePeriodsResult.rows;

    const coffeeMachines = machinesResult.rows.map(p => {
      const adjustedPrice = getAdjustedPrice(parseFloat(p.price), currentDate, pricePeriods);
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        capacity: p.capacity,
        price: adjustedPrice.toFixed(2), 
        sum_of: p.sum_of,
        image: Buffer.from(p.image).toString('base64')
      };
    });

    res.json(coffeeMachines);
  } catch (err) {
    console.error('Failed to fetch products', err);
    res.status(500).send('Server error');
  }
});


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

app.post('/add-capsule', upload.single('image'), async (req, res) => {
  try {

    const { name, flavor, quantity_per_package, net_weight_grams, price, ingredients } = req.body;
    const imageBuffer = req.file.buffer;

    await pool.query(
      `INSERT INTO capsules 
      (name, flavor, quantity_per_package, net_weight_grams, price, ingredients, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, flavor, quantity_per_package, net_weight_grams, price, ingredients, imageBuffer]
    );


    res.status(201).json({ message: "Capsule added successfully"});
  } catch (err) {
    console.error("Error inserting capsule:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/get-capsule/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query(
        `SELECT id, name, flavor, quantity_per_package, net_weight_grams, price, ingredients, image
        FROM capsules 
        WHERE id = $1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Capsule not found" });
      }
      const capsule = result.rows[0];
      const capsuleData = {
      id: capsule.id,
      name: capsule.name,
      flavor: capsule.flavor,
      quantity_per_package: capsule.quantity_per_package,
      net_weight_grams: capsule.net_weight_grams,
      price: capsule.price,
      ingredients: capsule.ingredients,
      image_url: `data:image/jpeg;base64,${Buffer.from(capsule.image).toString('base64')}`      };

      res.json(capsuleData);
    } catch (err) {
      console.error("Error fetching capsule:", err);
      res.status(500).json({ message: "Server error" });
    }
});

// app.get('/get-all-capsule', async (req, res) => {
//     try {
//       const result = await pool.query('SELECT id, name, flavor, quantity_per_package, net_weight_grams, price, ingredients, image, sum_of FROM capsules');
      
//         const capsules = result.rows.map(capsule => ({
//         id: capsule.id,
//         name: capsule.name,
//         flavor: capsule.flavor,
//         quantity_per_package: capsule.quantity_per_package,
//         net_weight_grams: capsule.net_weight_grams,
//         price: capsule.price,
//         ingredients: capsule.ingredients,
//         sum_of: capsule.sum_of,
//         image: Buffer.from(capsule.image).toString('base64')

//       }));
//       res.json(capsules);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//       res.status(500).send('Failed to fetch v');
//     }
// });

app.get('/get-all-capsule', async (req, res) => {
  try {
    const currentDate = new Date();

    const [capsuleResult, pricePeriodsResult] = await Promise.all([
      pool.query('SELECT id, name, flavor, quantity_per_package, net_weight_grams, price, ingredients, image, sum_of FROM capsules'),
      pool.query('SELECT start_date, end_date, percentage_change FROM price_periods')
    ]);

    const pricePeriods = pricePeriodsResult.rows;

    const capsules = capsuleResult.rows.map(capsule => {
      const adjustedPrice = getAdjustedPrice(parseFloat(capsule.price), currentDate, pricePeriods);
      return {
        id: capsule.id,
        name: capsule.name,
        flavor: capsule.flavor,
        quantity_per_package: capsule.quantity_per_package,
        net_weight_grams: capsule.net_weight_grams,
        price: adjustedPrice.toFixed(2),
        ingredients: capsule.ingredients,
        sum_of: capsule.sum_of,
        image: Buffer.from(capsule.image).toString('base64')
      };
    });

    res.json(capsules);
  } catch (err) {
    console.error('Error fetching capsules:', err);
    res.status(500).send('Failed to fetch capsules');
  }
});

app.put('/update-capsule/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, flavor, quantity_per_package, net_weight_grams, price, ingredients } = req.body;
    try {
      const existingResult = await pool.query(
        `SELECT * FROM capsules WHERE id = $1`,
        [id]
        );
    
        if (existingResult.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
        }
    
        const existing = existingResult.rows[0];
    
        // step 2: Check if any changes were made
        const noChange =
        existing.name === name &&
        (existing.flavor || '') === (flavor || '') &&
        existing.quantity_per_package === quantity_per_package &&
        existing.net_weight_grams === net_weight_grams &&
        Number(existing.price) === Number(price) &&
        existing.ingredients === ingredients &&
        !req.file; 
    
        if (noChange) {
        return res.status(200).json({ message: 'No changes detected, nothing was updated.' });
        }

        let query = `
          UPDATE capsules SET
          name = $1,
          flavor = $2,
          quantity_per_package = $3,
          net_weight_grams = $4,
          price = $5,
          ingredients = $6
      `;
      const values = [
      name,
      flavor,
      quantity_per_package,
      net_weight_grams,
      price,
      ingredients
      ];

  
      if (req.file) {
      query += `, image = $7 WHERE id = $8`;
      values.push(req.file.buffer, id);
      } else {
      query += ` WHERE id = $7`;
      values.push(id);
      }
  
      await pool.query(query, values);

      res.status(200).json({ message: 'capsule updated successfully' });

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
app.post('/add-milk-frother',upload.single('image'), async (req, res) => {
    try {
      const { name, color, frothing_type, capacity, price } = req.body;
      const imageBuffer = req.file.buffer;

  
      await pool.query(
        `INSERT INTO milk_frothers (name, color, frothing_type, capacity, price, image)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, color, frothing_type, capacity, price, imageBuffer]
      );
  
      res.status(201).json({ message: "Milk frother added successfully" });
    } catch (err) {
      console.error("Error inserting milk frother:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

app.get('/get-milk-frother/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query("SELECT id, name, color, frothing_type, capacity, price, image FROM milk_frothers WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Milk frother not found" });
      }

      const milk_frother = result.rows[0];
      const milk_frotherData = {
      id: milk_frother.id,
      name: milk_frother.name,
      color: milk_frother.color,
      frothing_type: milk_frother.frothing_type,
      capacity: milk_frother.capacity,
      price: milk_frother.price,
      image_url: `data:image/jpeg;base64,${Buffer.from(milk_frother.image).toString('base64')}`     
     };

      res.json(milk_frotherData);
    } catch (err) {
      console.error("Error fetching milk frother:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

// app.get('/get-all-milk-frothers', async (req, res) => {
//     try {
//       const result = await pool.query('SELECT id, name, color, frothing_type, capacity, price, image, sum_of FROM milk_frothers');

//       const milk_frothers = result.rows.map(milk_frother => ({
//         id: milk_frother.id,
//         name: milk_frother.name,
//         color: milk_frother.color,
//         frothing_type: milk_frother.frothing_type,
//         capacity: milk_frother.capacity,
//         price: milk_frother.price,
//         sum_of:milk_frother.sum_of,
//         image: Buffer.from(milk_frother.image).toString('base64')

//       }));
//       res.json(milk_frothers);
//     } catch (err) {
//       console.error('Error fetching milk frothers:', err);
//       res.status(500).send('Failed to fetch milk frothers');
//     }
//   });

app.get('/get-all-milk-frothers', async (req, res) => {
  try {
    const currentDate = new Date();

    const [milkResult, pricePeriodsResult] = await Promise.all([
      pool.query('SELECT id, name, color, frothing_type, capacity, price, image, sum_of FROM milk_frothers'),
      pool.query('SELECT start_date, end_date, percentage_change FROM price_periods')
    ]);

    const pricePeriods = pricePeriodsResult.rows;

    const milk_frothers = milkResult.rows.map(milk => {
      const adjustedPrice = getAdjustedPrice(parseFloat(milk.price), currentDate, pricePeriods);
      return {
        id: milk.id,
        name: milk.name,
        color: milk.color,
        frothing_type: milk.frothing_type,
        capacity: milk.capacity,
        price: adjustedPrice.toFixed(2),
        sum_of: milk.sum_of,
        image: Buffer.from(milk.image).toString('base64')
      };
    });

    res.json(milk_frothers);
  } catch (err) {
    console.error('Error fetching milk frothers:', err);
    res.status(500).send('Failed to fetch milk frothers');
  }
});

app.put('/update-milk-frother/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, color, frothing_type, capacity, price } = req.body;
    try {

      const existingResult = await pool.query(
        `SELECT * FROM milk_frothers WHERE id = $1`,
        [id]
        );
    
        if (existingResult.rows.length === 0) {
        return res.status(404).json({ message: 'milk_frother not found' });
        }
    
        const existing = existingResult.rows[0];
    
        // step 2: Check if any changes were made
        const noChange =
        existing.name === name &&
        (existing.color || '') === (color || '') &&
        existing.frothing_type === frothing_type &&
        existing.capacity === capacity &&
        Number(existing.price) === Number(price) &&
        !req.file; 
    
        if (noChange) {
        return res.status(200).json({ message: 'No changes detected, nothing was updated.' });
        }

        let query = `
        UPDATE milk_frothers SET
        name = $1,
        color = $2,
        frothing_type = $3,
        capacity = $4,
        price = $5
        `;
        const values = [
        name,
        color,
        frothing_type,
        capacity,
        price
        ];


        if (req.file) {
        query += `, image = $6 WHERE id = $7`;
        values.push(req.file.buffer, id);
        } else {
        query += ` WHERE id = $6`;
        values.push(id);
        }

      await pool.query(query, values);
      res.status(200).json({ message: 'milk_frother updated successfully' });
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


  
  //  Search across all products by name prefix
  app.get('/search-products', async (req, res) => {
    const { query } = req.query;
  
    if (!query) {
      return res.status(400).json({ error: 'Missing search term' });
    }
  
    try {
      const q = `%${query}%`;
  
      const result = await pool.query(`
        SELECT id, name, price, sum_of, image, 'coffee_machines' AS type
          FROM coffee_machines WHERE name ILIKE $1
        UNION ALL
        SELECT id, name, price, sum_of, image, 'capsules' AS type
          FROM capsules WHERE name ILIKE $1
        UNION ALL
        SELECT id, name, price, sum_of, image, 'milk_frothers' AS type
          FROM milk_frothers WHERE name ILIKE $1
      `, [q]);
  
      const products = result.rows.map(p => ({
        ...p,
        image: p.image ? Buffer.from(p.image).toString('base64') : null
      }));
  
      res.json(products);
    } catch (err) {
      console.error(' Error searching products:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  

  app.get('/capsules-by-popularity', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          c.id,
          c.name,
          c.flavor,
          c.quantity_per_package,
          c.net_weight_grams,
          c.price,
          c.ingredients,
          c.sum_of,
          c.image,
          COALESCE(SUM(op.quantity), 0) AS total_sold
        FROM capsules c
        LEFT JOIN ordered_products op 
          ON op.product_id = c.id AND op.product_type = 'capsules'
        GROUP BY c.id
        ORDER BY total_sold DESC
      `);
      const capsules = result.rows.map(p => ({
        ...p,
        image: p.image ? Buffer.from(p.image).toString('base64') : null
      }));
      res.json(capsules);
    } catch (err) {
      console.error('Error fetching capsules by popularity:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.get('/coffee-machines-by-popularity', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT c.*, 
               COALESCE(SUM(op.quantity), 0) AS total_sold
        FROM coffee_machines c
        LEFT JOIN ordered_products op
          ON c.id = op.product_id AND op.product_type = 'coffee_machines'
        GROUP BY c.id
        ORDER BY total_sold DESC;
      `);
  
      const machines = result.rows.map(p => ({
        ...p,
        image: p.image ? Buffer.from(p.image).toString('base64') : null
      }));
  
      res.json(machines);
    } catch (err) {
      console.error("Error fetching coffee machines by popularity:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  app.get('/milk-frothers-by-popularity', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT mf.*, 
               COALESCE(SUM(op.quantity), 0) AS total_sold
        FROM milk_frothers mf
        LEFT JOIN ordered_products op
          ON mf.id = op.product_id AND op.product_type = 'milk_frothers'
        GROUP BY mf.id
        ORDER BY total_sold DESC;
      `);
  
      const frothers = result.rows.map(p => ({
        ...p,
        image: p.image ? Buffer.from(p.image).toString('base64') : null
      }));
  
      res.json(frothers);
    } catch (err) {
      console.error("Error fetching milk frothers by popularity:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
function getAdjustedPrice(originalPrice, currentDate, pricePeriods) {
  console.log("Current Date:", currentDate);
  for (const period of pricePeriods) {
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);

    const currDate = new Date(currentDate);


    if (currDate.getDate() >= start.getDate() && currDate.getDate() <= end.getDate() &&
        currDate.getMonth() >= start.getMonth() && currDate.getMonth() <= end.getMonth() &&
        currDate.getFullYear() >= start.getFullYear() && currDate.getFullYear() <= end.getFullYear())
         {
      const percentage = period.percentage_change;
      return originalPrice + (originalPrice * (percentage / 100));
    }
  }
  return originalPrice;
}

  
export default app;