const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// OTP utilities
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createOTP(identifier, userType) {
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await db.collection('otps').doc(`${identifier}_${userType}`).set({
        otp,
        expiresAt,
        identifier,
        userType,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return otp;
}

async function verifyOTP(identifier, otp, userType) {
    const otpDoc = await db.collection('otps').doc(`${identifier}_${userType}`).get();
    
    if (!otpDoc.exists) return false;
    
    const data = otpDoc.data();
    if (data.otp !== otp || data.expiresAt < Date.now()) {
        return false;
    }
    
    // Delete used OTP
    await otpDoc.ref.delete();
    return true;
}

// ============== VISITOR ROUTES ==============

// Check if visitor exists
app.get('/api/visitors/check/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        
        const visitorsSnapshot = await db.collection('visitors')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (visitorsSnapshot.empty) {
            return res.json({
                success: true,
                exists: false,
                hasActiveVisit: false,
                visitor: null
            });
        }
        
        const visitor = visitorsSnapshot.docs[0].data();
        visitor.id = visitorsSnapshot.docs[0].id;
        
        // Check for active visit
        const activeVisitSnapshot = await db.collection('visitor_logs')
            .where('visitor_id', '==', visitor.id)
            .where('status', '==', 'accepted')
            .where('out_time', '==', null)
            .orderBy('in_time', 'desc')
            .limit(1)
            .get();
        
        res.json({
            success: true,
            exists: true,
            hasActiveVisit: !activeVisitSnapshot.empty,
            visitor
        });
    } catch (error) {
        console.error('Error checking visitor:', error);
        res.status(500).json({ success: false, message: 'Failed to check visitor' });
    }
});

// Register new visitor
app.post('/api/visitors/register', async (req, res) => {
    try {
        const { name, phoneNumber, email, place, otp } = req.body;
        
        if (!name || !phoneNumber || !email || !place || !otp) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Verify OTP
        const isValidOTP = await verifyOTP(phoneNumber, otp, 'visitor');
        if (!isValidOTP) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
        }
        
        // Check if visitor exists
        const existingSnapshot = await db.collection('visitors')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (!existingSnapshot.empty) {
            const existing = existingSnapshot.docs[0].data();
            existing.id = existingSnapshot.docs[0].id;
            
            // Update email if not set
            if (!existing.email && email) {
                await db.collection('visitors').doc(existing.id).update({ email });
                existing.email = email;
            }
            
            return res.json({
                success: true,
                message: 'Visitor already registered',
                visitor: existing
            });
        }
        
        // Create new visitor
        const visitorRef = await db.collection('visitors').add({
            name,
            phone_number: phoneNumber,
            email,
            place,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({
            success: true,
            message: 'Visitor registered successfully',
            visitor: {
                id: visitorRef.id,
                name,
                phoneNumber,
                email,
                place
            }
        });
    } catch (error) {
        console.error('Error registering visitor:', error);
        res.status(500).json({ success: false, message: 'Failed to register visitor' });
    }
});

// Visitor check-in (submit visit request)
app.post('/api/visitors/check-in', async (req, res) => {
    try {
        const { phoneNumber, purpose, whomToMeet } = req.body;
        
        if (!phoneNumber || !purpose || !whomToMeet) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Get visitor
        const visitorSnapshot = await db.collection('visitors')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (visitorSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'Visitor not found' });
        }
        
        const visitor = visitorSnapshot.docs[0].data();
        const visitorId = visitorSnapshot.docs[0].id;
        
        // Create visit request
        await db.collection('visitor_logs').add({
            visitor_id: visitorId,
            visitor_name: visitor.name,
            visitor_phone: phoneNumber,
            purpose,
            whom_to_meet: whomToMeet,
            status: 'pending',
            request_time: admin.firestore.FieldValue.serverTimestamp(),
            in_time: null,
            out_time: null
        });
        
        res.json({
            success: true,
            message: 'Visit request submitted. Please wait for receptionist approval.'
        });
    } catch (error) {
        console.error('Error submitting visit request:', error);
        res.status(500).json({ success: false, message: 'Failed to submit request' });
    }
});

// Visitor check-out
app.post('/api/visitors/check-out', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        // Get visitor
        const visitorSnapshot = await db.collection('visitors')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (visitorSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'Visitor not found' });
        }
        
        const visitorId = visitorSnapshot.docs[0].id;
        
        // Find active visit
        const activeVisitSnapshot = await db.collection('visitor_logs')
            .where('visitor_id', '==', visitorId)
            .where('status', '==', 'accepted')
            .where('out_time', '==', null)
            .orderBy('in_time', 'desc')
            .limit(1)
            .get();
        
        if (activeVisitSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'No active visit found' });
        }
        
        // Update visit with out time
        const visitDoc = activeVisitSnapshot.docs[0];
        await visitDoc.ref.update({
            out_time: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({
            success: true,
            message: 'Check-out successful'
        });
    } catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({ success: false, message: 'Failed to check out' });
    }
});

