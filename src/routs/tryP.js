
import express from 'express';
import pool from '../data-access/db.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// serve static files
router.use(express.static('public'));

// Multer setup
const storage = multer.diskStorage({
  destination: 'public/images',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// POST: צור מכונה ותחזיר את ה-id
router.post('/coffee-machines', upload.single('image'), async (req, res) => {
  const { name, color, capacity, price } = req.body;
  const imagePath = `/images/${req.file.filename}`;
  try {
    const { rows } = await pool.query(
      `INSERT INTO coffee_machines
         (name, color, capacity, price, image_path)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id`,      // החזרת ה-id
      [name, color, capacity, price, imagePath]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error('Error inserting into database:', err);
    res.status(500).json({ error: 'Error adding coffee machine' });
  }
});

// GET: שלוף מכונה לפי id
router.get('/coffee-machines/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM coffee_machines WHERE id = $1',
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error querying database:', err);
    res.status(500).json({ error: 'Error fetching coffee machine' });
  }
});

export default router;



// import express from 'express';
// import pool from '../data-access/db.js'; 

// import multer from 'multer';
// import path from 'path';

// const app = express.Router();


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/images');  // תיקיית ה-upload
//   },
//   filename: (req, file, cb) => {
//     const fileName = `${Date.now()}-${file.originalname}`;
//     cb(null, fileName);  // שינוי שם הקובץ כדי למנוע התנגשויות
//   },
// });

// const upload = multer({ storage });

// app.use(express.json());
// app.use(express.static('public')); 
// app.post('/coffee-machines', upload.single('image'), async (req, res) => {
//   const { name, color, capacity, price } = req.body;
//   const imagePath = `/images/${req.file.filename}`;  
//   try {
//     const result = await pool.query(
//       'INSERT INTO coffee_machines (name, color, capacity, price, image_path) VALUES ($1, $2, $3, $4, $5)',
//       [name, color, capacity, price, imagePath]
//     );
//     res.status(201).send('Coffee machine added');
//   } catch (err) {
//     console.error('Error inserting into database:', err);
//     res.status(500).send('Error adding coffee machine');
//   }
// });



// export default app;