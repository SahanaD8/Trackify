const express = require('express');
const router = express.Router();
const { promisePool } = require('../models/db');
const { verifyToken, checkRole } = require('../middleware/auth');
const emailService = require('../utils/emailService');

/**
 * Get all pending visitor visits
 * GET /api/receptionist/pending-visits
 */
router.get('/pending-visits', async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM visitors
            WHERE status = 'pending'
            ORDER BY created_at DESC
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
            SELECT *
            FROM visitors
            WHERE id = ?
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
            UPDATE visitors
            SET status = ?, approved_at = NOW()
            WHERE id = ?
        `;

        await promisePool.execute(updateQuery, [status, visitId]);

        // Use default receptionist name
        const receptionistName = 'Receptionist';

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
        }

        // If accepted and visitor wants to meet staff, send notification to staff
        if (status === 'accepted' && visit.whom_to_meet) {
            // Try to find staff email/phone if whom_to_meet is a staff member
            const staffQuery = 'SELECT name, phone_number, email FROM staff WHERE name LIKE ? OR id = ?';
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
            SELECT *
            FROM visitors
            ORDER BY created_at DESC
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
            FROM visitors
            WHERE DATE(created_at) = CURRENT_DATE
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
