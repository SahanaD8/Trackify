// Authentication JavaScript

// Send OTP
async function sendOTP(userType) {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();

    if (!phoneNumber) {
        showMessage('Please enter phone number', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.sendOTP, {
            method: 'POST',
            body: JSON.stringify({ phoneNumber, userType })
        });

        if (response.success) {
            showMessage('OTP sent successfully! Check your phone.', 'success');
            
            // In development mode, show OTP
            if (response.otp) {
                showMessage(`Development Mode - OTP: ${response.otp}`, 'info');
            }
        }
    } catch (error) {
        showMessage(error.message || 'Failed to send OTP', 'error');
    }
}

// Receptionist Login
async function receptionistLogin(event) {
    event.preventDefault();

    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!phoneNumber || !password) {
        showMessage('Please enter phone number and password', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify({
                phoneNumber,
                password,
                userType: 'receptionist'
            })
        });

        if (response.success) {
            setUserData(response);
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'receptionist-dashboard.html';
            }, 1000);
        }
    } catch (error) {
        showMessage(error.message || 'Login failed', 'error');
    }
}

// Security Login
async function securityLogin(event) {
    event.preventDefault();

    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!phoneNumber || !password) {
        showMessage('Please enter phone number and password', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify({
                phoneNumber,
                password,
                userType: 'security'
            })
        });

        if (response.success) {
            setUserData(response);
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'security-dashboard.html';
            }, 1000);
        }
    } catch (error) {
        showMessage(error.message || 'Login failed', 'error');
    }
}

// Principal Login
async function principalLogin(event) {
    event.preventDefault();

    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!phoneNumber || !password) {
        showMessage('Please enter phone number and password', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify({
                phoneNumber,
                password,
                userType: 'principal'
            })
        });

        if (response.success) {
            setUserData(response);
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'principal-dashboard.html';
            }, 1000);
        }
    } catch (error) {
        showMessage(error.message || 'Login failed', 'error');
    }
}
