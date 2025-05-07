import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`
            ALTER TABLE capsules
            ADD COLUMN IF NOT EXISTS ingredients TEXT;
        `);

        console.log('Capsules table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing capsules table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    