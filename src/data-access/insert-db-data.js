import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`

          ALTER TABLE coffee_machines ADD COLUMN image BYTEA NOT NULL DEFAULT '';
          ALTER TABLE milk_frothers ADD COLUMN image BYTEA NOT NULL DEFAULT '';
          ALTER TABLE capsules ADD COLUMN image BYTEA NOT NULL DEFAULT '';


        `);

        console.log('Capsules table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing capsules table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    