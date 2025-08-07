# GitHub Deployment Guide

This guide will help you deploy your Resource Finder application to GitHub.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `resource-finder` (or your preferred name)
3. Set it to Public or Private as needed
4. Don't initialize with README (we already have one)

## Step 2: Initialize Git and Push Code

Run these commands in your terminal:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit: Resource Finder application"

# Add your GitHub repository as remote (replace with your username/repo)
git remote add origin https://github.com/yourusername/resource-finder.git

# Push to GitHub
git push -u origin main
```

## Step 3: Set Up Environment Variables (GitHub Secrets)

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** and add these secrets:

### Required Secrets:
- `DATABASE_URL` - Your PostgreSQL database connection string
- `NATIONAL_211_API_KEY` - Your 211 API key
- `NATIONAL_211_API_URL` - https://api.211.org/resources/v2/search
- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID

## Step 4: Enable GitHub Pages (Optional)

If you want to deploy as a static site:

1. Go to repository **Settings**
2. Scroll down to **Pages** section
3. Under **Source**, select "GitHub Actions"
4. The GitHub Actions workflow will automatically deploy your site

## Step 5: Deploy to Other Platforms

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Railway Deployment
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

## Current Project Structure

Your repository now includes:
- ✅ **README.md** - Complete project documentation
- ✅ **LICENSE** - MIT license
- ✅ **.gitignore** - Proper file exclusions
- ✅ **.github/workflows/deploy.yml** - Automated deployment
- ✅ **Complete application code** with all features

## Features Ready for Deployment

- ✅ Official Santa Barbara 211 taxonomy integration
- ✅ National 211 API integration with smart fallback
- ✅ Distance-based resource filtering
- ✅ Context-preserving navigation
- ✅ Responsive mobile-first design
- ✅ ADA-compliant accessibility
- ✅ Anonymous user support
- ✅ Local favorites system

## Environment Configuration

For production deployment, ensure these environment variables are set:

### Backend Environment Variables
```env
DATABASE_URL=postgresql://...
NATIONAL_211_API_KEY=your_api_key
NATIONAL_211_API_URL=https://api.211.org/resources/v2/search
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase configs
```

### Frontend Environment Variables (prefixed with VITE_)
```env
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Next Steps

1. Push your code to GitHub using the commands above
2. Set up the required environment variables as GitHub Secrets  
3. Your application will automatically deploy when you push changes
4. Access your deployed application at the provided URL

The GitHub Actions workflow will automatically build and deploy your application whenever you push changes to the main branch.