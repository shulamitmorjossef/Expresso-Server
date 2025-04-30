import pool from './data-access/db.js';

const insertTermsData = async () => {
  try {
    // שלב 1: יצירת הטבלה אם לא קיימת
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

    // שלב 2: הכנסת תוכן
    await pool.query(`
      INSERT INTO terms (title, section1, section2, section3, section4, section5)
      VALUES (
        'Terms and Conditions',
        'Welcome to Expresso! These terms and conditions govern your use of our coffee capsule and machine sales platform.',
        'Products are for personal use only. Prices and availability may change without notice.',
        'By placing an order, you agree to provide accurate information and comply with our policies.',
        'We are not responsible for delays or issues caused by external factors such as shipping services.',
        'Thank you for choosing Expresso! We are committed to providing an excellent experience.'
      );
    `);

    console.log('✅ Terms content inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting terms content:', error);
    process.exit(1);
  }
};

insertTermsData();
