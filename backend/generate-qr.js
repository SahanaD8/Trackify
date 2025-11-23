const QRCode = require('qrcode');
const path = require('path');

// Use Render URL for production, localhost for development
const websiteURL = process.env.RENDER_EXTERNAL_URL 
    ? `${process.env.RENDER_EXTERNAL_URL}/scan`
    : 'http://localhost:10000/scan';
const outputPath = path.join(__dirname, '../public/qr-codes/trackify-qr-code.png');

QRCode.toFile(outputPath, websiteURL, {
    width: 400,
    margin: 2,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    }
}, (err) => {
    if (err) {
        console.error('❌ Error generating QR code:', err);
    } else {
        console.log('✅ QR Code generated successfully!');
        console.log('📍 Location:', outputPath);
        console.log('🔗 URL:', websiteURL);
        console.log('\n📋 Instructions:');
        console.log('1. Open the QR code image');
        console.log('2. Print it and display at entrance');
        console.log('3. Visitors & Staff scan the same QR code');
        console.log('4. System automatically detects user type');
    }
});
