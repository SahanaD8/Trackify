const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://trackify_db_8mte_user:iD0GF1YJIcvnAJ6eBqHWe6Yy0mQELKBZ@dpg-ct1tn5pu0jms73ba8d20-a.singapore-postgres.render.com/trackify_db_8mte',
  ssl: { rejectUnauthorized: false }
});

async function addTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Adding test visitor...');
    // Add a test visitor for today
    const visitorResult = await client.query(`
      INSERT INTO visitors (name, phone_number, email, purpose, whom_to_meet, place, status, created_at, check_in_time)
      VALUES ('Test Visitor', '9999999999', 'test@example.com', 'Testing', 'Principal', 'Bangalore', 'accepted', NOW(), NOW())
      RETURNING id, name, created_at
    `);
    console.log('✅ Added visitor:', visitorResult.rows[0]);

    console.log('\nAdding test staff entry...');
    // Add a test staff entry for existing staff (9964504954)
    const staffCheck = await client.query(`SELECT id, name FROM staff WHERE phone_number = '9964504954'`);
    if (staffCheck.rows.length > 0) {
      const staffId = staffCheck.rows[0].id;
      const staffName = staffCheck.rows[0].name;
      
      const entryResult = await client.query(`
        INSERT INTO staff_entry_logs (staff_id, purpose, entry_time)
        VALUES ($1, 'Testing system', NOW())
        RETURNING id, entry_time
      `, [staffId]);
      console.log(`✅ Added staff entry for ${staffName}:`, entryResult.rows[0]);
    } else {
      console.log('⚠️ Staff with phone 9964504954 not found');
    }

    await client.query('COMMIT');
    console.log('\n✅ Test data added successfully! Refresh the security dashboard to see the data.');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addTestData();
