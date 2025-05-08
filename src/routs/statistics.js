// src/routs/statistics.js
import express from 'express';
import pool from '../data-access/db.js';

const router = express.Router();

// GET /statistics/customers-count

router.get('/statistics/customers-count', async (req, res) => {
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




export default router;
