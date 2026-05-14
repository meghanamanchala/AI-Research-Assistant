# AI Research Assistant - Deployment Checklist

## Before Starting
- [ ] All code committed to GitHub
- [ ] GitHub account set up
- [ ] Render account created (render.com)
- [ ] Vercel account created (vercel.com)
- [ ] OpenAI API key ready (optional, for LLM features)

## Deployment Order

### Phase 1: Backend Deployment (Render)
- [ ] Go to Render dashboard
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Set Build Command: `pip install -r requirements.txt`
- [ ] Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- [ ] Add OPENAI_API_KEY environment variable (optional)
- [ ] Click Deploy and wait for completion
- [ ] Copy backend URL (e.g., https://ai-research-assistant-backend.onrender.com)

### Phase 2: Update Frontend Configuration
- [ ] Edit `frontend/.env.production`
- [ ] Update VITE_API_BASE_URL with your Render backend URL
- [ ] Commit changes: `git add . && git commit -m "Update API URL" && git push`

### Phase 3: Frontend Deployment (Vercel)
- [ ] Go to Vercel dashboard
- [ ] Click "Add New Project"
- [ ] Import your GitHub repository
- [ ] Set Root Directory to `frontend`
- [ ] Set Build Command: `npm run build`
- [ ] Set Output Directory: `dist`
- [ ] Add VITE_API_BASE_URL environment variable
- [ ] Click Deploy and wait for completion
- [ ] Copy frontend URL (e.g., https://ai-research-assistant-orcin.vercel.app/)

### Phase 4: Final Backend Configuration
- [ ] Edit `backend/app/core/config.py`
- [ ] Add your Vercel frontend URL to BACKEND_CORS_ORIGINS list
- [ ] Commit changes: `git add . && git commit -m "Add CORS for production" && git push`
- [ ] Wait for Render to auto-redeploy (5-10 minutes)

### Phase 5: Testing
- [ ] Open frontend URL in browser
- [ ] Test file upload
- [ ] Test asking questions
- [ ] Check browser console for errors
- [ ] Check Render logs for API errors

## Troubleshooting

### CORS Errors in Browser
1. Check that your Vercel URL is in BACKEND_CORS_ORIGINS
2. Wait for Render to redeploy
3. Hard refresh browser (Ctrl+Shift+R)

### API Returns 502 Bad Gateway
1. Check Render logs
2. Verify requirements.txt has all dependencies
3. Check that Start Command is correct

### Build Fails on Vercel
1. Verify Root Directory is set to `frontend`
2. Check that build script in package.json is correct
3. Review Vercel build logs

## Environment Variables Needed

### Render (Backend)
```
OPENAI_API_KEY = your_api_key_here  (optional)
GROQ_API_KEY = your_groq_key (optional)
```

### Vercel (Frontend)
```
VITE_API_BASE_URL = https://your-backend-url.onrender.com
```

## Quick Links
- Render Dashboard: https://render.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub: https://github.com

## After Deployment
1. Set up custom domain (optional)
2. Configure SSL (automatic on both platforms)
3. Set up monitoring
4. Enable auto-deploy on code changes
5. Test all features on production URLs
