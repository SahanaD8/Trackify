const express = require('express');
const router = express.Router();
const { promisePool } = require('../models/db');
const { verifyToken, checkRole } = require('../middleware/auth');

/**
 * Get daily report (visitor and staff details)
 * GET /api/principal/daily-report
 */
router.get('/daily-report', async (req, res) => {
    try {
        const { date } = req.query;
        const reportDate = date || new Date().toISOString().split('T')[0];

        // Get visitor visits for the day
        const visitorQuery = `
            SELECT vv.*, v.name, v.phone_number, v.place
            FROM visitor_visits vv
            JOIN visitors v ON vv.visitor_id = v.id
            WHERE DATE(vv.in_time) = ?
            ORDER BY vv.in_time ASC
        `;

        const [visitorRows] = await promisePool.execute(visitorQuery, [reportDate]);

        // Get staff logs for the day
        const staffQuery = `
            SELECT sl.*, s.name, s.phone_number, s.department
            FROM staff_logs sl
            JOIN staff s ON sl.staff_id = s.staff_id
            WHERE DATE(sl.created_at) = ?
            ORDER BY sl.created_at ASC
        `;

        const [staffRows] = await promisePool.execute(staffQuery, [reportDate]);

        // Number the records
        const numberedVisitors = visitorRows.map((visitor, index) => ({
            number: index + 1,
            ...visitor
        }));

        const numberedStaffLogs = staffRows.map((log, index) => ({
            number: index + 1,
            ...log
        }));

        res.json({
            success: true,
            report: {
                date: reportDate,
                visitors: {
                    count: numberedVisitors.length,
                    data: numberedVisitors
                },
                staffLogs: {
                    count: numberedStaffLogs.length,
                    data: numberedStaffLogs
                }
            }
        });
    } catch (error) {
        console.error('Error generating daily report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate daily report'
        });
    }
});

/**
 * Get report for date range
 * GET /api/principal/report-range
 */
router.get('/report-range', async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;

        if (!fromDate || !toDate) {
            return res.status(400).json({
                success: false,
                message: 'From date and to date are required'
            });
        }

        // Get visitor visits for the date range
        const visitorQuery = `
            SELECT vv.*, v.name, v.phone_number, v.place
            FROM visitor_visits vv
            JOIN visitors v ON vv.visitor_id = v.id
            WHERE DATE(vv.in_time) BETWEEN ? AND ?
            ORDER BY vv.in_time ASC
        `;

        const [visitorRows] = await promisePool.execute(visitorQuery, [fromDate, toDate]);

        // Get staff logs for the date range
        const staffQuery = `
            SELECT sl.*, s.name, s.phone_number, s.department
            FROM staff_logs sl
            JOIN staff s ON sl.staff_id = s.staff_id
            WHERE DATE(sl.created_at) BETWEEN ? AND ?
            ORDER BY sl.created_at ASC
        `;

        const [staffRows] = await promisePool.execute(staffQuery, [fromDate, toDate]);

        // Number the records
        const numberedVisitors = visitorRows.map((visitor, index) => ({
            number: index + 1,
            ...visitor
        }));

        const numberedStaffLogs = staffRows.map((log, index) => ({
            number: index + 1,
            ...log
        }));

        res.json({
            success: true,
            report: {
                fromDate,
                toDate,
                visitors: {
                    count: numberedVisitors.length,
                    data: numberedVisitors
                },
                staffLogs: {
                    count: numberedStaffLogs.length,
                    data: numberedStaffLogs
                }
            }
        });
    } catch (error) {
        console.error('Error generating range report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report'
        });
    }
});

/**
 * Get dashboard statistics
 * GET /api/principal/stats
 */
router.get('/stats', async (req, res) => {
    try {
        // Today's statistics
        const todayStatsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM visitor_visits WHERE DATE(in_time) = CURDATE()) as today_visitors,
                (SELECT COUNT(*) FROM staff_logs WHERE DATE(created_at) = CURDATE()) as today_staff_logs,
                (SELECT COUNT(*) FROM visitor_visits WHERE status = 'pending') as pending_approvals,
                (SELECT COUNT(*) FROM visitor_visits WHERE status = 'accepted' AND out_time IS NULL AND DATE(in_time) = CURDATE()) as active_visitors
        `;

        const [todayStats] = await promisePool.execute(todayStatsQuery);

        // Monthly statistics
        const monthlyStatsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM visitor_visits WHERE MONTH(in_time) = MONTH(CURDATE()) AND YEAR(in_time) = YEAR(CURDATE())) as month_visitors,
                (SELECT COUNT(*) FROM staff_logs WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())) as month_staff_logs
        `;

        const [monthlyStats] = await promisePool.execute(monthlyStatsQuery);

        res.json({
            success: true,
            stats: {
                today: todayStats[0],
                monthly: monthlyStats[0]
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
 * Get summary for SMS notification (called at 6 PM daily)
 * GET /api/principal/daily-summary
 */
router.get('/daily-summary', async (req, res) => {
    try {
        const visitorCountQuery = `
            SELECT COUNT(*) as count
            FROM visitor_visits
            WHERE DATE(in_time) = CURDATE()
        `;

        const staffLogCountQuery = `
            SELECT COUNT(*) as count
            FROM staff_logs
            WHERE DATE(created_at) = CURDATE()
        `;

        const [visitorCount] = await promisePool.execute(visitorCountQuery);
        const [staffLogCount] = await promisePool.execute(staffLogCountQuery);

        res.json({
            success: true,
            summary: {
                visitorCount: visitorCount[0].count,
                staffLogCount: staffLogCount[0].count,
                date: new Date().toISOString().split('T')[0]
            }
        });
    } catch (error) {
        console.error('Error fetching daily summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch daily summary'
        });
    }
});

module.exports = router;
