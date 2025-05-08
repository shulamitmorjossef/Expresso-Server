import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`

          DROP TABLE IF EXISTS coupons;

            CREATE TABLE coupons (
            codename TEXT PRIMARY KEY,
            discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 1 AND 99)
            );


        `);

        console.log('Capsules table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing capsules table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    