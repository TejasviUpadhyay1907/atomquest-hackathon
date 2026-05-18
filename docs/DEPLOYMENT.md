# Deployment Guide

## Backend (Render) ✅ DEPLOYED
**URL:** https://atomquest-backend-33sg.onrender.com
**Status:** Live and working

## Frontend (Vercel) - Deploy Now

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to frontend folder:
```bash
cd frontend
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel --prod
```

5. When prompted, set:
   - **Project Name:** atomquest-frontend
   - **Framework:** Vite
   - **Build Command:** npm run build
   - **Output Directory:** dist
   - **Install Command:** npm install

6. Set environment variable:
```bash
vercel env add VITE_API_URL production
```
Enter value: `https://atomquest-backend-33sg.onrender.com`

### Option 2: Vercel Dashboard (Easier)

1. Go to https://vercel.com/new

2. Import from GitHub:
   - Repository: `TejasviUpadhyay1907/atomquest-hackathon`
   - Root Directory: `frontend`

3. Configure Project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://atomquest-backend-33sg.onrender.com`

5. Click **Deploy**

### After Deployment

Your app will be live at: `https://atomquest-frontend.vercel.app` (or custom domain)

Test the deployment:
1. Visit the URL
2. Try logging in with test credentials
3. Check if API calls work (check browser console)

## Environment Variables Summary

### Backend (Render) - Already Set ✅
- `DATABASE_URL`
- `SECRET_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Frontend (Vercel) - Need to Set
- `VITE_API_URL=https://atomquest-backend-33sg.onrender.com`

## Troubleshooting

### CORS Issues
If you see CORS errors, the backend is already configured to allow all origins.

### API Connection Issues
1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly in Vercel
3. Test backend directly: https://atomquest-backend-33sg.onrender.com/docs

### Build Failures
1. Make sure Node.js version is 18+ in Vercel settings
2. Check build logs for specific errors
3. Verify all dependencies are in package.json
