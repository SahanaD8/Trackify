# TRACKIFY - Local Setup Guide

## Prerequisites to Install on New Laptop

### 1. **Node.js** (Required)
- Download: https://nodejs.org/
- Install version 18 or higher
- Verify: `node --version` and `npm --version`

### 2. **MySQL Database** (Required)
- Option 1: XAMPP (Recommended for Windows)
  - Download: https://www.apachefriends.org/
  - Install and start MySQL service
- Option 2: MySQL Standalone
  - Download: https://dev.mysql.com/downloads/mysql/
- Default port: 3306

### 3. **Git** (Required)
- Download: https://git-scm.com/downloads
- For cloning the repository

### 4. **ngrok** (Required for external access)
- Download: https://ngrok.com/download
- Unzip to any folder (e.g., Desktop)
- No installation needed, just run the exe

---

## Setup Steps on New Laptop

### Step 1: Clone Repository
```powershell
cd C:\Users\YourName\Documents
git clone https://github.com/SahanaD8/Trackify.git
cd Trackify
```

### Step 2: Create Environment File
Create a file named `.env` in the `backend` folder with this content:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=trackify_db
DB_PORT=3306

# JWT Secret
JWT_SECRET=TrAcKiFy_S3cReT_K3y_2024_Ch4nG3_Th1s_1n_Pr0dUcT10n

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=AC148205181815a57a26c110b2a10c5013
TWILIO_AUTH_TOKEN=14d0e5b63ee52bcd199bd17f2b397522
TWILIO_PHONE_NUMBER=+919014514961

# Email Configuration (Use your Gmail)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@ksit.edu.in
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=TRACKIFY Visitor Management <your_email@ksit.edu.in>
```

**IMPORTANT:** Replace `EMAIL_USER` and `EMAIL_PASSWORD` with your Gmail credentials
- Generate app password: https://myaccount.google.com/apppasswords

### Step 3: Install Backend Dependencies
```powershell
cd backend
npm install
```

### Step 4: Set Up MySQL Database

**Option A: Using XAMPP**
1. Open XAMPP Control Panel
2. Start MySQL
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create new database: `trackify_db`
5. Import database schema (if you have SQL file) OR create tables manually

**Option B: Using MySQL Command Line**
```sql
CREATE DATABASE trackify_db;
USE trackify_db;

-- Create tables (staff, visitors, visitor_visits, staff_logs, otps)
-- Run your SQL schema file here
```

### Step 5: Start the Server
```powershell
# From backend folder
node server.js
```

You should see:
```
✅ Twilio initialized successfully
✅ Database connected successfully
✅ Email service initialized successfully
🚀 TRACKIFY Server running on port 3001
```

### Step 6: Start ngrok (For External Access)
```powershell
# Open new PowerShell window
cd C:\path\to\ngrok
.\ngrok.exe http 3001
```

Copy the HTTPS URL (e.g., `https://xyz-abc.ngrok-free.dev`)

### Step 7: Update Frontend Configuration
Edit `public/js/config.js`:
```javascript
const API_BASE_URL = 'https://your-ngrok-url.ngrok-free.dev/api';
```

### Step 8: Generate QR Code
```powershell
# Update backend/generate-qr.js with your ngrok URL first
# Then run:
cd backend
node generate-qr.js
```

Print the QR code from `public/qr-codes/trackify-qr-code.png`

---

## What You DON'T Need on New Laptop

❌ **Cloud services** - Everything runs locally (until you deploy to Render)

---

## Daily Startup Commands

### Start Everything (3 commands in separate terminals):

**Terminal 1: Start MySQL**
- Open XAMPP → Start MySQL

**Terminal 2: Start Backend Server**
```powershell
cd C:\path\to\Trackify\backend
node server.js
```

**Terminal 3: Start ngrok**
```powershell
cd C:\path\to\ngrok
.\ngrok.exe http 3001
```

**Update frontend** with new ngrok URL in `public/js/config.js` each time ngrok restarts

---

## Access URLs

- **Visitor QR Scan:** https://your-ngrok-url/qr-scan.html
- **Receptionist Dashboard:** https://your-ngrok-url/receptionist-dashboard.html
- **Security Dashboard:** https://your-ngrok-url/security-dashboard.html
- **Principal Dashboard:** https://your-ngrok-url/principal-dashboard.html

---

## Troubleshooting

### MySQL not connecting
- Check if MySQL is running in XAMPP
- Verify database name is `trackify_db`
- Check credentials in `.env` file

### Email not working
- Verify Gmail app password is correct
- Enable 2-Step Verification in Google Account
- Generate new app password if needed

### ngrok URL changes
- Update `public/js/config.js` with new URL
- Regenerate QR code with new URL

---

## Database Schema Required

Make sure to create these tables in `trackify_db`:

1. **visitors** - Stores visitor information
2. **staff** - Stores staff details
3. **visitor_visits** - Tracks visitor check-in/out
4. **staff_logs** - Tracks staff attendance
5. **otps** - Stores OTPs for verification

(Include your full SQL schema here if you have it)

---

## Notes

- **Mobile hotspot required** for Gmail SMTP to work
- **ngrok URL changes** every restart (unless using paid ngrok)
- **QR code must be regenerated** when ngrok URL changes
- **.env file must be created manually** (not in GitHub for security)
