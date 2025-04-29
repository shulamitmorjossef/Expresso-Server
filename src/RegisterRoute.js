import express from 'express';
import pool from './data-access/db.js'; // חיבור למסד הנתונים

const router = express.Router();

// ✅ נתיב להרשמת משתמש חדש
router.post('/register', async (req, res) => {
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

// ✅ נתיב לבדוק אם אימייל קיים כבר
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error('❌ שגיאה בבדיקת אימייל:', err);
    res.status(500).send({ message: "❌ שגיאה בבדיקת אימייל" });
  }
});

// ✅ נתיב לבדוק אם טלפון קיים כבר
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error('❌ שגיאה בבדיקת טלפון:', err);
    res.status(500).send({ message: "❌ שגיאה בבדיקת טלפון" });
  }
});

// ✅ נתיב לקבלת כל המשתמשים
router.get('/rusers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM users');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('❌ שגיאה בקבלת כל המשתמשים:', err);
      res.status(500).send({ message: "❌ שגיאה בקבלת נתוני משתמשים" });
    }
  });
  
// ✅ נתיב להוספת משתמש ללא בדיקות
router.post('/add-user', async (req, res) => {
    try {
      const { fullName, username, email, phone, birthday, password, userType, uniqueCode, managerCode } = req.body;
  
      const result = await pool.query(
        `INSERT INTO rusers (full_name, username, email, phone, birthday, password, user_type, unique_code, manager_code, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
        [fullName, username, email, phone, birthday, password, userType, uniqueCode, managerCode]
      );
  
      res.status(201).json({ message: `👤 משתמש ${result.rows[0].username} נוסף בהצלחה!` });
    } catch (err) {
      console.error('❌ שגיאה בהוספת משתמש:', err);
      res.status(500).send({ message: "❌ שגיאה בהוספת משתמש" });
    }
  });
  


export default router;