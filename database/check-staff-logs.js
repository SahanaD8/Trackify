const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkStaffLogs() {
    try {
        console.log('📋 Checking staff entry logs...\n');
        
        const result = await pool.query(`
            SELECT 
                sel.id,
                s.name as staff_name,
                s.phone_number,
                sel.entry_time,
                sel.exit_time,
                sel.purpose,
                CASE 
                    WHEN sel.exit_time IS NULL THEN 'INSIDE'
                    ELSE 'OUTSIDE'
                END as current_status
            FROM staff_entry_logs sel
            JOIN staff s ON sel.staff_id = s.id
            ORDER BY sel.entry_time DESC
        `);
        
        if (result.rows.length === 0) {
            console.log('✅ No staff entry logs found. All staff are outside.');
        } else {
            console.log('📊 Staff Entry Logs:');
            console.table(result.rows);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkStaffLogs();
