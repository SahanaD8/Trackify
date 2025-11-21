const { promisePool } = require('../models/db');

/**
 * Generate random 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in database
 * @param {string} phoneNumber - Phone number
 * @param {string} userType - Type of user (visitor, staff, receptionist, security, principal)
 * @returns {Promise<string>} - Generated OTP
 */
const createOTP = async (phoneNumber, userType) => {
    try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const query = `
            INSERT INTO otp_verification (phone_number, otp, user_type, expires_at)
            VALUES (?, ?, ?, ?)
        `;

        await promisePool.execute(query, [phoneNumber, otp, userType, expiresAt]);

        console.log(`🔐 OTP generated for ${phoneNumber}: ${otp}`);
        return otp;
    } catch (error) {
        console.error('Error creating OTP:', error);
        throw error;
    }
};

/**
 * Verify OTP
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP to verify
 * @param {string} userType - Type of user
 * @returns {Promise<boolean>} - True if OTP is valid
 */
const verifyOTP = async (phoneNumber, otp, userType) => {
    try {
        const query = `
            SELECT * FROM otp_verification
            WHERE phone_number = ? AND otp = ? AND user_type = ?
            AND is_verified = FALSE AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const [rows] = await promisePool.execute(query, [phoneNumber, otp, userType]);

        if (rows.length === 0) {
            return false;
        }

        // Mark OTP as verified
        const updateQuery = `
            UPDATE otp_verification
            SET is_verified = TRUE
            WHERE id = ?
        `;

        await promisePool.execute(updateQuery, [rows[0].id]);

        console.log(`✅ OTP verified for ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
    }
};

/**
 * Clean up expired OTPs (run periodically)
 */
const cleanupExpiredOTPs = async () => {
    try {
        const query = `
            DELETE FROM otp_verification
            WHERE expires_at < NOW() OR is_verified = TRUE
        `;

        const [result] = await promisePool.execute(query);
        console.log(`🧹 Cleaned up ${result.affectedRows} expired/used OTPs`);
    } catch (error) {
        console.error('Error cleaning up OTPs:', error);
    }
};

module.exports = {
    generateOTP,
    createOTP,
    verifyOTP,
    cleanupExpiredOTPs
};