// ============== STAFF ROUTES ==============

// Check if staff exists
app.get('/api/staff/check/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        
        const staffSnapshot = await db.collection('staff')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (staffSnapshot.empty) {
            return res.json({ success: true, exists: false, isStaff: false });
        }
        
        const staff = staffSnapshot.docs[0].data();
        staff.id = staffSnapshot.docs[0].id;
        
        res.json({
            success: true,
            exists: true,
            isStaff: true,
            staff
        });
    } catch (error) {
        console.error('Error checking staff:', error);
        res.status(500).json({ success: false, message: 'Failed to check staff' });
    }
});

// Get staff status (inside/outside)
app.get('/api/staff/status/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        
        // Get staff
        const staffSnapshot = await db.collection('staff')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (staffSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        
        const staff = staffSnapshot.docs[0].data();
        const staffId = staffSnapshot.docs[0].id;
        
        // Get last log
        const lastLogSnapshot = await db.collection('staff_logs')
            .where('staff_id', '==', staffId)
            .orderBy('out_time', 'desc')
            .limit(1)
            .get();
        
        let isInside = true; // Default: staff is inside
        
        if (!lastLogSnapshot.empty) {
            const lastLog = lastLogSnapshot.docs[0].data();
            // If last log is 'out' and in_time is null, staff is outside
            if (lastLog.log_type === 'out' && !lastLog.in_time) {
                isInside = false;
            }
        }
        
        res.json({
            success: true,
            isInside,
            staff: {
                staff_id: staffId,
                name: staff.name,
                phone_number: phoneNumber
            }
        });
    } catch (error) {
        console.error('Error getting staff status:', error);
        res.status(500).json({ success: false, message: 'Failed to get status' });
    }
});

// Staff check-out (going out)
app.post('/api/staff/out', async (req, res) => {
    try {
        const { phoneNumber, purpose } = req.body;
        
        // Get staff
        const staffSnapshot = await db.collection('staff')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (staffSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        
        const staff = staffSnapshot.docs[0].data();
        const staffId = staffSnapshot.docs[0].id;
        
        // Create out log
        await db.collection('staff_logs').add({
            staff_id: staffId,
            staff_name: staff.name,
            phone_number: phoneNumber,
            log_type: 'out',
            purpose,
            out_time: admin.firestore.FieldValue.serverTimestamp(),
            in_time: null
        });
        
        res.json({
            success: true,
            message: 'Exit recorded successfully'
        });
    } catch (error) {
        console.error('Error recording staff exit:', error);
        res.status(500).json({ success: false, message: 'Failed to record exit' });
    }
});

// Staff check-in (coming in)
app.post('/api/staff/in', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        // Get staff
        const staffSnapshot = await db.collection('staff')
            .where('phone_number', '==', phoneNumber)
            .limit(1)
            .get();
        
        if (staffSnapshot.empty) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        
        const staff = staffSnapshot.docs[0].data();
        const staffId = staffSnapshot.docs[0].id;
        
        // Find last 'out' log without in_time
        const lastOutSnapshot = await db.collection('staff_logs')
            .where('staff_id', '==', staffId)
            .where('log_type', '==', 'out')
            .where('in_time', '==', null)
            .orderBy('out_time', 'desc')
            .limit(1)
            .get();
        
        if (!lastOutSnapshot.empty) {
            // Update existing out log with in_time
            await lastOutSnapshot.docs[0].ref.update({
                in_time: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Create new in log
            await db.collection('staff_logs').add({
                staff_id: staffId,
                staff_name: staff.name,
                phone_number: phoneNumber,
                log_type: 'in',
                purpose: null,
                out_time: null,
                in_time: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        
        res.json({
            success: true,
            message: 'Entry recorded successfully'
        });
    } catch (error) {
        console.error('Error recording staff entry:', error);
        res.status(500).json({ success: false, message: 'Failed to record entry' });
    }
});

// ============== AUTH ROUTES ==============

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { phoneNumber, email, userType } = req.body;
        
        const otp = await createOTP(phoneNumber, userType);
        
        // In development, return OTP in response
        // In production, send via email using SendGrid
        console.log(`OTP for ${phoneNumber}: ${otp}`);
        
        res.json({
            success: true,
            message: 'OTP sent successfully',
            otp: otp // Remove this in production
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

