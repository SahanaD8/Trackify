const express = require('express');
const router = express.Router();
const { promisePool } = require('../models/db');
const { verifyToken, checkRole } = require('../middleware/auth');

/**
 * Get all visitor visits (for security dashboard)
 * GET /api/security/visitor-visits
 */
router.get('/visitor-visits', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, name, phone_number, purpose, whom_to_meet, 
                check_in_time as in_time, 
                check_out_time as out_time, 
                status, created_at
            FROM visitors
            WHERE DATE(check_in_time) = CURRENT_DATE
            ORDER BY check_in_time DESC
        `;

        const [rows] = await promisePool.execute(query);

        res.json({
            success: true,
            visits: rows
        });
    } catch (error) {
        console.error('Error fetching visitor visits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch visitor visits'
        });
    }
});

/**
 * Get all staff logs (for security dashboard)
 * GET /api/security/staff-logs
 */
router.get('/staff-logs', async (req, res) => {
    try {
        const query = `
            SELECT 
                'entry' as log_type,
                sel.id,
                sel.staff_id,
                s.name,
                s.phone_number,
                s.department,
                NULL as purpose,
                sel.entry_time as in_time,
                NULL as out_time
            FROM staff_entry_logs sel
            JOIN staff s ON sel.staff_id = s.id
            WHERE DATE(sel.entry_time) = CURRENT_DATE
            
            UNION ALL
            
            SELECT 
                'exit' as log_type,
                sxl.id,
                sxl.staff_id,
                s.name,
                s.phone_number,
                s.department,
                sxl.purpose,
                NULL as in_time,
                sxl.exit_time as out_time
            FROM staff_exit_logs sxl
            JOIN staff s ON sxl.staff_id = s.id
            WHERE DATE(sxl.exit_time) = CURRENT_DATE
            
            ORDER BY COALESCE(in_time, out_time) DESC
        `;

        const [rows] = await promisePool.execute(query);

        res.json({
            success: true,
            logs: rows
        });
    } catch (error) {
        console.error('Error fetching staff logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff logs'
        });
    }
});

/**
 * Get dashboard statistics for today
 * GET /api/security/stats
 */
router.get('/stats', async (req, res) => {
    try {
        // Get visitor stats
        const visitorStatsQuery = `
            SELECT 
                COUNT(*) as total_visitors,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN check_out_time IS NULL AND status = 'accepted' THEN 1 ELSE 0 END) as currently_inside
            FROM visitors
            WHERE DATE(check_in_time) = CURRENT_DATE
        `;

        const [visitorStats] = await promisePool.execute(visitorStatsQuery);

        // Get staff stats
        const staffStatsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM staff_exit_logs WHERE DATE(exit_time) = CURRENT_DATE) as staff_out,
                (SELECT COUNT(*) FROM staff_entry_logs WHERE DATE(entry_time) = CURRENT_DATE) as staff_in
        `;

        const [staffStats] = await promisePool.execute(staffStatsQuery);

        res.json({
            success: true,
            stats: {
                visitors: visitorStats[0],
                staff: staffStats[0]
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

/**
 * Get currently active visitors (inside campus)
 * GET /api/security/active-visitors
 */
router.get('/active-visitors', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, name, phone_number, purpose, whom_to_meet,
                check_in_time as in_time,
                check_out_time as out_time,
                status, created_at
            FROM visitors
            WHERE status = 'accepted' 
            AND check_out_time IS NULL
            AND DATE(check_in_time) = CURRENT_DATE
            ORDER BY check_in_time DESC
        `;

        const [rows] = await promisePool.execute(query);

        res.json({
            success: true,
            activeVisitors: rows
        });
    } catch (error) {
        console.error('Error fetching active visitors:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active visitors'
        });
    }
});

module.exports = router;
