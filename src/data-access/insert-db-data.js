import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`

            ALTER TABLE coffee_machines
            ADD COLUMN IF NOT EXISTS sum_of INTEGER DEFAULT 0;

            ALTER TABLE milk_frothers
            ADD COLUMN IF NOT EXISTS sum_of INTEGER DEFAULT 0;

            ALTER TABLE capsules
            ADD COLUMN IF NOT EXISTS sum_of INTEGER DEFAULT 0;
        `);

        console.log('Capsules table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing capsules table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    