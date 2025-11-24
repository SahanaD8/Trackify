// Check staff_entry_logs table structure
const { Client } = require('pg');

const connectionString = 'postgresql://trackify_user:MuZ8ggwdHn6vhcB1PfKPdhUhOXGgs37V@dpg-d4g4qd8gjchc73dpv16g-a.singapore-postgres.render.com/trackify_db_8mte';

async function checkTable() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check table structure
        const result = await client.query(`
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'staff_entry_logs'
            ORDER BY ordinal_position;
        `);

        console.log('=== staff_entry_logs Table Structure ===\n');
        result.rows.forEach(col => {
            console.log(`Column: ${col.column_name}`);
            console.log(`  Type: ${col.data_type}`);
            console.log(`  Default: ${col.column_default || 'NULL'}`);
            console.log(`  Nullable: ${col.is_nullable}`);
            console.log('');
        });

        // Check if entry_time has a default timestamp
        const entryTimeCol = result.rows.find(r => r.column_name === 'entry_time');
        if (entryTimeCol && entryTimeCol.column_default) {
            console.log('⚠️ PROBLEM FOUND: entry_time has a DEFAULT value!');
            console.log(`   Default: ${entryTimeCol.column_default}`);
            console.log('\n💡 Fixing: Removing DEFAULT from entry_time column...\n');
            
            await client.query(`
                ALTER TABLE staff_entry_logs 
                ALTER COLUMN entry_time DROP DEFAULT;
            `);
            
            console.log('✅ Fixed! entry_time no longer has a default value.');
        } else {
            console.log('✅ entry_time column is correctly configured (no default).');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkTable();
