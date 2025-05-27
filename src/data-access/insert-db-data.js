import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`
           CREATE TABLE price_periods (
            id SERIAL PRIMARY KEY,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            percentage_change FLOAT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

        `);

        console.log('Coupons table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing coupons table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    