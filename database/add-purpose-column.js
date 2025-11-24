const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addPurposeColumn() {
    try {
        console.log('🔄 Adding purpose column to staff_entry_logs table...\n');

        // Check if column already exists
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'staff_entry_logs' 
            AND column_name = 'purpose'
        `;
        
        const checkResult = await pool.query(checkQuery);
        
        if (checkResult.rows.length > 0) {
            console.log('✅ Column "purpose" already exists in staff_entry_logs table.');
        } else {
            // Add the column
            await pool.query(`
                ALTER TABLE staff_entry_logs 
                ADD COLUMN purpose TEXT
            `);
            console.log('✅ Column "purpose" added successfully to staff_entry_logs table!');
        }
        
        console.log('\n📋 Updated table structure:');
        const structureQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'staff_entry_logs'
            ORDER BY ordinal_position
        `;
        const structure = await pool.query(structureQuery);
        console.table(structure.rows);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addPurposeColumn();
