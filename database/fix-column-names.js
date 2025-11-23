const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

console.log('🔄 Updating database schema to match code...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateSchema() {
    try {
        // Rename phone column to phone_number in staff table
        console.log('📋 Renaming staff.phone to staff.phone_number...');
        await pool.query('ALTER TABLE staff RENAME COLUMN phone TO phone_number');
        
        // Rename phone column to phone_number in visitors table
        console.log('📋 Renaming visitors.phone to visitors.phone_number...');
        await pool.query('ALTER TABLE visitors RENAME COLUMN phone TO phone_number');
        
        console.log('✅ Database schema updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
        process.exit(1);
    }
}

updateSchema();
