const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./models/db');

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import routes
const visitorRoutes = require('./routes/visitorRoutes');
const staffRoutes = require('./routes/staffRoutes');
const receptionistRoutes = require('./routes/receptionistRoutes');
const securityRoutes = require('./routes/securityRoutes');
const principalRoutes = require('./routes/principalRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Test database connection on startup
testConnection();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/principal', principalRoutes);

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// QR Code scan routes
app.get('/scan', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/qr-scan.html'));
});

app.get('/qr-scan.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/qr-scan.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server - Listen on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    // Use APP_URL from env, RENDER_EXTERNAL_URL for Render, or fallback to localhost
    const baseURL = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const qrCodeURL = `${baseURL}/scan`;
    
    console.log(`🚀 TRACKIFY Server running on port ${PORT}`);
    console.log(`📱 QR Code URL: ${qrCodeURL}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 Network Access: Server accessible on local network`);
    console.log(`🔗 Base URL: ${baseURL}`);
});

module.exports = app;
