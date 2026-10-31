# Login Troubleshooting Guide

## ✅ Backend is Working!
The login API endpoint has been tested and is functioning correctly.

## 🔑 Demo Account Credentials

All accounts use the password: **password123**

### Admin Account
- Username: `admin`
- Password: `password123`
- Role: Administrator

### Driver Accounts
- `driver1` - Rajesh Kumar (Route 22K)
- `driver2` - Suresh Sharma (Route 1D)
- `driver3` - Ramesh Gupta (Route 23K)
- `driver4` - Mahesh Babu (Route 27P)
- `driver5` - Naresh Reddy (Route 7D)

### Student Accounts
- `student1` - Amit Patel (Route 22K)
- `student2` - Priya Singh (Route 1D)
- `student3` - Rahul Verma (Route 23K)
- `student4` - Sneha Reddy (Route 27P)
- `student5` - Vikram Joshi (Route 7D)

## 🔍 Troubleshooting Steps

### 1. Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cached images and files
- Clear cookies and site data
- Reload the page with `Ctrl + F5`

### 2. Check Browser Console
- Press `F12` to open Developer Tools
- Go to the Console tab
- Look for any red error messages
- Check the Network tab for failed API requests

### 3. Verify Server is Running
The server should be running on port 5000. You should see:
```
🚀 ========================================
   College Bus Tracker Backend
   ========================================
   🌐 Server running on port 5000
   📡 WebSocket enabled
   🗄️  Database connected
   🔐 JWT authentication enabled
   ========================================
```

### 4. Test Login API Directly
Run this PowerShell command to test the API:
```powershell
$body = @{username='admin';password='password123'} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/api/auth/login -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected response:
```json
{"success":true,"data":{"user":{...},"token":"..."}}
```

### 5. Common Issues and Solutions

#### "Login failed" with no specific error
- **Cause**: Frontend not connecting to backend
- **Solution**: Make sure server is running on port 5000

#### Network error or CORS error
- **Cause**: Backend not accessible
- **Solution**: Restart the server with `npm start`

#### "Invalid username or password"
- **Cause**: Wrong credentials or database not seeded
- **Solution**: Run `npm run seed` to recreate demo accounts

#### Page shows old version
- **Cause**: Browser cache
- **Solution**: Hard refresh with `Ctrl + F5`

## 🚀 Quick Start

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open browser**:
   Navigate to `http://localhost:5000`

3. **Login**:
   - Click on any demo account button (Student, Driver, or Admin)
   - Or manually enter:
     - Username: `admin`
     - Password: `password123`
   - Click "Login"

4. **Success!**:
   You should be redirected to the appropriate dashboard based on your role.

## 📝 What Was Fixed

1. ✅ Created missing `.env` file with JWT configuration
2. ✅ Fixed corrupted `server.js` file
3. ✅ Initialized and seeded database with demo accounts
4. ✅ Rebuilt frontend with latest changes
5. ✅ Verified backend API is working correctly

## 🆘 Still Having Issues?

If login still fails after trying the above steps:

1. Check the browser console (F12) for specific error messages
2. Check the server terminal for error logs
3. Try a different browser
4. Make sure no other application is using port 5000
