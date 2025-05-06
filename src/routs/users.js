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
  
      if (userType === 'manager') {
        const SECRET_MANAGER_CODE = 'ASSSSAY8'; 
        if (managerCode !== SECRET_MANAGER_CODE) {
          return res.status(403).json({ message: 'wrong code' });
        }
      }
      const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const phoneCheck = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
      const usernameCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Existing email' });
      }
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Existing phone number' });
      }
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Existing username' });
      }
  
      const result = await pool.query(
        `INSERT INTO users (full_name, username, email, phone, birthday, password, user_type, manager_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [fullName, username, email, phone, birthday, password, userType, managerCode]
      );
  
      res.status(201).json({ message: `username ${result.rows[0].username} register successfully!` });
    } catch (err) {
      console.error('Error', err);
      res.status(500).send({ message: "Error" });
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
        `INSERT INTO users (full_name, username, email, phone, birthday, password, user_type, manager_code)
         VALUES ($1, $2, $3, $4, $5, $6, $8) RETURNING *`,
        [fullName, username, email, phone, birthday, password, userType, managerCode]
      );
  
      res.status(201).json({ message: `👤 user ${result.rows[0].username} successfully added!` });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send({ message: "Error" });
    }
  });
  
// login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ message: 'Missing username or password' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND password = $2',
        [username, password]
      );  
      if (result.rows.length > 0) {


        const user = result.rows[0];
        res.status(200).send({
        message: 'Login successful',
        user_type: user.user_type,
        user: {
          username: user.username,
          full_name: user.full_name,
          email: user.email
        }
      });
      } else {
        res.status(401).send({ message: 'Invalid username or password' });
      }
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).send({ message: 'Failed to login' });
    }
  });



  
app.post('/delete-user', async (req, res) => {
    try {
      const { username } = req.body;
  
      const result = await pool.query(
        `DELETE FROM users WHERE username = $1 RETURNING *`,
        [username]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "unknown user" });
      }
  
      res.status(200).json({ message: `🗑️ user ${result.rows[0].username} delete successfully` });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send({ message: "Error" });
    }
});
  
  

export default app;