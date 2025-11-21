// Staff Scan Page JavaScript - STAFF PORTAL ONLY

// Staff Functions
function showStaffOut() {
    document.getElementById('staffOutForm').style.display = 'block';
    document.getElementById('staffInForm').style.display = 'none';
    
    // Update button styles
    const buttons = document.querySelectorAll('.action-select-btn');
    buttons[0].classList.add('active');
    buttons[1].classList.remove('active');
}

function showStaffIn() {
    document.getElementById('staffOutForm').style.display = 'none';
    document.getElementById('staffInForm').style.display = 'block';
    
    // Update button styles
    const buttons = document.querySelectorAll('.action-select-btn');
    buttons[0].classList.remove('active');
    buttons[1].classList.add('active');
}

// Submit staff going out
async function submitStaffOut() {
    const staffId = document.getElementById('staffIdOut').value.trim();
    const purpose = document.getElementById('staffPurposeOut').value.trim();

    if (!staffId || !purpose) {
        showMessage('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.staffOut, {
            method: 'POST',
            body: JSON.stringify({ staffId, purpose })
        });

        if (response.success) {
            showMessage(`✅ Exit recorded successfully! Time: ${new Date().toLocaleTimeString()}`, 'success');
            
            // Reset form
            setTimeout(() => {
                document.getElementById('staffIdOut').value = '';
                document.getElementById('staffPurposeOut').value = '';
            }, 2000);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to record exit', 'error');
    }
}

// Submit staff coming in
async function submitStaffIn() {
    const staffId = document.getElementById('staffIdIn').value.trim();

    if (!staffId) {
        showMessage('Please enter your Staff ID', 'error');
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.staffIn, {
            method: 'POST',
            body: JSON.stringify({ staffId })
        });

        if (response.success) {
            showMessage(`✅ Entry recorded successfully! Time: ${new Date().toLocaleTimeString()}`, 'success');
            
            // Reset form
            setTimeout(() => {
                document.getElementById('staffIdIn').value = '';
            }, 2000);
        }
    } catch (error) {
        showMessage(error.message || 'Failed to record entry', 'error');
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
