# Deployment Guide: AI Research Assistant

## Overview
- **Backend**: Deploy to Render (FastAPI)
- **Frontend**: Deploy to Vercel (React)
- **Estimated time**: 15-20 minutes

---

## Pre-Deployment Checklist

- [ ] Push project to GitHub
- [ ] Have Render and Vercel accounts ready
- [ ] Generate OpenAI API key (if using LLM)
- [ ] Update CORS origins for production URLs

---

## Step 1: Push to GitHub

```bash
# In project root
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
Go to [render.com](https://render.com) and sign up.

### 2.2 Connect GitHub
- Dashboard → "New" → "Web Service"
- Select "Build and deploy from a Git repository"
- Connect your GitHub account and authorize
- Select your `ai-research-assistant` repository

### 2.3 Configure Backend Service

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `ai-research-assistant-backend` |
| **Environment** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| **Root Directory** | `backend` |
| **Plan** | Free (or Starter) |

### 2.4 Add Environment Variables

Click "Advanced" → "Add Environment Variable"

```
OPENAI_API_KEY = your_api_key_here
```

(Optional - only if you're using LLM features)

### 2.5 Deploy
Click "Create Web Service" and wait 5-10 minutes for deployment.

**Your backend URL will be something like:**
```
https://ai-research-assistant-backend.onrender.com
```

---

## Step 3: Update Frontend API URL

After backend is deployed, update the frontend to use the production backend URL.

### 3.1 Create `.env.production` in frontend:

```bash
# frontend/.env.production
VITE_API_BASE_URL=https://ai-research-assistant-backend.onrender.com
```

### 3.2 Update `frontend/src/services/api.js`:

Replace `http://127.0.0.1:8000` with environment variable:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});
```

### 3.3 Push changes:

```bash
git add .
git commit -m "Update API base URL for production"
git push origin main
```

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
Go to [vercel.com](https://vercel.com) and sign up with GitHub.

### 4.2 Import Project
- Dashboard → "Add New..." → "Project"
- Select your `ai-research-assistant` repository
- Click "Import"

### 4.3 Configure Project

**Framework Preset**: React
**Root Directory**: `frontend`
**Build Command**: `npm run build`
**Output Directory**: `dist`

### 4.4 Add Environment Variables

Add environment variable:

```
VITE_API_BASE_URL = https://ai-research-assistant-backend.onrender.com
```

### 4.5 Deploy
Click "Deploy" and wait 2-3 minutes.

**Your frontend URL will be something like:**
```
https://ai-research-assistant.vercel.app
```

---

## Step 5: Update Backend CORS for Frontend URL

Your backend needs to accept requests from the deployed frontend.

### 5.1 Update `backend/app/core/config.py`:

Add your Vercel URL to `BACKEND_CORS_ORIGINS`:

```python
BACKEND_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-research-assistant.vercel.app",  # Add your Vercel URL
]
```

### 5.2 Push and Render will auto-redeploy:

```bash
git add .
git commit -m "Update CORS for production frontend URL"
git push origin main
```

Wait 5-10 minutes for Render to redeploy automatically.

---

## Step 6: Test Your Deployment

1. Open your frontend URL: `https://ai-research-assistant.vercel.app`
2. Click "Upload" and test file upload
3. Click "Chat" and test asking questions
4. Check browser console for any CORS errors

---

## Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
1. Check that your Vercel URL is in `BACKEND_CORS_ORIGINS`
2. Wait for Render to redeploy (takes 5-10 minutes)
3. Hard refresh browser (Ctrl+Shift+R)

### 502 Bad Gateway on Render
- Check that `Start Command` is correct
- Check logs on Render dashboard
- Ensure `requirements.txt` has all dependencies

### API Requests Failing
- Check that `VITE_API_BASE_URL` is set correctly
- Open DevTools → Network tab to see actual URL being called
- Verify backend is running (check Render logs)

### Build Failures on Vercel
- Check that `Root Directory` is set to `frontend`
- Verify `package.json` has correct `build` script
- Check build logs on Vercel dashboard

---

## Environment Variables Summary

### Backend (Render)
```
OPENAI_API_KEY=your_api_key  (optional)
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://ai-research-assistant-backend.onrender.com
```

---

## Costs

- **Render**: Free tier is good for MVP (auto-sleeps after 15 min inactivity)
- **Vercel**: Free tier is excellent for React apps

Upgrade to paid plans only when you need:
- Always-on backend (Render $7/month)
- Higher performance (Vercel Pro $20/month)

---

## What's Next?

After deployment:

1. **Set up LLM integration**: Add OpenAI API key to Render env vars
2. **Test full workflow**: Upload PDF → Ask questions → Get answers
3. **Add monitoring**: Use Render/Vercel dashboards to track usage
4. **Custom domain**: Configure custom domain on Vercel
5. **SSL certificate**: Automatically included on both platforms

---

## Quick Reference

| Component | Platform | URL Pattern |
|-----------|----------|------------|
| Backend | Render | `https://{service-name}.onrender.com` |
| Frontend | Vercel | `https://{project-name}.vercel.app` |

Replace `{service-name}` and `{project-name}` with your chosen names.
