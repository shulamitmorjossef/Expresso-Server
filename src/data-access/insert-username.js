import pool from '../data-access/db.js';

async function addUsernameColumn() {
    console.log("Starting column addition...");
  try {
    await pool.query('ALTER TABLE reviews ADD COLUMN username TEXT');
    console.log("Column 'username' added successfully to reviews table.");
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    pool.end();
  }
}

addUsernameColumn();
