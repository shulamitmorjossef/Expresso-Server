import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`

<<<<<<< HEAD
          ALTER TABLE capsules
          DROP COLUMN image_path;

          ALTER TABLE coffee_machines
          DROP COLUMN image_path;

          ALTER TABLE milk_frothers
          DROP COLUMN image_path;


=======
          ALTER TABLE coffee_machines ADD COLUMN image BYTEA NOT NULL DEFAULT '';
          ALTER TABLE milk_frothers ADD COLUMN image BYTEA NOT NULL DEFAULT '';
          ALTER TABLE capsules ADD COLUMN image BYTEA NOT NULL DEFAULT '';
>>>>>>> 083abf690250172a4816648d4b37826946e4bb2f


        `);

        console.log('Capsules table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing capsules table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    