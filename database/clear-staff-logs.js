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

        console.log('\n✅ All staff logs cleared successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

clearStaffLogs();
