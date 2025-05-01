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
const createTermsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS terms (
        id SERIAL PRIMARY KEY,
        title TEXT,
        section1 TEXT,
        section2 TEXT,
        section3 TEXT,
        section4 TEXT,
        section5 TEXT
      );
    `);
    console.log("✅ Table 'terms' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating terms table:", err);
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
const createCapsulesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS capsules (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        flavor TEXT NOT NULL,
        quantity_per_package INTEGER NOT NULL,
        net_weight_grams NUMERIC(10, 2),
        price NUMERIC(10, 2),
        image_path TEXT
      );
    `);
    console.log("✅ Table 'capsules' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating capsules table:", err);
    throw err;
  }
};
const createMilkFrothersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS milk_frothers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        frothing_type TEXT,
        capacity INTEGER,
        price NUMERIC(10, 2),
        image_path TEXT
      );
    `);
    console.log("✅ Table 'milk_frothers' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating milk_frothers table:", err);
    throw err;
  }
};
const createIngredientsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    console.log("✅ Table 'ingredients' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating ingredients table:", err);
    throw err;
  }
};
const createCouponsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        codename TEXT PRIMARY KEY,
        discount_percent NUMERIC(5, 2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100)
      );
    `);
    console.log("✅ Table 'coupons' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating coupons table:", err);
    throw err;
  }
};
const createDeliveryDatesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_dates (
        day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
        PRIMARY KEY (day, month, year)
      );
    `);
    console.log("✅ Table 'delivery_dates' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating delivery_dates table:", err);
    throw err;
  }
};
const createOrdersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
        status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
        order_date DATE NOT NULL
      );
    `);
    console.log("✅ Table 'orders' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating orders table:", err);
    throw err;
  }
};
const createOrderedProductsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ordered_products (
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        PRIMARY KEY (order_id, product_id)
      );
    `);
    console.log("✅ Table 'ordered_products' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating ordered_products table:", err);
    throw err;
  }
};
const createShoppingCartTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopping_cart (
        user_id INTEGER NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        PRIMARY KEY (user_id, product_id)
      );
    `);
    console.log("✅ Table 'shopping_cart' created or already exists.");
  } catch (err) {
    console.error("❌ Error creating shopping_cart table:", err);
    throw err;
  }
};


const initAllTables = async () => {
  try {
    await createUsersTable();
    await createAboutTable();
    await createCoffeeMachinesTable();
    await createTermsTable();
    await createCapsulesTable();
    await createMilkFrothersTable();
    await createIngredientsTable();
    await createCouponsTable();
    await createDeliveryDatesTable();
    await createOrdersTable();
    await createOrderedProductsTable();
    await createShoppingCartTable();
    // await createRUsersTable();
    console.log("✅ All tables initialized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
    process.exit(1);
  }
};

initAllTables();
