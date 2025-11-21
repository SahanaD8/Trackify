const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

// Initialize Twilio client only if ALL credentials are properly configured
// Check that accountSid starts with 'AC' to ensure it's a valid Twilio SID
if (accountSid && accountSid.startsWith('AC') && authToken && twilioPhoneNumber) {
    try {
        client = twilio(accountSid, authToken);
        console.log('✅ Twilio initialized successfully');
    } catch (error) {
        console.log('⚠️  Twilio initialization failed:', error.message);
        console.log('📱 Running in DEVELOPMENT MODE - SMS will be logged to console');
    }
} else {
    console.log('📱 Twilio not configured - Running in DEVELOPMENT MODE');
    console.log('   SMS messages will be logged to console instead of being sent');
}

/**
 * Send SMS using Twilio
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} - Result of SMS send operation
 */
const sendSMS = async (phoneNumber, message) => {
    try {
        // If Twilio is not configured, log the message instead
        if (!client) {
            console.log('📱 SMS (Development Mode):');
            console.log(`   To: ${phoneNumber}`);
            console.log(`   Message: ${message}`);
            return {
                success: true,
                mode: 'development',
                message: 'SMS logged (Twilio not configured)'
            };
        }

        // Send actual SMS
        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber
        });

        console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
        
        return {
            success: true,
            sid: result.sid,
            mode: 'production'
        };
    } catch (error) {
        console.error(`❌ SMS failed to ${phoneNumber}:`, error.message);
        
        // In development, still log the message
        if (process.env.NODE_ENV === 'development') {
            console.log('📱 SMS (Fallback):');
            console.log(`   To: ${phoneNumber}`);
            console.log(`   Message: ${message}`);
        }
        
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send visitor status SMS
 * @param {string} phoneNumber - Visitor phone number
 * @param {string} status - 'accepted' or 'rejected'
 * @param {string} visitorName - Visitor name
 */
const sendVisitorStatusSMS = async (phoneNumber, status, visitorName) => {
    const message = status === 'accepted'
        ? `Hello ${visitorName}, your visit request has been ACCEPTED. You may proceed. - TRACKIFY`
        : `Hello ${visitorName}, your visit request has been REJECTED. Please contact reception for more information. - TRACKIFY`;
    
    return await sendSMS(phoneNumber, message);
};

/**
 * Send staff visitor alert SMS
 * @param {string} staffPhone - Staff phone number
 * @param {string} visitorName - Visitor name
 * @param {string} purpose - Purpose of visit
 */
const sendStaffVisitorAlertSMS = async (staffPhone, visitorName, purpose) => {
    const message = `Alert: ${visitorName} wants to meet you. Purpose: ${purpose}. - TRACKIFY`;
    return await sendSMS(staffPhone, message);
};

/**
 * Send daily report summary SMS
 * @param {string} phoneNumber - Principal phone number
 * @param {number} visitorCount - Total visitors
 * @param {number} staffLogCount - Total staff logs
 */
const sendDailyReportSMS = async (phoneNumber, visitorCount, staffLogCount) => {
    const message = `Daily Report: ${visitorCount} visitor(s), ${staffLogCount} staff log(s). Check your dashboard for details. - TRACKIFY`;
    return await sendSMS(phoneNumber, message);
};

module.exports = {
    sendSMS,
    sendVisitorStatusSMS,
    sendStaffVisitorAlertSMS,
    sendDailyReportSMS
};
