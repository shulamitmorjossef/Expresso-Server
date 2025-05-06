import pool from './db.js';
const editUsersTable = async () => {
    try {

        await pool.query(`
            ALTER TABLE users
            DROP COLUMN IF EXISTS unique_code,
            DROP COLUMN IF EXISTS created_at;
        `);

        console.log('Users editing successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error editing users:', error);
        process.exit(1);
    }
};
    
editUsersTable();
    