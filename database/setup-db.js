const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Read the DATABASE_URL from Render environment or use the connection string
const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

console.log('🔄 Connecting to Render PostgreSQL database...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Read the schema file
const schemaPath = path.join(__dirname, 'postgresql-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function setupDatabase() {
    try {
        console.log('📋 Executing schema...');
        await pool.query(schema);
        console.log('✅ Database setup completed successfully!');
        console.log('   - All tables created');
        console.log('   - Default staff members added');
        console.log('   - Admin credentials created');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    }
}

setupDatabase();
