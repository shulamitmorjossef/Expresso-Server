import express from 'express';
import pool from '../data-access/db.js'; 

const app = express.Router();

// Get data
app.get('/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      res.status(500).send('❌ Failed to fetch users');
    }
  });


// Registration
app.post('/register', async (req, res) => {
    try {
      const { fullName, username, email, phone, birthday, password, userType, uniqueCode, managerCode } = req.body;
  
      // בדיקות כפילויות
      const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const phoneCheck = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
      const usernameCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'האימייל כבר קיים במערכת' });
      }
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({ message: 'הטלפון כבר קיים במערכת' });
      }
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ message: 'שם המשתמש כבר קיים במערכת' });
      }
  
      // הכנסת המשתמש למסד הנתונים
      const result = await pool.query(
        `INSERT INTO users (full_name, username, email, phone, birthday, password, user_type, unique_code, manager_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
        [fullName, username, email, phone, birthday, password, userType, uniqueCode, managerCode]
      );
  
      res.status(201).json({ message: `המשתמש ${result.rows[0].username} נרשם בהצלחה!` });
    } catch (err) {
      console.error('❌ שגיאה בהרשמת משתמש:', err);
      res.status(500).send({ message: "❌ תקלה ביצירת משתמש, נסה שוב מאוחר יותר" });
    }
  });
  
app.post('/check-email', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      res.json({ exists: result.rows.length > 0 });
    } catch (err) {
      console.error('❌ שגיאה בבדיקת אימייל:', err);
      res.status(500).send({ message: "❌ שגיאה בבדיקת אימייל" });
    }
  });
  
app.post('/check-phone', async (req, res) => {
    try {
      const { phone } = req.body;
      const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
      res.json({ exists: result.rows.length > 0 });
    } catch (err) {
      console.error('❌ שגיאה בבדיקת טלפון:', err);
      res.status(500).send({ message: "❌ שגיאה בבדיקת טלפון" });
    }
  });
  
app.post('/add-user', async (req, res) => {
    try {
      const { fullName, username, email, phone, birthday, password, userType, uniqueCode, managerCode } = req.body;
  
      const result = await pool.query(
        `INSERT INTO users (full_name, username, email, phone, birthday, password, user_type, unique_code, manager_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
        [fullName, username, email, phone, birthday, password, userType, uniqueCode, managerCode]
      );
  
      res.status(201).json({ message: `👤 משתמש ${result.rows[0].username} נוסף בהצלחה!` });
    } catch (err) {
      console.error('❌ שגיאה בהוספת משתמש:', err);
      res.status(500).send({ message: "❌ שגיאה בהוספת משתמש" });
    }
  });
  

// login
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

export default app;