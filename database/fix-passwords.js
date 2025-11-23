const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

console.log('🔄 Updating passwords to plain text admin123...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updatePasswords() {
    try {
        await pool.query("UPDATE receptionist_credentials SET password = 'admin123'");
        console.log('✅ Receptionist password updated');
        
        await pool.query("UPDATE security_credentials SET password = 'admin123'");
        console.log('✅ Security password updated');
        
        await pool.query("UPDATE principal_credentials SET password = 'admin123'");
        console.log('✅ Principal password updated');
        
        console.log('');
        console.log('All passwords set to: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updatePasswords();
