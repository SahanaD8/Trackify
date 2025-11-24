const express = require('express');
const router = express.Router();
const { promisePool } = require('../models/db');

/**
 * Check if staff exists by phone number
 * GET /api/staff/check/:phoneNumber
 */
router.get('/check/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        const query = 'SELECT * FROM staff WHERE phone_number = ?';
        const [rows] = await promisePool.execute(query, [phoneNumber]);

        res.json({
            success: true,
            exists: rows.length > 0,
            isStaff: rows.length > 0,
            staff: rows.length > 0 ? rows[0] : null
        });
    } catch (error) {
        console.error('Error checking staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check staff'
        });
    }
});

/**
 * Check staff status (inside or outside campus)
 * GET /api/staff/status/:phoneNumber
 */
router.get('/status/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Find staff by phone number
        const staffQuery = 'SELECT * FROM staff WHERE phone_number = ?';
        const [staffRows] = await promisePool.execute(staffQuery, [phoneNumber]);

        if (staffRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found with this phone number'
            });
        }

        const staff = staffRows[0];

        // Get the most recent entry log for this staff
        const entryLogQuery = `
            SELECT * FROM staff_entry_logs 
            WHERE staff_id = ? 
            ORDER BY entry_time DESC
            LIMIT 1
        `;
        const [entryRows] = await promisePool.execute(entryLogQuery, [staff.id]);

        let isInside = false; // Default: assume staff is outside
        
        if (entryRows.length > 0) {
            const lastEntry = entryRows[0];
            // If last entry has no exit_time, staff is inside
            if (!lastEntry.exit_time) {
                isInside = true;
            }
        }

        res.json({
            success: true,
            isInside,
            staff: {
                id: staff.id,
                name: staff.name,
                phone_number: staff.phone_number,
                email: staff.email,
                department: staff.department
            }
        });
    } catch (error) {
        console.error('Error checking staff status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check staff status'
        });
    }
});

/**
 * Staff check-out (going out)
 * POST /api/staff/check-out
 */
router.post('/check-out', async (req, res) => {
    try {
        const { staffId, purpose } = req.body;

        if (!staffId || !purpose) {
            return res.status(400).json({
                success: false,
                message: 'Staff ID and purpose are required'
            });
        }

        // Verify staff exists
        const staffQuery = 'SELECT * FROM staff WHERE staff_id = ?';
        const [staffRows] = await promisePool.execute(staffQuery, [staffId]);

        if (staffRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        const outTime = new Date();

        // Insert staff log
        const insertQuery = `
            INSERT INTO staff_logs (staff_id, purpose, out_time, log_type)
            VALUES (?, ?, ?, 'out')
        `;

        const [result] = await promisePool.execute(insertQuery, [staffId, purpose, outTime]);

        res.json({
            success: true,
            message: 'Check-out successful',
            log: {
                id: result.insertId,
                staffId,
                staffName: staffRows[0].name,
                purpose,
                outTime
            }
        });
    } catch (error) {
        console.error('Error during staff check-out:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check-out'
        });
    }
});

/**
 * Staff check-in (coming back)
 * POST /api/staff/check-in
 */
router.post('/check-in', async (req, res) => {
    try {
        const { staffId } = req.body;

        if (!staffId) {
            return res.status(400).json({
                success: false,
                message: 'Staff ID is required'
            });
        }

        // Verify staff exists
        const staffQuery = 'SELECT * FROM staff WHERE staff_id = ?';
        const [staffRows] = await promisePool.execute(staffQuery, [staffId]);

        if (staffRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        const inTime = new Date();

        // Insert staff log
        const insertQuery = `
            INSERT INTO staff_logs (staff_id, purpose, in_time, log_type)
            VALUES (?, 'Return', ?, 'in')
        `;

        const [result] = await promisePool.execute(insertQuery, [staffId, inTime]);

        res.json({
            success: true,
            message: 'Check-in successful',
            log: {
                id: result.insertId,
                staffId,
                staffName: staffRows[0].name,
                inTime
            }
        });
    } catch (error) {
        console.error('Error during staff check-in:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check-in'
        });
    }
});

/**
 * Get all staff
 * GET /api/staff
 */
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM staff ORDER BY name';
        const [rows] = await promisePool.execute(query);

        res.json({
            success: true,
            staff: rows
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff'
        });
    }
});

/**
 * Get staff logs
 * GET /api/staff/logs/:staffId
 */
router.get('/logs/:staffId', async (req, res) => {
    try {
        const { staffId } = req.params;

        const query = `
            SELECT sl.*, s.name, s.department
            FROM staff_logs sl
            JOIN staff s ON sl.staff_id = s.staff_id
            WHERE sl.staff_id = ?
            ORDER BY sl.created_at DESC
        `;

        const [rows] = await promisePool.execute(query, [staffId]);

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
 * Staff going out (by phone number)
 * POST /api/staff/out
 */
router.post('/out', async (req, res) => {
    try {
        const { phoneNumber, purpose } = req.body;

        if (!phoneNumber || !purpose) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and purpose are required'
            });
        }

        // Find staff by phone number
        const staffQuery = 'SELECT * FROM staff WHERE phone_number = ?';
        const [staffRows] = await promisePool.execute(staffQuery, [phoneNumber]);

        if (staffRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found with this phone number'
            });
        }

        const staff = staffRows[0];
        const exitTime = new Date();

        // Check if there's an active entry without exit
        const checkQuery = `
            SELECT * FROM staff_entry_logs 
            WHERE staff_id = ? AND exit_time IS NULL
            ORDER BY entry_time DESC
            LIMIT 1
        `;
        const [entryRows] = await promisePool.execute(checkQuery, [staff.id]);

        if (entryRows.length > 0) {
            // Update existing entry with exit time and purpose
            const updateQuery = `
                UPDATE staff_entry_logs 
                SET exit_time = ?, purpose = ? 
                WHERE id = ?
            `;
            await promisePool.execute(updateQuery, [exitTime, purpose, entryRows[0].id]);
        }

        res.json({
            success: true,
            message: 'Exit recorded successfully',
            log: {
                id: entryRows.length > 0 ? entryRows[0].id : null,
                staffId: staff.id,
                staffName: staff.name,
                purpose,
                exitTime
            }
        });
    } catch (error) {
        console.error('Error recording staff exit:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record exit'
        });
    }
});

/**
 * Staff coming in (by phone number)
 * POST /api/staff/in
 */
router.post('/in', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Find staff by phone number
        const staffQuery = 'SELECT * FROM staff WHERE phone_number = ?';
        const [staffRows] = await promisePool.execute(staffQuery, [phoneNumber]);

        if (staffRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found with this phone number'
            });
        }

        const staff = staffRows[0];
        const entryTime = new Date();

        // Insert new entry log
        const insertQuery = `
            INSERT INTO staff_entry_logs (staff_id, entry_time)
            VALUES (?, ?)
        `;
        const [result] = await promisePool.execute(insertQuery, [staff.id, entryTime]);

        res.json({
            success: true,
            message: 'Entry recorded successfully',
            log: {
                id: result.insertId,
                staffId: staff.id,
                staffName: staff.name,
                entryTime
            }
        });
    } catch (error) {
        console.error('Error recording staff entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record entry'
        });
    }
});

module.exports = router;
