// Visitor Scan Page JavaScript - VISITOR PORTAL ONLY

let currentVisitorPhone = '';

// Visitor Functions
function showVisitorCheckIn() {
    document.getElementById('visitorCheckInForm').style.display = 'block';
    document.getElementById('visitorCheckOutForm').style.display = 'none';
    
    // Update button styles
    const buttons = document.querySelectorAll('.action-select-btn');
    buttons[0].classList.add('active');
    buttons[1].classList.remove('active');
}

function showVisitorCheckOut() {
    document.getElementById('visitorCheckInForm').style.display = 'none';
    document.getElementById('visitorCheckOutForm').style.display = 'block';
    
    // Update button styles
    const buttons = document.querySelectorAll('.action-select-btn');
    buttons[0].classList.remove('active');
    buttons[1].classList.add('active');
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

// Submit visitor check-in request
async function submitVisitorCheckIn() {
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
            showMessage('✅ Visit request submitted! You will receive SMS notification when approved.', 'success');
            
            // Reset form
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to submit visit request', 'error');
    }
}

// Visitor check-out
async function submitVisitorCheckOut() {
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
            showMessage('✅ Check-out successful! Thank you for visiting.', 'success');
            
            // Reset form
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    } catch (error) {
        showMessage(error.message || 'Check-out failed', 'error');
    }
}

// Helper function for API requests
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

// Show message helper
function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}
