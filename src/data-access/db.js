import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  ssl: {
    rejectUnauthorized: false 
  }
});


pool.connect()
  .then(() => {
    console.log('Connected to the database successfully!');
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    console.error('Error code:', err.code);  
    console.error('Error stack trace:', err.stack); 
  });


export default pool;
