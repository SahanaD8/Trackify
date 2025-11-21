const bcrypt = require('bcryptjs');

// Generate hashed password for admin accounts
const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        return;
    }
    
    console.log('\n🔐 Hashed Password for PostgreSQL Schema\n');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\n📋 Use this hash in postgresql-schema.sql');
    console.log('Replace: $2a$10$YourHashedPasswordHere');
    console.log('With:', hash);
    console.log('\n');
});
