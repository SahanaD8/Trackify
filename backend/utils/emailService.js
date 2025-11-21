// Email Service using Nodemailer
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Check if email credentials are configured
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                console.log('📧 Email not configured - Running in DEVELOPMENT MODE');
                console.log('   Email notifications will be logged to console instead of being sent');
                this.initialized = false;
                return;
            }

            // Create transporter
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: false, // true for 465, false for other ports
                connectionTimeout: 10000, // 10 seconds
                greetingTimeout: 10000, // 10 seconds
                socketTimeout: 10000, // 10 seconds
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            // Verify connection with timeout - run asynchronously without blocking
            const verifyTimeout = setTimeout(() => {
                console.log('⚠️ Email service verification timeout - continuing without email');
                this.initialized = false;
            }, 10000); // 10 second timeout

            this.transporter.verify((error, success) => {
                clearTimeout(verifyTimeout);
                if (error) {
                    console.error('❌ Email service initialization failed:', error.message);
                    this.initialized = false;
                } else {
                    console.log('✅ Email service initialized successfully');
                    this.initialized = true;
                }
            });

            // Don't wait for verification - continue immediately
            console.log('📧 Email service initializing in background...');

        } catch (error) {
            console.error('❌ Email service initialization error:', error.message);
            this.initialized = false;
        }
    }

    async sendOTP(email, otp, name = 'User') {
        const subject = 'Your TRACKIFY OTP Code';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎯 TRACKIFY</h1>
                        <p>Visitor Management System</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>Your One-Time Password (OTP) for TRACKIFY verification is:</p>
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                        </div>
                        <p><strong>Important:</strong></p>
                        <ul>
                            <li>This OTP is valid for 10 minutes</li>
                            <li>Do not share this code with anyone</li>
                            <li>If you didn't request this, please ignore this email</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from TRACKIFY Visitor Management System</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    async sendVisitorApprovalEmail(email, name, purpose, approvedBy) {
        const subject = '✅ Your Visit Request has been Approved';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status-box { background: white; border-left: 5px solid #38ef7d; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Visit Approved</h1>
                        <p>TRACKIFY Visitor Management</p>
                    </div>
                    <div class="content">
                        <h2>Good News, ${name}!</h2>
                        <p>Your visit request has been approved.</p>
                        <div class="status-box">
                            <p><strong>Visit Details:</strong></p>
                            <ul>
                                <li><strong>Purpose:</strong> ${purpose}</li>
                                <li><strong>Approved By:</strong> ${approvedBy}</li>
                                <li><strong>Status:</strong> <span style="color: #38ef7d;">Approved ✓</span></li>
                            </ul>
                        </div>
                        <p>Please proceed to the entrance. Have a pleasant visit!</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from TRACKIFY Visitor Management System</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    async sendVisitorRejectionEmail(email, name, purpose, rejectedBy, reason = 'Not specified') {
        const subject = '❌ Your Visit Request has been Declined';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status-box { background: white; border-left: 5px solid #f45c43; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>❌ Visit Declined</h1>
                        <p>TRACKIFY Visitor Management</p>
                    </div>
                    <div class="content">
                        <h2>Dear ${name},</h2>
                        <p>We regret to inform you that your visit request has been declined.</p>
                        <div class="status-box">
                            <p><strong>Visit Details:</strong></p>
                            <ul>
                                <li><strong>Purpose:</strong> ${purpose}</li>
                                <li><strong>Declined By:</strong> ${rejectedBy}</li>
                                <li><strong>Reason:</strong> ${reason}</li>
                                <li><strong>Status:</strong> <span style="color: #f45c43;">Declined ✗</span></li>
                            </ul>
                        </div>
                        <p>If you have any questions, please contact the administration.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from TRACKIFY Visitor Management System</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    async sendStaffNotification(email, name, visitorName, visitorPurpose) {
        const subject = '🔔 Visitor Notification - Someone is here to meet you';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .notification-box { background: white; border-left: 5px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Visitor Alert</h1>
                        <p>TRACKIFY Visitor Management</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${name},</h2>
                        <p>You have a visitor waiting to meet you.</p>
                        <div class="notification-box">
                            <p><strong>Visitor Information:</strong></p>
                            <ul>
                                <li><strong>Name:</strong> ${visitorName}</li>
                                <li><strong>Purpose:</strong> ${visitorPurpose}</li>
                                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                            </ul>
                        </div>
                        <p>Please check with reception for more details.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email from TRACKIFY Visitor Management System</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    async sendEmail(to, subject, html) {
        if (!this.initialized) {
            console.log('\n📧 EMAIL (Development Mode):');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('Email would be sent in production\n');
            return { success: true, message: 'Development mode - email logged' };
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: to,
                subject: subject,
                html: html
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully to:', to);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email sending failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
module.exports = new EmailService();
