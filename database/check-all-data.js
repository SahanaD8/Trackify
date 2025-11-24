const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://trackify_db_8mte_user:iD0GF1YJIcvnAJ6eBqHWe6Yy0mQELKBZ@dpg-ct1tn5pu0jms73ba8d20-a.singapore-postgres.render.com/trackify_db_8mte',
  ssl: { rejectUnauthorized: false }
});

async function checkAllData() {
  try {
    console.log('=== STAFF TABLE ===');
    const staff = await pool.query('SELECT id, name, phone_number, department FROM staff ORDER BY id');
    console.log('Total staff:', staff.rows.length);
    staff.rows.forEach(s => console.log(JSON.stringify(s)));

    console.log('\n=== RECEPTIONIST CREDENTIALS ===');
    const recep = await pool.query('SELECT id, phone_number, password FROM receptionist_credentials ORDER BY id');
    console.log('Total receptionist:', recep.rows.length);
    recep.rows.forEach(r => console.log(JSON.stringify(r)));

    console.log('\n=== SECURITY CREDENTIALS ===');
    const sec = await pool.query('SELECT id, phone_number, password FROM security_credentials ORDER BY id');
    console.log('Total security:', sec.rows.length);
    sec.rows.forEach(s => console.log(JSON.stringify(s)));

    console.log('\n=== PRINCIPAL CREDENTIALS ===');
    const prin = await pool.query('SELECT id, phone_number, password FROM principal_credentials ORDER BY id');
    console.log('Total principal:', prin.rows.length);
    prin.rows.forEach(p => console.log(JSON.stringify(p)));

    console.log('\n=== STAFF ENTRY LOGS ===');
    const entry = await pool.query('SELECT id, staff_id, entry_time FROM staff_entry_logs ORDER BY entry_time DESC LIMIT 5');
    console.log('Total entry logs:', entry.rows.length);
    entry.rows.forEach(e => console.log(JSON.stringify(e)));

    console.log('\n=== STAFF EXIT LOGS ===');
    const exit = await pool.query('SELECT id, staff_id, exit_time FROM staff_exit_logs ORDER BY exit_time DESC LIMIT 5');
    console.log('Total exit logs:', exit.rows.length);
    exit.rows.forEach(e => console.log(JSON.stringify(e)));

    console.log('\n=== VISITORS TABLE ===');
    const visitors = await pool.query('SELECT id, name, phone_number, purpose, status FROM visitors ORDER BY created_at DESC LIMIT 5');
    console.log('Total recent visitors:', visitors.rows.length);
    visitors.rows.forEach(v => console.log(JSON.stringify(v)));

    await pool.end();
    console.log('\nCheck completed successfully!');
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkAllData();
