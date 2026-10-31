# Vercel Deployment Guide

## 🚀 Environment Variables Setup

**CRITICAL**: Before deploying, you MUST add these environment variables to your Vercel project:

### How to Add Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Click on **Environment Variables** in the sidebar
4. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `JWT_SECRET` | `your-super-secret-jwt-key-change-this-in-production-12345` | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `7d` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### Important Notes:

- **JWT_SECRET**: This is REQUIRED for authentication to work. Without it, login will fail.
- Make sure to check all three environments (Production, Preview, Development)
- After adding variables, redeploy your application

## 📦 Deployment Checklist

### ✅ Already Configured:
- [x] Node.js 20.x specified in `package.json`
- [x] `.nvmrc` file for Node version
- [x] `vercel.json` with correct build settings
- [x] Frontend build process
- [x] Backend server configuration
- [x] Database initialization scripts

### ⚠️ Required Before Deployment:
- [ ] Add environment variables to Vercel (see above)
- [ ] Initialize database on first deployment
- [ ] Seed demo accounts

## 🗄️ Database Setup on Vercel

Since Vercel is serverless, you'll need to handle the database differently:

### Option 1: Use Vercel's File System (Simple, for demo)
The SQLite database will be created in `/tmp` directory on Vercel. 
**Note**: This is ephemeral and will reset on each deployment.

### Option 2: Use Vercel Postgres (Recommended for production)
1. Install Vercel Postgres addon
2. Update database configuration to use Postgres instead of SQLite
3. Run migrations on deployment

### For Demo/Testing (Current Setup):
The app will create a new SQLite database on each cold start. You'll need to:
1. Add a startup script to initialize and seed the database
2. Or manually call the init/seed endpoints after deployment

## 🔧 Post-Deployment Steps

After your first deployment:

1. **Initialize Database**:
   Visit: `https://your-app.vercel.app/api/init-db` (you'll need to create this endpoint)

2. **Seed Demo Accounts**:
   Visit: `https://your-app.vercel.app/api/seed-db` (you'll need to create this endpoint)

3. **Test Login**:
   - Go to your deployed URL
   - Use credentials: `admin` / `password123`
   - Should redirect to admin dashboard

## 🐛 Troubleshooting Deployment

### Login fails after deployment:
- **Check**: Environment variables are set in Vercel
- **Check**: Database is initialized
- **Check**: No CORS errors in browser console

### "Internal Server Error":
- **Check**: Vercel function logs for errors
- **Check**: Database file permissions
- **Check**: All dependencies are installed

### Database resets on each deployment:
- **Expected**: SQLite in `/tmp` is ephemeral
- **Solution**: Use Vercel Postgres or external database

## 📝 Demo Credentials

All accounts use password: **password123**

- Admin: `admin`
- Driver: `driver1`, `driver2`, `driver3`, `driver4`, `driver5`
- Student: `student1`, `student2`, `student3`, `student4`, `student5`

## 🔗 Useful Links

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
