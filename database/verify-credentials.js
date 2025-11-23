const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

console.log('🔄 Verifying and updating phone numbers in credentials tables...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function verifyAndUpdate() {
    try {
        // Check and update receptionist
        console.log('📋 Checking receptionist_credentials...');
        const receptionist = await pool.query('SELECT * FROM receptionist_credentials');
        console.log('Receptionist data:', receptionist.rows);
        
        await pool.query("UPDATE receptionist_credentials SET phone_number = '9876543210' WHERE username = 'receptionist' OR phone_number IS NULL");
        
        // Check and update security
        console.log('📋 Checking security_credentials...');
        const security = await pool.query('SELECT * FROM security_credentials');
        console.log('Security data:', security.rows);
        
        await pool.query("UPDATE security_credentials SET phone_number = '9876543211' WHERE username = 'security' OR phone_number IS NULL");
        
        // Check and update principal
        console.log('📋 Checking principal_credentials...');
        const principal = await pool.query('SELECT * FROM principal_credentials');
        console.log('Principal data:', principal.rows);
        
        await pool.query("UPDATE principal_credentials SET phone_number = '9876543212' WHERE username = 'principal' OR phone_number IS NULL");
        
        console.log('✅ All credentials updated!');
        console.log('');
        console.log('Login credentials:');
        console.log('Receptionist - Phone: 9876543210, Password: admin123');
        console.log('Security     - Phone: 9876543211, Password: admin123');
        console.log('Principal    - Phone: 9876543212, Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyAndUpdate();
