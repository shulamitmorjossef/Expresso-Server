import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`
            ALTER TABLE coupons
            ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

        `);

        console.log('Coupons table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing coupons table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    