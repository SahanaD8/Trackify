const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixDatabaseSchema() {
    try {
        console.log('🔄 Fixing database schema to match application requirements...\n');

        // 1. Add purpose column to staff_entry_logs if missing
        console.log('1️⃣ Checking staff_entry_logs table...');
        const checkPurpose = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'staff_entry_logs' AND column_name = 'purpose'
        `);
        
        if (checkPurpose.rows.length === 0) {
            await pool.query('ALTER TABLE staff_entry_logs ADD COLUMN purpose TEXT');
            console.log('   ✅ Added "purpose" column to staff_entry_logs');
        } else {
            console.log('   ✅ "purpose" column already exists');
        }

        // 2. Rename phone to phone_number in staff table if needed
        console.log('\n2️⃣ Checking staff table...');
        const checkStaffPhone = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'phone'
        `);
        
        const checkStaffPhoneNumber = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'phone_number'
        `);

        if (checkStaffPhone.rows.length > 0 && checkStaffPhoneNumber.rows.length === 0) {
            await pool.query('ALTER TABLE staff RENAME COLUMN phone TO phone_number');
            console.log('   ✅ Renamed "phone" to "phone_number" in staff table');
        } else if (checkStaffPhoneNumber.rows.length > 0) {
            console.log('   ✅ "phone_number" column already exists');
        }

        // 3. Rename phone to phone_number in visitors table if needed
        console.log('\n3️⃣ Checking visitors table...');
        const checkVisitorPhone = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'visitors' AND column_name = 'phone'
        `);
        
        const checkVisitorPhoneNumber = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'visitors' AND column_name = 'phone_number'
        `);

        if (checkVisitorPhone.rows.length > 0 && checkVisitorPhoneNumber.rows.length === 0) {
            await pool.query('ALTER TABLE visitors RENAME COLUMN phone TO phone_number');
            console.log('   ✅ Renamed "phone" to "phone_number" in visitors table');
        } else if (checkVisitorPhoneNumber.rows.length > 0) {
            console.log('   ✅ "phone_number" column already exists');
        }

        // 4. Add place column to visitors table if missing
        console.log('\n4️⃣ Checking for "place" column in visitors table...');
        const checkPlace = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'visitors' AND column_name = 'place'
        `);
        
        if (checkPlace.rows.length === 0) {
            await pool.query('ALTER TABLE visitors ADD COLUMN place VARCHAR(255)');
            console.log('   ✅ Added "place" column to visitors table');
        } else {
            console.log('   ✅ "place" column already exists');
        }

        // Show final structure
        console.log('\n📋 Final Table Structures:\n');
        
        console.log('STAFF TABLE:');
        const staffStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'staff'
            ORDER BY ordinal_position
        `);
        console.table(staffStructure.rows);

        console.log('\nVISITORS TABLE:');
        const visitorsStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'visitors'
            ORDER BY ordinal_position
        `);
        console.table(visitorsStructure.rows);

        console.log('\nSTAFF_ENTRY_LOGS TABLE:');
        const logsStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'staff_entry_logs'
            ORDER BY ordinal_position
        `);
        console.table(logsStructure.rows);

        console.log('\n✅ Database schema migration completed successfully!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error during migration:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

fixDatabaseSchema();
