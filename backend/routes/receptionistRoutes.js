const express = require('express');
const router = express.Router();
const { promisePool } = require('../models/db');
const { verifyToken, checkRole } = require('../middleware/auth');
const { sendVisitorStatusSMS, sendStaffVisitorAlertSMS } = require('../utils/sms');
const emailService = require('../utils/emailService');

/**
 * Get all pending visitor visits
 * GET /api/receptionist/pending-visits
 */
router.get('/pending-visits', async (req, res) => {
    try {
        const query = `
            SELECT vv.*, v.name, v.place
            FROM visitor_visits vv
            JOIN visitors v ON vv.visitor_id = v.id
            WHERE vv.status = 'pending'
            ORDER BY vv.created_at DESC
        `;

        const [rows] = await promisePool.execute(query);

        res.json({
            success: true,
            visits: rows
        });
    } catch (error) {
        console.error('Error fetching pending visits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending visits'
        });
    }
});

/**
 * Approve or reject visitor visit
 * POST /api/receptionist/process-visit
 */
router.post('/process-visit', async (req, res) => {
    try {
        const { visitId, action, receptionistId } = req.body;

        if (!visitId || !action || !['accept', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Valid visit ID and action (accept/reject) are required'
            });
        }

        // Get visit details with visitor email
        const visitQuery = `
            SELECT vv.*, v.name, v.phone_number, v.email
            FROM visitor_visits vv
            JOIN visitors v ON vv.visitor_id = v.id
            WHERE vv.id = ?
        `;

        const [visitRows] = await promisePool.execute(visitQuery, [visitId]);

        if (visitRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Visit not found'
            });
        }

        const visit = visitRows[0];
        const status = action === 'accept' ? 'accepted' : 'rejected';

        // Update visit status
        const updateQuery = `
            UPDATE visitor_visits
            SET status = ?, receptionist_id = ?, approved_at = NOW()
            WHERE id = ?
        `;

        await promisePool.execute(updateQuery, [status, receptionistId, visitId]);

        // Get receptionist name
        const recQuery = 'SELECT name FROM receptionist WHERE id = ?';
        const [recRows] = await promisePool.execute(recQuery, [receptionistId]);
        const receptionistName = recRows.length > 0 ? recRows[0].name : 'Receptionist';

        // Send email notification to visitor
        if (visit.email) {
            if (status === 'accepted') {
                await emailService.sendVisitorApprovalEmail(
                    visit.email,
                    visit.name,
                    visit.purpose,
                    receptionistName
                );
            } else {
                await emailService.sendVisitorRejectionEmail(
                    visit.email,
                    visit.name,
                    visit.purpose,
                    receptionistName,
                    'Security reasons'
                );
            }
        } else {
            // Fallback to SMS if no email
            await sendVisitorStatusSMS(visit.phone_number, status, visit.name);
        }

        // If accepted and visitor wants to meet staff, send notification to staff
        if (status === 'accepted' && visit.whom_to_meet) {
            // Try to find staff email/phone if whom_to_meet is a staff member
            const staffQuery = 'SELECT name, phone_number, email FROM staff WHERE name LIKE ? OR staff_id = ?';
            const [staffRows] = await promisePool.execute(staffQuery, [
                `%${visit.whom_to_meet}%`,
                visit.whom_to_meet
            ]);

            if (staffRows.length > 0) {
                const staff = staffRows[0];
                if (staff.email) {
                    await emailService.sendStaffNotification(
                        staff.email,
                        staff.name,
                        visit.name,
                        visit.purpose
                    );
                } else if (staff.phone_number) {
                    await sendStaffVisitorAlertSMS(
                        staff.phone_number,
                        visit.name,
                        visit.purpose
                    );
                }
            }
        }

        res.json({
            success: true,
            message: `Visit ${status} successfully`,
            visit: {
                id: visitId,
                status,
                visitorName: visit.name
            }
        });
    } catch (error) {
        console.error('Error processing visit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process visit'
        });
    }
});

/**
 * Get all visitor visits (for dashboard)
 * GET /api/receptionist/all-visits
 */
router.get('/all-visits', async (req, res) => {
    try {
        const query = `
            SELECT vv.*, v.name, v.phone_number, v.place
            FROM visitor_visits vv
            JOIN visitors v ON vv.visitor_id = v.id
            ORDER BY vv.created_at DESC
            LIMIT 100
        `;

        const [rows] = await promisePool.execute(query);

        res.json({
            success: true,
            visits: rows
        });
    } catch (error) {
        console.error('Error fetching all visits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch visits'
        });
    }
});

/**
 * Get today's statistics
 * GET /api/receptionist/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_visits,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM visitor_visits
            WHERE DATE(created_at) = CURDATE()
        `;

        const [statsRows] = await promisePool.execute(statsQuery);

        res.json({
            success: true,
            stats: statsRows[0]
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

module.exports = router;
