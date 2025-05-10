// src/routs/statistics.js
import express from 'express';
import pool from '../data-access/db.js';

const router = express.Router();

// GET /statistics/customers-count

router.get('/customers-count', async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing date range' });
  }
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Invalid date range' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT COUNT(DISTINCT user_id) AS customercount
      FROM orders
      WHERE order_date BETWEEN $1 AND $2
    `, [startDate, endDate]);

    const { customercount = 0 } = rows[0];
    res.json({ customerCount: Number(customercount) });
  } catch (err) {
    console.error('❌ Error fetching customer count', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/total-sold', async (req, res) => {
  const { startDate, endDate } = req.query;

  // (אופציונלי) בדיקת תוקף התאריכים
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing date range' });
  }
  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: 'Invalid date range' });
  }

  try {
    const result = await pool.query(
      `
      SELECT SUM(op.quantity) AS totalSold
      FROM orders o
      JOIN ordered_products op ON o.id = op.order_id
      WHERE o.order_date BETWEEN $1 AND $2
      `,
      [startDate, endDate]
    );

    // כאן המרה מהמחרוזת למספר
    const raw = result.rows[0].totalsold;               // Postgres מחזיר SUM כמחרוזת או null
    const total = raw !== null ? Number(raw) : 0;       // אם null → 0, אחרת המרה ל-number

    console.log('Result rows[0]:', result.rows[0], 'parsed totalSold:', total);
    res.json({ totalSold: total });

  } catch (err) {
    console.error('Error querying total sold:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});




export default router;
