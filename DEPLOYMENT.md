# Deployment Guide for Abelus E-Commerce

## 🎯 Quick Deployment Guide

This guide will help you deploy your application for **FREE** to showcase to sponsors.

---

## Prerequisites

✅ MongoDB Atlas account (already set up)
✅ GitHub account
✅ Vercel account (sign up with GitHub)
✅ Render account (sign up with GitHub)

---

## Step 1: Prepare Your Code

### 1.1 Update .gitignore (Already Done ✓)
Your `.gitignore` is already configured to exclude:
- `node_modules/`
- `.env` files
- `build/` folders
- `uploads/` directory

### 1.2 Create Environment Templates
Create `env.example` files to help with deployment:

**Backend** (`abelus-backend/env.example`):
```bash
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## Step 2: Push to GitHub

```bash
# Navigate to project root
cd d:/Benit/FYP/abelus

# Check what will be committed
git status

# Add all files (respects .gitignore)
git add .

# Commit changes
git commit -m "Prepare for deployment: Rwanda e-commerce platform"

# Push to GitHub
git push origin main
```

If you haven't initialized Git yet:
```bash
git init
git add .
git commit -m "Initial commit: Rwanda e-commerce platform"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

---

## Step 3: Deploy Backend to Render

### 3.1 Create Web Service
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `abelus-backend`
   - **Root Directory**: `abelus/abelus-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3.2 Add Environment Variables
Go to **Environment** tab and add:
```
MONGODB_URI = <your MongoDB Atlas connection string>
JWT_SECRET = <generate a strong secret>
JWT_REFRESH_SECRET = <generate another strong secret>
NODE_ENV = production
FRONTEND_URL = https://your-app.vercel.app (update after frontend deploy)
PORT = 5000
```

### 3.3 Deploy
Click **"Create Web Service"** - deployment will start automatically!

**Important**: Copy your backend URL (e.g., `https://abelus-backend.onrender.com`)

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Prepare Frontend
Update API base URL in your frontend code if hardcoded.

Check `src/utils/axiosInstance.js` or similar:
```javascript
// Should use environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### 4.2 Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `abelus/abelus-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 4.3 Add Environment Variable
```
REACT_APP_API_URL = https://abelus-backend.onrender.com
```

### 4.4 Deploy
Click **"Deploy"** - done in ~2 minutes!

Your app will be live at: `https://abelus-<random>.vercel.app`

---

## Step 5: Final Configuration

### 5.1 Update Backend CORS
Go back to Render → Environment Variables:
```
FRONTEND_URL = https://your-actual-frontend.vercel.app
```

Click "Save Changes" - will auto-redeploy

### 5.2 Update MongoDB Atlas Network Access
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to Render's IPs

### 5.3 Test Your Deployment
Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can complete checkout
- [ ] Admin login works

---

## 🎯 For Sponsor Demo

### Keep App Awake (Render Free Tier)
Render free tier sleeps after 15 minutes of inactivity.

**Solution**: Use [cron-job.org](https://cron-job.org) (free):
1. Create account
2. Add new cron job
3. URL: `https://abelus-backend.onrender.com/health` (create this endpoint)
4. Interval: Every 10 minutes

**Add Health Endpoint** (backend):
```javascript
// In server.js or routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});
```

### Presentation Tips
1. **Warm up the app** 5 minutes before demo
2. **Have screenshots ready** as backup
3. **Prepare a video walkthrough** in case of connectivity issues
4. **Mention the free tier** - shows resourcefulness
5. **Highlight scalability plan** - "Once funded, we'll upgrade to production-grade hosting"

---

## 🚀 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] MongoDB connected successfully
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Test complete user flow
- [ ] Admin panel accessible
- [ ] Keep-alive cron job set up (optional)
- [ ] Demo data populated
- [ ] Screenshots/video backup prepared

---

## 🆘 Troubleshooting

### Backend Not Connecting to MongoDB
- Check MongoDB Atlas → Network Access allows 0.0.0.0/0
- Verify `MONGODB_URI` in Render environment variables
- Check Render logs for connection errors

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Include `https://` in the URL
- Restart backend after changing environment variables

### Frontend API Calls Failing
- Verify `REACT_APP_API_URL` points to correct Render URL
- Check Render backend is running (not sleeping)
- Open browser DevTools → Network tab for error details

### Images Not Loading
- Ensure images are in `public/` folder (frontend)
- For uploaded images, consider using Cloudinary (free tier) instead of local uploads

---

## 💰 Upgrade Path (When Funded)

**Phase 1: Sponsors Secured**
- Vercel Pro: $20/month (better performance)
- Render Standard: $7/month (no sleeping, better resources)

**Phase 2: Growth Stage**
- DigitalOcean Droplet: $12-24/month
- AWS S3 for image storage
- Cloudflare CDN

**Phase 3: Scale**
- Kubernetes cluster
- Load balancers
- CDN for global reach

---

## 📞 Support

If you run into issues during deployment, check:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

Good luck with your demo! 🎉
