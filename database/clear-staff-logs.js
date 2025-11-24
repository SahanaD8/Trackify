// Script to clear staff entry logs for fresh testing
const { Client } = require('pg');

// Use your Render PostgreSQL connection string
const connectionString = 'postgresql://trackify_user:MuZ8ggwdHn6vhcB1PfKPdhUhOXGgs37V@dpg-d4g4qd8gjchc73dpv16g-a.singapore-postgres.render.com/trackify_db_8mte';

async function clearStaffLogs() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Delete all staff entry logs
        const result = await client.query('DELETE FROM staff_entry_logs');
        console.log(`✅ Deleted ${result.rowCount} staff entry logs`);

        console.log('\n✅ Database cleared! You can now test with fresh data.');
        console.log('\nTest the new flow:');
        console.log('1. Staff scans QR → Goes OUT (records exit_time + purpose)');
        console.log('2. Staff scans QR → Comes IN (records entry_time in same row)');
        console.log('3. Check dashboard → Out Time and In Time should be different!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

clearStaffLogs();
