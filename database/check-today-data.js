const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://trackify_db_8mte_user:iD0GF1YJIcvnAJ6eBqHWe6Yy0mQELKBZ@dpg-ct1tn5pu0jms73ba8d20-a.singapore-postgres.render.com/trackify_db_8mte',
  ssl: { rejectUnauthorized: false }
});

async function checkTodayData() {
  try {
    console.log('=== CHECKING DATA FOR TODAY (2025-11-23) ===\n');

    // Check visitors
    console.log('--- VISITORS TABLE ---');
    const visitorsQuery = `
      SELECT id, name, phone_number, purpose, status, 
             check_in_time, check_out_time, created_at
      FROM visitors
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const [visitors] = await pool.query(visitorsQuery);
    console.log(`Total recent visitors: ${visitors.length}`);
    if (visitors.length > 0) {
      visitors.forEach(v => {
        console.log(`  - ID: ${v.id}, Name: ${v.name}, Phone: ${v.phone_number}`);
        console.log(`    Status: ${v.status}, Created: ${v.created_at}`);
        console.log(`    Check-in: ${v.check_in_time}, Check-out: ${v.check_out_time}`);
      });
    } else {
      console.log('  No visitors found in database');
    }

    // Check visitors for today
    console.log('\n--- VISITORS TODAY (WHERE DATE(created_at) = CURDATE()) ---');
    const todayVisitorsQuery = `
      SELECT COUNT(*) as count
      FROM visitors
      WHERE DATE(created_at) = CURDATE()
    `;
    const [todayVisitors] = await pool.query(todayVisitorsQuery);
    console.log(`Visitors today: ${todayVisitors[0].count}`);

    // Check staff
    console.log('\n--- STAFF TABLE ---');
    const staffQuery = `SELECT id, name, phone_number, department FROM staff`;
    const [staff] = await pool.query(staffQuery);
    console.log(`Total staff: ${staff.length}`);
    staff.forEach(s => {
      console.log(`  - ID: ${s.id}, Name: ${s.name}, Phone: ${s.phone_number}, Dept: ${s.department}`);
    });

    // Check staff entry logs
    console.log('\n--- STAFF ENTRY LOGS ---');
    const entryQuery = `
      SELECT sel.id, sel.staff_id, s.name, sel.entry_time, sel.purpose
      FROM staff_entry_logs sel
      JOIN staff s ON sel.staff_id = s.id
      ORDER BY sel.entry_time DESC
      LIMIT 10
    `;
    const [entries] = await pool.query(entryQuery);
    console.log(`Total recent entries: ${entries.length}`);
    entries.forEach(e => {
      console.log(`  - Staff: ${e.name}, Time: ${e.entry_time}, Purpose: ${e.purpose}`);
    });

    // Check staff exit logs
    console.log('\n--- STAFF EXIT LOGS ---');
    const exitQuery = `
      SELECT sxl.id, sxl.staff_id, s.name, sxl.exit_time
      FROM staff_exit_logs sxl
      JOIN staff s ON sxl.staff_id = s.id
      ORDER BY sxl.exit_time DESC
      LIMIT 10
    `;
    const [exits] = await pool.query(exitQuery);
    console.log(`Total recent exits: ${exits.length}`);
    exits.forEach(e => {
      console.log(`  - Staff: ${e.name}, Time: ${e.exit_time}`);
    });

    // Check today's staff movements
    console.log('\n--- STAFF MOVEMENTS TODAY ---');
    const todayStaffQuery = `
      SELECT 
        (SELECT COUNT(*) FROM staff_entry_logs WHERE DATE(entry_time) = CURDATE()) as entries_today,
        (SELECT COUNT(*) FROM staff_exit_logs WHERE DATE(exit_time) = CURDATE()) as exits_today
    `;
    const [todayStaff] = await pool.query(todayStaffQuery);
    console.log(`Entries today: ${todayStaff[0].entries_today}`);
    console.log(`Exits today: ${todayStaff[0].exits_today}`);

    // Check current database date/time
    console.log('\n--- DATABASE CURRENT DATE/TIME ---');
    const [dbDate] = await pool.query('SELECT NOW() as current_time, CURDATE() as current_date');
    console.log(`Database time: ${dbDate[0].current_time}`);
    console.log(`Database date: ${dbDate[0].current_date}`);

    await pool.end();
    console.log('\n✅ Check completed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkTodayData();
