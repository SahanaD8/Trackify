# 🚀 TRACKIFY Render Deployment Guide

This guide will walk you through deploying TRACKIFY to Render.com with PostgreSQL database.

## 📋 Prerequisites

- GitHub account with your code pushed to repository
- Render.com account (sign up at https://render.com)
- Your Gmail app password ready

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your GitHub Repository

✅ **Already Done!** Your code is at: https://github.com/SahanaD8/Trackify.git

### Step 2: Sign Up/Login to Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account
4. Authorize Render to access your GitHub repositories

### Step 3: Create PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name:** `trackify-db`
   - **Database:** `trackify_db`
   - **User:** `trackify_user`
   - **Region:** Singapore (or closest to you)
   - **Plan:** Free
3. Click **"Create Database"**
4. Wait for database to provision (1-2 minutes)
5. **Copy the "Internal Database URL"** - you'll need this later

### Step 4: Initialize Database Schema

1. In the PostgreSQL database page, click **"Connect"** → **"External Connection"**
2. Copy the **PSQL Command**
3. Open your local terminal and run:
   ```bash
   # Install PostgreSQL client if not installed
   # Then paste the PSQL command from Render
   ```
4. Once connected, copy and paste the contents of `database/postgresql-schema.sql`
5. Or use Render's **Query** tab to paste and execute the schema

### Step 5: Create Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect to GitHub repository: **SahanaD8/Trackify**
3. Configure service:
   - **Name:** `trackify-backend`
   - **Region:** Singapore (same as database)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables:**

   Click **"Advanced"** → **"Add Environment Variable"** and add these:

   ```
   NODE_ENV=production
   PORT=3001
   
   # Database (use Internal Database URL from Step 3)
   DATABASE_URL=<paste-internal-database-url-here>
   DB_PORT=5432
   
   # JWT Secret (generate random string)
   JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
   
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=vunnamthanuja_cse2023@ksit.edu.in
   EMAIL_PASSWORD=bqon holg pzcf sduj
   EMAIL_FROM=TRACKIFY Visitor Management <vunnamthanuja_cse2023@ksit.edu.in>
   
   # Staff Notifications (Email only)
   STAFF_1_EMAIL=krishnagudi@ksit.edu.in
   STAFF_2_EMAIL=shruthits@ksit.edu.in
   ```

5. Click **"Create Web Service"**
6. Wait for deployment (3-5 minutes)
7. **Copy the service URL** (will be like: `https://trackify-backend.onrender.com`)

### Step 6: Create Frontend Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect to same GitHub repository: **SahanaD8/Trackify**
3. Configure service:
   - **Name:** `trackify-frontend`
   - **Region:** Singapore
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Build Command:** `echo "No build required"`
   - **Publish Directory:** `public`
   - **Plan:** Free

4. **Add Environment Variable:**
   ```
   API_BASE_URL=https://trackify-backend.onrender.com
   ```

5. Click **"Create Static Site"**

### Step 7: Update Frontend Configuration

1. Open `public/js/config.js` in your local repository
2. Update the API_BASE_URL:
   ```javascript
   const API_BASE_URL = 'https://trackify-backend.onrender.com';
   ```
3. Commit and push:
   ```bash
   git add public/js/config.js
   git commit -m "Update API URL for Render deployment"
   git push origin main
   ```
4. Render will auto-deploy the changes

### Step 8: Generate New QR Code

1. Update `backend/generate-qr.js` with your Render frontend URL
2. Run locally:
   ```bash
   cd backend
   node generate-qr.js
   ```
3. The QR code will point to: `https://trackify-frontend.onrender.com/qr-scan.html`
4. Commit and push:
   ```bash
   git add public/qr-codes/trackify-qr-code.png
   git commit -m "Update QR code for Render deployment"
   git push origin main
   ```

### Step 9: Test Your Deployment

1. **Frontend:** Visit `https://trackify-frontend.onrender.com`
2. **Test Login:**
   - Receptionist: username: `receptionist`, password: `admin123`
   - Security: username: `security`, password: `admin123`
   - Principal: username: `principal`, password: `admin123`
3. **Test QR Scan:** Print and scan the QR code

## 🔧 Important Notes

### Free Tier Limitations
- **Backend:** Spins down after 15 minutes of inactivity
  - First request after spin-down takes 30-60 seconds
  - 750 hours/month free (enough for 24/7 operation)
- **Database:** 90 days data retention, 1GB storage, 97 connections
- **Frontend:** Always active, unlimited bandwidth

### Auto-Deploy
- Any push to GitHub `main` branch automatically deploys
- Check deployment logs in Render dashboard

### Database Backups
- Free tier: Manual backups only
- Go to Database → Backups → Create Backup

### Custom Domain (Optional)
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed

## 📊 Monitoring

### View Logs
- Backend: `trackify-backend` → Logs tab
- Database: `trackify-db` → Logs tab
- Frontend: `trackify-frontend` → Logs tab

### Metrics
- Check CPU, Memory usage in Metrics tab
- Monitor request counts and response times

## 🆘 Troubleshooting

### Backend Not Starting
1. Check Logs for errors
2. Verify all environment variables are set
3. Ensure DATABASE_URL is correct

### Database Connection Failed
1. Verify DATABASE_URL format
2. Check PostgreSQL service is running
3. Review database logs

### Frontend Can't Reach Backend
1. Check CORS settings in backend
2. Verify API_BASE_URL in `config.js`
3. Check backend service is running

### QR Code Not Working
1. Regenerate with correct Render URL
2. Ensure `qr-scan.html` exists in public folder
3. Check frontend service is accessible

## 🎉 Success!

Your TRACKIFY system is now running 24/7 on Render.com!

**Your URLs:**
- Frontend: `https://trackify-frontend.onrender.com`
- Backend API: `https://trackify-backend.onrender.com`
- Database: Internal connection only

## 💰 Cost Breakdown

- PostgreSQL Database: **FREE** (1GB, 90 days retention)
- Backend Web Service: **FREE** (750 hours/month)
- Frontend Static Site: **FREE** (100GB bandwidth/month)
- **Total: ₹0/month** 🎊

## 📝 Next Steps

1. ✅ Update staff emails if needed
2. ✅ Print the new QR code
3. ✅ Test all workflows
4. ✅ Monitor logs for first few days
5. ✅ Set up manual database backups weekly
