import pool from './db.js';

const editCapsulesTable = async () => {
    try {
        await pool.query(`

           ALTER TABLE shopping_cart DROP CONSTRAINT fk_coffee_machines;
           ALTER TABLE shopping_cart DROP CONSTRAINT fk_milk_frothers;
           ALTER TABLE shopping_cart DROP CONSTRAINT fk_capsules;


        `);

        console.log('Capsules table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing capsules table:', error);
        process.exit(1);
    }
};

editCapsulesTable();
    