import pool from './data-access/db.js';

const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
    console.log("✅ Table 'users' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating users table:", err);
    throw err;
  }
  
};

const createAboutTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS about (
        id SERIAL PRIMARY KEY,
        title TEXT,
        section1 TEXT,
        section2 TEXT,
        section3 TEXT,
        section4 TEXT,
        section5 TEXT
      );
    `);
    console.log("✅ Table 'about' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating about table:", err);
    throw err;
  }
};

const initAllTables = async () => {
  try {
    await createUsersTable();
    await createAboutTable();
    console.log("✅ All tables initialized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
    process.exit(1);
  }
};

initAllTables();
