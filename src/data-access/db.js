import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  ssl: {
    rejectUnauthorized: false // שים לב שזה נדרש כשאתה עובד עם שירותי ענן כמו Render
  }
});


pool.connect()
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch((err) => {
    console.error('Failed to connect to the database:1111111111111', err);
    console.error('Error code:22222222222222222', err.code);  // מציג את הקוד של השגיאה
    console.error('Error stack trace:3333333333333333333', err.stack);  // מציג את עקבות השגיאה
  });


export default pool;
