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
            SELECT vv.*, v.name, v.phone_number, v.place
            FROM visitor_visits vv
            JOIN visitors v ON vv.visitor_id = v.id
            WHERE DATE(vv.in_time) = CURDATE()
            ORDER BY vv.in_time DESC
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
            SELECT sl.*, s.name, s.phone_number, s.department
            FROM staff_logs sl
            JOIN staff s ON sl.staff_id = s.staff_id
            WHERE DATE(sl.created_at) = CURDATE()
            ORDER BY sl.created_at DESC
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
                SUM(CASE WHEN out_time IS NULL AND status = 'accepted' THEN 1 ELSE 0 END) as currently_inside
            FROM visitor_visits
            WHERE DATE(in_time) = CURDATE()
        `;

        const [visitorStats] = await promisePool.execute(visitorStatsQuery);

        // Get staff stats
        const staffStatsQuery = `
            SELECT 
                COUNT(DISTINCT staff_id) as total_staff_movements,
                SUM(CASE WHEN log_type = 'out' THEN 1 ELSE 0 END) as staff_out,
                SUM(CASE WHEN log_type = 'in' THEN 1 ELSE 0 END) as staff_in
            FROM staff_logs
            WHERE DATE(created_at) = CURDATE()
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
            SELECT vv.*, v.name, v.phone_number, v.place
            FROM visitor_visits vv
            JOIN visitors v ON vv.visitor_id = v.id
            WHERE vv.status = 'accepted' 
            AND vv.out_time IS NULL
            AND DATE(vv.in_time) = CURDATE()
            ORDER BY vv.in_time DESC
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
