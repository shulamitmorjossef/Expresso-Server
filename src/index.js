import express from 'express';
import cors from 'cors';
import pool from './data-access/db.js';
import aboutRoute from './routes/aboutRoute.js'; // אם קיים, תשאירי. אם אין, אפשר למחוק את השורה הזו.

const app = express();
const port = process.env.PORT || 3000; // הגדרת פורט ברירת מחדל

app.use(express.json());
app.use(cors());
// אם יש לך router כמו aboutRoute תשאירי, אם לא - תורידי
if (aboutRoute) app.use(aboutRoute);

// ברירת מחדל
app.get('/', (req, res) => {
  res.send('Hello Shulamit!');
});

// בדיקת חיבור למסד הנתונים
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`✅ DB connected! Current time from DB: ${result.rows[0].now}`);
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).send('❌ Failed to connect to DB');
  }
});

// יצירת משתמש חדש
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

// שליפת כל המשתמשים
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).send('❌ Failed to fetch users');
  }
});


// נקודת קצה להתחברות (LOGIN) עם לוג לטרמינל
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // הוספת לוג - תראי בטרמינל אם הקריאה מגיעה ומה התקבל
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
    } else {
      res.status(401).send({ message: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('❌ Error during login:', err);
    res.status(500).send({ message: '❌ Failed to login' });
  }
});

// בדיקת תקשורת (פינג)
app.get('/ping', (req, res) => {
  console.log('Received ping request');
  res.send('pong 8');
  console.log('Sent pong response');
});

// מאזין לשרת
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
