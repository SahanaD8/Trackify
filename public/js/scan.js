// Scan Page JavaScript

let currentVisitorPhone = '';

// Select Role
function selectRole(role) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.display = 'none';
    });

    if (role === 'visitor') {
        document.getElementById('visitorSection').style.display = 'block';
    } else if (role === 'staff') {
        document.getElementById('staffSection').style.display = 'block';
    }
}

// Visitor Functions
function showVisitorCheckIn() {
    document.getElementById('visitorCheckInForm').style.display = 'block';
    document.getElementById('visitorCheckOutForm').style.display = 'none';
}

function showVisitorCheckOut() {
    document.getElementById('visitorCheckInForm').style.display = 'none';
    document.getElementById('visitorCheckOutForm').style.display = 'block';
}

// Check if visitor exists
async function checkVisitor() {
    const phoneNumber = document.getElementById('visitorPhone').value.trim();

    if (!phoneNumber) {
        showMessage('Please enter phone number', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.checkVisitor(phoneNumber));

        if (response.exists) {
            // Existing visitor - show purpose form
            currentVisitorPhone = phoneNumber;
            document.getElementById('newVisitorForm').style.display = 'none';
            document.getElementById('visitPurposeForm').style.display = 'block';
            showMessage('Welcome back! Please enter visit details.', 'success');
        } else {
            // New visitor - show registration form
            currentVisitorPhone = phoneNumber;
            document.getElementById('newVisitorForm').style.display = 'block';
            document.getElementById('visitPurposeForm').style.display = 'none';
            showMessage('New visitor detected. Please complete registration.', 'info');
        }
    } catch (error) {
        showMessage(error.message || 'Failed to check visitor', 'error');
    }
}

// Send OTP for new visitor
async function sendVisitorOTP() {
    const phoneNumber = document.getElementById('visitorPhone').value.trim();

    if (!phoneNumber) {
        showMessage('Please enter phone number first', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.sendOTP, {
            method: 'POST',
            body: JSON.stringify({ phoneNumber, userType: 'visitor' })
        });

        if (response.success) {
            showMessage('OTP sent successfully!', 'success');
            
            // Show OTP in development mode
            if (response.otp) {
                showMessage(`Development Mode - OTP: ${response.otp}`, 'info');
            }
        }
    } catch (error) {
        showMessage(error.message || 'Failed to send OTP', 'error');
    }
}

// Register new visitor
async function registerVisitor() {
    const phoneNumber = document.getElementById('visitorPhone').value.trim();
    const name = document.getElementById('visitorName').value.trim();
    const place = document.getElementById('visitorPlace').value.trim();
    const otp = document.getElementById('visitorOTP').value.trim();

    if (!name || !place || !otp) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.registerVisitor, {
            method: 'POST',
            body: JSON.stringify({ name, phoneNumber, place, otp })
        });

        if (response.success) {
            showMessage('Registration successful! Now enter visit details.', 'success');
            document.getElementById('newVisitorForm').style.display = 'none';
            document.getElementById('visitPurposeForm').style.display = 'block';
        }
    } catch (error) {
        showMessage(error.message || 'Registration failed', 'error');
    }
}

// Submit visit request
async function submitVisit() {
    const phoneNumber = currentVisitorPhone;
    const purpose = document.getElementById('visitPurpose').value.trim();
    const whomToMeet = document.getElementById('whomToMeet').value.trim();

    if (!purpose || !whomToMeet) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.visitorCheckIn, {
            method: 'POST',
            body: JSON.stringify({ phoneNumber, purpose, whomToMeet })
        });

        if (response.success) {
            showMessage('Visit request submitted! You will receive SMS notification.', 'success');
            
            // Reset form
            setTimeout(() => {
                document.getElementById('visitPurpose').value = '';
                document.getElementById('whomToMeet').value = '';
                document.getElementById('visitorPhone').value = '';
                document.getElementById('visitPurposeForm').style.display = 'none';
                window.location.reload();
            }, 3000);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to submit visit request', 'error');
    }
}

// Visitor check-out
async function checkOutVisitor() {
    const phoneNumber = document.getElementById('checkoutPhone').value.trim();

    if (!phoneNumber) {
        showMessage('Please enter phone number', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.visitorCheckOut, {
            method: 'POST',
            body: JSON.stringify({ phoneNumber })
        });

        if (response.success) {
            showMessage('Check-out successful! Thank you for visiting.', 'success');
            
            // Reset form
            setTimeout(() => {
                document.getElementById('checkoutPhone').value = '';
                window.location.reload();
            }, 3000);
        }
    } catch (error) {
        showMessage(error.message || 'Check-out failed', 'error');
    }
}

// Staff Functions
function showStaffCheckOut() {
    document.getElementById('staffCheckOutForm').style.display = 'block';
    document.getElementById('staffCheckInForm').style.display = 'none';
}

function showStaffCheckIn() {
    document.getElementById('staffCheckOutForm').style.display = 'none';
    document.getElementById('staffCheckInForm').style.display = 'block';
}

// Staff check-out
async function staffCheckOut() {
    const staffId = document.getElementById('staffIdOut').value.trim();
    const purpose = document.getElementById('staffPurpose').value.trim();

    if (!staffId || !purpose) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.staffCheckOut, {
            method: 'POST',
            body: JSON.stringify({ staffId, purpose })
        });

        if (response.success) {
            showMessage('Check-out successful!', 'success');
            
            // Reset form
            setTimeout(() => {
                document.getElementById('staffIdOut').value = '';
                document.getElementById('staffPurpose').value = '';
                window.location.reload();
            }, 2000);
        }
    } catch (error) {
        showMessage(error.message || 'Check-out failed', 'error');
    }
}

// Staff check-in
async function staffCheckIn() {
    const staffId = document.getElementById('staffIdIn').value.trim();

    if (!staffId) {
        showMessage('Please enter Staff ID', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.staffCheckIn, {
            method: 'POST',
            body: JSON.stringify({ staffId })
        });

        if (response.success) {
            showMessage('Check-in successful!', 'success');
            
            // Reset form
            setTimeout(() => {
                document.getElementById('staffIdIn').value = '';
                window.location.reload();
            }, 2000);
        }
    } catch (error) {
        showMessage(error.message || 'Check-in failed', 'error');
    }
}
