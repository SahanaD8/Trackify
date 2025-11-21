# 🎯 TRACKIFY - Visitor Management & Staff Tracking System

A comprehensive cloud-based visitor management and staff entry/exit tracking system with QR code scanning, real-time notifications, and role-based dashboards.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Roles & Workflows](#user-roles--workflows)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security Features](#security-features)

## ✨ Features

### Visitor Management
- ✅ QR code-based check-in/check-out
- ✅ New visitor registration with OTP verification
- ✅ Returning visitor quick check-in
- ✅ Purpose and whom-to-meet tracking
- ✅ Automatic time stamping (fraud prevention)
- ✅ SMS notifications for approval status

### Staff Tracking
- ✅ QR code-based entry/exit logging
- ✅ Purpose tracking for exits
- ✅ Automatic time recording
- ✅ SMS notifications for visitor requests

### Receptionist Dashboard
- ✅ View pending visitor requests
- ✅ Accept/reject visitor entries
- ✅ Send automatic SMS notifications
- ✅ Alert staff about visitors
- ✅ Real-time statistics

### Security Dashboard
- ✅ View all visitor and staff movements
- ✅ Color-coded approval status
- ✅ Real-time monitoring
- ✅ Current campus status

### Principal Dashboard
- ✅ Daily automated reports (6 PM)
- ✅ Custom date range reports
- ✅ Numbered visitor and staff lists
- ✅ CSV export functionality
- ✅ Analytics and statistics

## 🛠 Technology Stack

### Frontend
- HTML5
- CSS3 (Responsive Design)
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MySQL2

### Database
- MySQL

### Server
- Apache (for production)
- Node.js built-in server (for development)

### Additional Services
- Twilio (SMS notifications)
- Gmail SMTP (Email notifications)
- ngrok (Local development tunneling)

## 🏗 System Architecture

```
┌─────────────────┐
│   QR Code       │
│   (Security ID) │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Visitor/Staff Scan & Form Entry    │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│      Backend API (Node.js)          │
│  - Authentication (OTP)             │
│  - Visitor Management               │
│  - Staff Tracking                   │
│  - Notifications (SMS)              │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│      MySQL Database                 │
│  - Visitors, Staff, Visits          │
│  - Logs, Users, OTP                 │
└─────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│   Dashboards (Role-based)           │
│  - Receptionist                     │
│  - Security                         │
│  - Principal                        │
└─────────────────────────────────────┘
```

## 📥 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Step 1: Clone/Download Project
```powershell
cd "c:\Users\v_a_venkat\Documents\ThanujaV\Visitor Management"
```

### Step 2: Install Dependencies
```powershell
cd backend
npm install
```

## 💾 Database Setup

### Step 1: Create Database
1. Open MySQL Workbench or command line
2. Run the following commands:

```sql
mysql -u root -p
```

### Step 2: Import Schema
```sql
source "c:/Users/v_a_venkat/Documents/ThanujaV/Visitor Management/database/schema.sql"
```

Or manually execute the `schema.sql` file in MySQL Workbench.

### Step 3: Verify Database
```sql
USE trackify_db;
SHOW TABLES;
```

You should see:
- visitors
- visitor_visits
- staff
- staff_logs
- receptionist
- security
- principal
- otp_verification
- sms_notifications

## ⚙️ Configuration

### Step 1: Create Environment File
Copy `.env.example` to `.env`:

```powershell
cd backend
Copy-Item .env.example .env
```

### Step 2: Configure Environment Variables

Edit `backend/.env` with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trackify_db
DB_PORT=3306

# JWT Secret (change this!)
JWT_SECRET=your_secure_random_secret_key_here

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# QR Code URL
QR_CODE_URL=http://localhost:3000/scan
APP_URL=http://localhost:3000
```

### Step 3: Configure Default Users

The default admin accounts are created automatically:

**Receptionist:**
- Phone: 1234567890
- Password: Use OTP login

**Security:**
- Phone: 9876543210
- Password: Use OTP login

**Principal:**
- Phone: 5555555555
- Password: Use OTP login

**Note:** In production, change these default credentials!

## 🚀 Running the Application

### Development Mode

```powershell
# From backend directory
cd backend
npm run dev
```

### Production Mode

```powershell
# From backend directory
cd backend
npm start
```

The application will be available at:
- Main App: http://localhost:3000
- QR Scan: http://localhost:3000/scan

## 👥 User Roles & Workflows

### 1️⃣ Visitor Workflow

#### New Visitor:
1. Scan QR code on security ID card
2. Select "Visitor" role
3. Click "Check-in"
4. Enter phone number → Click "Check"
5. Fill: Name, Place
6. Click "Send OTP" → Enter OTP
7. Click "Continue"
8. Fill: Purpose, Whom to Meet
9. Submit → Wait for SMS (Accepted/Rejected)
10. After visit, scan QR → Select "Check-out"
11. Enter phone number → Submit

#### Returning Visitor:
1. Scan QR code
2. Enter phone number → Click "Check"
3. Fill: Purpose, Whom to Meet
4. Submit → Wait for SMS
5. Check-out same as above

### 2️⃣ Staff Workflow

#### Going Out:
1. Scan QR code
2. Select "Staff" role
3. Click "Going Out"
4. Enter: Staff ID, Purpose
5. Submit

#### Coming In:
1. Scan QR code
2. Select "Staff" role
3. Click "Coming In"
4. Enter: Staff ID
5. Submit

### 3️⃣ Receptionist Workflow

1. Login with phone number & OTP
2. View pending visitor requests
3. Click "Accept" (green) or "Reject" (red)
4. System sends SMS to visitor
5. If accepted + meeting staff → SMS sent to staff
6. Monitor all visits in dashboard

### 4️⃣ Security Workflow

1. Login with phone number & OTP
2. View all visitors and their status
3. Check color indicators:
   - 🟢 Green = Accepted (Allow entry)
   - 🔴 Red = Rejected (Deny entry)
   - 🟡 Yellow = Pending
4. Monitor staff movements

### 5️⃣ Principal Workflow

1. Login with phone number & OTP
2. View dashboard statistics
3. Generate reports:
   - Click "Today's Report" for daily report
   - Select date range → Click "Generate Report"
4. Download reports as CSV
5. Receive automated daily SMS at 6 PM

## 📡 API Documentation

### Authentication Endpoints

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "userType": "visitor|receptionist|security|principal"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "otp": "123456",
  "userType": "receptionist|security|principal"
}
```

### Visitor Endpoints

#### Check Visitor
```http
GET /api/visitors/check/:phoneNumber
```

#### Register Visitor
```http
POST /api/visitors/register
Content-Type: application/json

{
  "name": "John Doe",
  "phoneNumber": "1234567890",
  "place": "New York",
  "otp": "123456"
}
```

#### Visitor Check-in
```http
POST /api/visitors/check-in
Content-Type: application/json

{
  "phoneNumber": "1234567890",
  "purpose": "Meeting",
  "whomToMeet": "Dr. Smith"
}
```

#### Visitor Check-out
```http
POST /api/visitors/check-out
Content-Type: application/json

{
  "phoneNumber": "1234567890"
}
```

### Staff Endpoints

#### Staff Check-out (Going Out)
```http
POST /api/staff/check-out
Content-Type: application/json

{
  "staffId": "STAFF001",
  "purpose": "Lunch break"
}
```

#### Staff Check-in (Coming In)
```http
POST /api/staff/check-in
Content-Type: application/json

{
  "staffId": "STAFF001"
}
```

### Receptionist Endpoints

#### Get Pending Visits
```http
GET /api/receptionist/pending-visits
Authorization: Bearer {token}
```

#### Process Visit
```http
POST /api/receptionist/process-visit
Authorization: Bearer {token}
Content-Type: application/json

{
  "visitId": 1,
  "action": "accept|reject",
  "receptionistId": 1
}
```

### Security Endpoints

#### Get Visitor Visits
```http
GET /api/security/visitor-visits
Authorization: Bearer {token}
```

#### Get Staff Logs
```http
GET /api/security/staff-logs
Authorization: Bearer {token}
```

### Principal Endpoints

#### Get Daily Report
```http
GET /api/principal/daily-report?date=2024-01-15
Authorization: Bearer {token}
```

#### Get Date Range Report
```http
GET /api/principal/report-range?fromDate=2024-01-01&toDate=2024-01-15
Authorization: Bearer {token}
```

## 🌐 Deployment

### Option 1: Deploy to Render.com (Recommended)

1. Create account on [Render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure environment variables from `.env`
5. Deploy automatically

**Note:** You'll need to migrate from MySQL to PostgreSQL for Render deployment.

### Option 2: Deploy to Traditional Hosting

1. Set up Apache/Nginx server
2. Configure MySQL database
3. Upload backend files
4. Upload frontend files to public directory
5. Configure environment variables
6. Start Node.js process (use PM2)

```bash
npm install -g pm2
pm2 start backend/server.js --name trackify
pm2 save
pm2 startup
```

## 🔒 Security Features

- ✅ OTP-based authentication
- ✅ JWT token validation
- ✅ Automatic time stamping (fraud prevention)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control

## 📱 SMS Notification Setup (Twilio)

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Get a Twilio phone number
4. Update `.env` file with credentials
5. Test SMS functionality

**Development Mode:** SMS messages are logged to console instead of sending actual SMS.

## 🧪 Testing

### Test Credentials (Development)

Use these phone numbers for testing:

- Receptionist: 1234567890
- Security: 9876543210
- Principal: 5555555555
- Test Visitor: Any 10-digit number
- Test Staff: Use STAFF001, STAFF002, STAFF003

OTP will be displayed in console during development.

## 🐛 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `trackify_db` exists

### SMS Not Sending
- Check Twilio credentials
- Verify phone number format (+country code)
- In development, check console for OTP

### Port Already in Use
Change PORT in `.env` file or kill the process:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check console logs for errors

## 📄 License

This project is created for educational purposes.

## 🙏 Acknowledgments

- QR Code functionality
- Twilio for SMS services
- MySQL for database
- Express.js for backend framework

---

**Built with ❤️ for efficient visitor management and staff tracking**
