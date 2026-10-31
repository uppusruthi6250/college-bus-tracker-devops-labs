# 📍 GPS Permission Guide

## How to Enable GPS/Location Access

### **Chrome/Edge (Desktop)**

1. **Click the lock icon** 🔒 in the address bar (left of the URL)
2. Find **"Location"** in the dropdown
3. Change from **"Block"** to **"Allow"**
4. **Reload the page** (F5)

**OR**

1. Click the **three dots** (⋮) → **Settings**
2. Go to **Privacy and security** → **Site settings**
3. Click **Location**
4. Find `localhost:5173` in the **Block** list
5. Click the **trash icon** to remove it
6. Reload the page

---

### **Chrome/Edge (Mobile)**

1. Tap the **lock icon** 🔒 next to the URL
2. Tap **"Permissions"**
3. Find **"Location"**
4. Select **"Allow"**
5. Reload the page

**OR via Phone Settings**:

1. Open **Settings** → **Apps**
2. Find **Chrome** or **Edge**
3. Tap **Permissions** → **Location**
4. Select **"Allow only while using the app"**

---

### **Firefox (Desktop)**

1. Click the **lock icon** 🔒 in the address bar
2. Click **"Connection secure"** → **"More information"**
3. Go to **Permissions** tab
4. Find **"Access Your Location"**
5. Uncheck **"Use Default"**
6. Check **"Allow"**
7. Reload the page

---

### **Safari (Mac)**

1. Go to **Safari** menu → **Settings for This Website**
2. Find **"Location"**
3. Change to **"Allow"**
4. Reload the page

---

### **Safari (iPhone/iPad)**

1. Open **Settings** → **Safari**
2. Scroll to **Settings for Websites**
3. Tap **Location**
4. Select **"Allow"**

**OR**:

1. Open **Settings** → **Privacy & Security**
2. Tap **Location Services**
3. Find **Safari**
4. Select **"While Using the App"**

---

## 🔧 **Quick Fix Steps**

### **Step 1: Check Browser Permissions**
- Look for a **blocked location icon** in the address bar
- Click it and select **"Allow"**

### **Step 2: Reload the Page**
- Press **F5** or **Ctrl+R** (Windows)
- Press **Cmd+R** (Mac)

### **Step 3: Clear Site Data** (if still not working)
1. Press **F12** to open DevTools
2. Go to **Application** tab
3. Click **Clear site data**
4. Reload the page

---

## 🚨 **Troubleshooting**

### **"Location not available"**
- **Desktop**: Make sure **Location Services** are enabled in Windows/Mac settings
- **Mobile**: Enable **GPS** in phone settings

### **"Location timeout"**
- Move to an **open area** (away from buildings)
- Wait **10-15 seconds** for GPS to acquire satellites
- Check if **airplane mode** is OFF

### **"Location denied"**
- You **blocked** the permission earlier
- Follow the steps above to **unblock** it
- You may need to **clear browser cache**

---

## 📱 **Mobile-Specific Issues**

### **Android**
1. Open **Settings** → **Location**
2. Turn **ON** location
3. Set **Mode** to **"High accuracy"**
4. Allow **Chrome/Edge** to access location

### **iOS**
1. Open **Settings** → **Privacy & Security**
2. Tap **Location Services**
3. Turn **ON** Location Services
4. Find **Safari** and set to **"While Using"**

---

## ✅ **Verification**

After enabling permissions, you should see:
- ✅ **"GPS Active"** in the dashboard header
- ✅ **Green pulsing dot** next to GPS status
- ✅ **Coordinates** in the console logs
- ✅ **Map showing your location**

---

## 🎯 **For Testing**

If you want to **test without real GPS**, you can:

1. **Open DevTools** (F12)
2. Press **Ctrl+Shift+P** (Windows) or **Cmd+Shift+P** (Mac)
3. Type **"sensors"**
4. Select **"Show Sensors"**
5. Set a **custom location**:
   - Latitude: `28.6139`
   - Longitude: `77.2090`
   - (Delhi, India)

---

**Need more help?** Check the browser console (F12) for specific error messages!
