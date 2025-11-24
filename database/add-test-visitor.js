const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

console.log('🔄 Adding test visitor...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function addTestVisitor() {
    try {
        const result = await pool.query(`
            INSERT INTO visitors (name, phone_number, email, purpose, whom_to_meet, whom_to_meet_phone, status)
            VALUES ('Test Visitor', '9999999999', 'test@example.com', 'Meeting', 'Krishna Gudi', '9964504954', 'pending')
            RETURNING *
        `);
        
        console.log('✅ Test visitor added successfully!');
        console.log('Visitor details:', result.rows[0]);
        console.log('');
        console.log('Test with phone number: 9999999999');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addTestVisitor();
