# URL Configuration Guide

Your Trackify app now supports **both local development and Render deployment** with automatic URL detection!

## How It Works

### 1. **Local Development (Laptop/ngrok)**
When you run the app locally, it automatically uses `http://localhost:3001`

**For ngrok:**
1. Start your server: `npm start`
2. In another terminal, start ngrok: `ngrok http 3001`
3. Copy your ngrok URL (e.g., `https://abc123.ngrok.io`)
4. Update `backend/.env`:
   ```
   APP_URL=https://abc123.ngrok.io
   ```
5. Restart your server
6. Your QR code will now use the ngrok URL!

### 2. **Render Deployment**
On Render, it automatically uses `https://trackify-deploy.onrender.com`

**Environment Variables on Render:**
- Go to your Render dashboard → Environment
- The system automatically sets `RENDER_EXTERNAL_URL`
- No manual configuration needed!

### 3. **Frontend (Browser)**
The frontend (`public/js/config.js`) automatically detects:
- If you're on `localhost`, it uses `http://localhost:3001`
- If you're on Render, it uses `https://trackify-deploy.onrender.com`

## Quick Setup

### Local Development:
```env
APP_URL=http://localhost:3001
```

### With ngrok:
```env
APP_URL=https://your-ngrok-url.ngrok.io
```

### Render (already configured):
No changes needed - it uses `RENDER_EXTERNAL_URL` automatically!

## Testing

1. **Local:** Visit `http://localhost:3001/scan`
2. **ngrok:** Visit `https://your-ngrok-url.ngrok.io/scan`
3. **Render:** Visit `https://trackify-deploy.onrender.com/scan`

All URLs should work correctly!
