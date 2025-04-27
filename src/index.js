import express from 'express';
import cors from 'cors';
import pool from './data-access/db.js';

const app = express();
const port = process.env.PORT || 3000; 

app.use(express.json());

// app.use(cors());

app.use(cors({
  origin: 'https://expresso-client.onrender.com',
  credentials: true
}));



app.get('/', (req, res) => {
  res.send('Hello Shulamit!');
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


app.post('/users', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("❌ Missing username or password");
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, password]
    );
    res.status(201).send(`✅ User created: ${result.rows[0].username}`);
  } catch (err) {
    console.error('❌ Error inserting user:', err);
    res.status(500).send("❌ Failed to create user");
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




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export { app };

