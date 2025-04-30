import pool from './data-access/db.js';


const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone VARCHAR (20),
        birthday DATE,
        password TEXT NOT NULL,
        user_type TEXT,
        unique_code TEXT,
        manager_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

const createCoffeeMachinesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coffee_machines (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        capacity INTEGER,
        price NUMERIC(10, 2),
        image_path TEXT
      );
    `);
    console.log("✅ Table 'coffee_machines' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating coffee_machines table:", err);
    throw err;
  }
};

const initAllTables = async () => {
  try {
    await createUsersTable();
    await createAboutTable();
    await createCoffeeMachinesTable();
    // await createRUsersTable();
    console.log("✅ All tables initialized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
    process.exit(1);
  }
};

initAllTables();
