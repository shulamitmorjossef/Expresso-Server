import express from 'express';
import pool from './data-access/db.js'; 


const app = express();
const port = 3000;


app.get('/', (req, res) => {
  res.send('Hello Shulamit!')
})


app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`✅ DB connected! Current time from DB: ${result.rows[0].now}`);
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).send('❌ Failed to connect to DB');
  }
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
