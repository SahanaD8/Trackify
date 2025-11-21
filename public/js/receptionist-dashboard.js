// Receptionist Dashboard JavaScript

// Check authentication on page load
if (!checkAuth()) {
    window.location.href = 'receptionist-login.html';
}

const userData = getUserData();
let receptionistId = userData?.user?.id;

// Load dashboard data
async function loadDashboard() {
    await Promise.all([
        loadStats(),
        loadPendingVisits(),
        loadAllVisits()
    ]);
}

// Load statistics
async function loadStats() {
    try {
        const response = await apiRequest(API_ENDPOINTS.receptionistStats);

        if (response.success) {
            const stats = response.stats;
            document.getElementById('pendingCount').textContent = stats.pending || 0;
            document.getElementById('acceptedCount').textContent = stats.accepted || 0;
            document.getElementById('rejectedCount').textContent = stats.rejected || 0;
            document.getElementById('totalCount').textContent = stats.total_visits || 0;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Load pending visits
async function loadPendingVisits() {
    try {
        const response = await apiRequest(API_ENDPOINTS.pendingVisits);

        if (response.success && response.visits.length > 0) {
            const tbody = document.getElementById('pendingVisitsBody');
            tbody.innerHTML = response.visits.map(visit => `
                <tr>
                    <td>${visit.name}</td>
                    <td>${visit.phone_number}</td>
                    <td>${visit.place}</td>
                    <td>${visit.purpose}</td>
                    <td>${visit.whom_to_meet}</td>
                    <td>${formatDateTime(visit.in_time)}</td>
                    <td>
                        <button class="btn-accept" onclick="processVisit(${visit.id}, 'accept')">
                            ✓ Accept
                        </button>
                        <button class="btn-reject" onclick="processVisit(${visit.id}, 'reject')">
                            ✗ Reject
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('pendingVisitsBody').innerHTML = 
                '<tr><td colspan="7" class="no-data">No pending requests</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load pending visits:', error);
    }
}

// Load all visits
async function loadAllVisits() {
    try {
        const response = await apiRequest(API_ENDPOINTS.allVisits);

        if (response.success && response.visits.length > 0) {
            const tbody = document.getElementById('allVisitsBody');
            tbody.innerHTML = response.visits.map(visit => `
                <tr>
                    <td>${visit.name}</td>
                    <td>${visit.phone_number}</td>
                    <td>${visit.purpose}</td>
                    <td>${visit.whom_to_meet}</td>
                    <td>${formatDateTime(visit.in_time)}</td>
                    <td>${visit.out_time ? formatDateTime(visit.out_time) : 'Not checked out'}</td>
                    <td>
                        <span class="status-badge status-${visit.status}">
                            ${visit.status.toUpperCase()}
                        </span>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('allVisitsBody').innerHTML = 
                '<tr><td colspan="7" class="no-data">No visits today</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load visits:', error);
    }
}

// Process visit (accept/reject)
async function processVisit(visitId, action) {
    if (!confirm(`Are you sure you want to ${action} this visit?`)) {
        return;
    }

    try {
        const response = await apiRequest(API_ENDPOINTS.processVisit, {
            method: 'POST',
            body: JSON.stringify({
                visitId,
                action,
                receptionistId
            })
        });

        if (response.success) {
            showMessage(`Visit ${action}ed successfully! SMS sent to visitor.`, 'success');
            
            // Reload data
            await loadDashboard();
        }
    } catch (error) {
        showMessage(error.message || `Failed to ${action} visit`, 'error');
    }
}

// Auto-refresh every 30 seconds
setInterval(() => {
    loadDashboard();
}, 30000);

// Load dashboard on page load
loadDashboard();
