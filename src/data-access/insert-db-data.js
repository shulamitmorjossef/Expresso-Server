import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`

          ALTER TABLE capsules
          DROP COLUMN image_path;

          ALTER TABLE coffee_machines
          DROP COLUMN image_path;

          ALTER TABLE milk_frothers
          DROP COLUMN image_path;




        `);

        console.log('Capsules table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing capsules table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    