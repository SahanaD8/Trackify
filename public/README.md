Trackify/
│
├── backend/                         # Node.js backend (for notifications)
│   ├── api/
│   │   ├── notifyReception.js        # Notify receptionist when visitor scans QR
│   │   ├── notifySecurity.js         # Notify security about approvals
│   │   ├── notifyVisitor.js          # Notify visitor via SMS
│   ├── notification.js               # Common notification logic (Twilio/Nodemailer)
│   ├── server.js                     # Main Node.js backend server (Express)
│   ├── .env                          # Contains API keys, credentials
│
├── database/                         # PHP backend (DB logic)
│   ├── connection.php                # MySQL connection
│   ├── create_tables.sql             # SQL schema for all user tables
│   ├── insert_visitor.php            # Adds visitor record when QR is scanned
│   ├── update_visitor.php            # Updates visitor status and out-time
│   ├── fetch_visitors.php            # Fetches all visitor logs
│   ├── fetch_staff.php               # Fetches staff logs
│   ├── staff_log.php                 # Handles staff in/out
│   ├── visitor_exit.php              # Visitor exit update
│   ├── report_generation.php         # Daily report for principal
│
├── qr/                               # QR code logic (shared QR for all)
│   ├── generateQR.php                # Generates one master QR (for printing)
│   ├── scanQR.php                    # Handles QR scanning via webcam
│
├── public/                           # FRONTEND (HTML + CSS + JS)
│   ├── index.html                    # Home / scan entry page
│   ├── scan.html                     # QR scan page for both staff & visitor
│   │
│   ├── visitor/
│   │   ├── new_visitor.html          # New visitor registration
│   │   ├── visitor_purpose.html      # Purpose entry page
│   │   ├── visitor_dashboard.html    # Shows visitor entry confirmation
│   │   ├── visitor_exit.html         # QR scan for exit
│   │
│   ├── staff/
│   │   ├── staff_scan.html           # Staff QR scan page (in/out)
│   │   ├── staff_dashboard.html      # Staff info page
│   │
│   ├── receptionist/
│   │   ├── receptionist_login.html   # Receptionist login
│   │   ├── receptionist_dashboard.html # Shows visitor entries to approve/reject
│   │
│   ├── security/
│   │   ├── security_login.html       # Security login
│   │   ├── security_dashboard.html   # Shows green/red entry permissions
│   │
│   ├── principal/
│   │   ├── principal_login.html
│   │   ├── principal_dashboard.html  # View daily report after 6pm
│   │
│   ├── assets/
│   │   ├── styles.css                # Common styling
│   │   ├── qrscan.js                 # QR scanner logic (html5-qrcode)
│   │   ├── otp.js                    # OTP handling for visitors
│   │   ├── main.js                   # Shared JS logic
│   │
│   └── images/                       # Icons, QR code image, branding
│
├── logs/
│   ├── staff_log.txt                 # Local log of staff activity
│   ├── visitor_log.txt               # Local log of visitor activity
│
├── node_modules/
│
├── package.json
├── package-lock.json
├── README.md

