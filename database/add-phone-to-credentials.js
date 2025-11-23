const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE';

console.log('🔄 Adding phone_number column to credentials tables...');

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateCredentialsTables() {
    try {
        // Add phone_number column to receptionist_credentials
        console.log('📋 Adding phone_number to receptionist_credentials...');
        await pool.query('ALTER TABLE receptionist_credentials ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)');
        await pool.query("UPDATE receptionist_credentials SET phone_number = '9876543210' WHERE username = 'receptionist'");
        
        // Add phone_number column to security_credentials
        console.log('📋 Adding phone_number to security_credentials...');
        await pool.query('ALTER TABLE security_credentials ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)');
        await pool.query("UPDATE security_credentials SET phone_number = '9876543211' WHERE username = 'security'");
        
        // Add phone_number column to principal_credentials
        console.log('📋 Adding phone_number to principal_credentials...');
        await pool.query('ALTER TABLE principal_credentials ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)');
        await pool.query("UPDATE principal_credentials SET phone_number = '9876543212' WHERE username = 'principal'");
        
        console.log('✅ Phone numbers added successfully!');
        console.log('');
        console.log('Login credentials:');
        console.log('Receptionist - Phone: 9876543210, Password: admin123');
        console.log('Security     - Phone: 9876543211, Password: admin123');
        console.log('Principal    - Phone: 9876543212, Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating credentials tables:', error.message);
        process.exit(1);
    }
}

updateCredentialsTables();
