const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

console.log('🔄 Adding approved_at column to visitors table...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addApprovedAtColumn() {
    try {
        await pool.query('ALTER TABLE visitors ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP');
        console.log('✅ approved_at column added successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addApprovedAtColumn();
