# 🚀 QUICKSTART GUIDE
## College Bus Tracking & Attendance System

### 📋 Prerequisites
- Node.js v18 or higher
- npm or yarn
- Modern web browser (Chrome, Firefox, Edge)

### ⚡ Quick Start (5 minutes)

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies (already done)
npm install

# Initialize database (already done)
npm run init-db

# Seed demo data (already done)
npm run seed

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5000**

#### 2. Frontend Setup
```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### 🔐 Demo Login Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Student** | student1 | password123 | Track bus, confirm attendance |
| **Driver** | driver1 | password123 | Start trip, share GPS, view manifest |
| **Admin** | admin | password123 | Monitor all buses, view logs, analytics |

### 🎯 Quick Test Flow

#### As a Student:
1. Login with `student1 / password123`
2. View your assigned stop on the map
3. See bus location (when driver starts trip)
4. Confirm attendance (Present/Absent)
5. Receive notifications about bus arrival

#### As a Driver:
1. Login with `driver1 / password123`
2. Click "Start Trip" button
3. Your GPS location will be shared automatically
4. View student manifest (expected count per stop)
5. Report breakdown or delay if needed
6. Click "End Trip" when done

#### As an Admin:
1. Login with `admin / password123`
2. View all active buses on dashboard
3. Check system logs
4. View attendance analytics
5. Manage routes and stops

### 📡 Real-time Features

**Automatic GPS Tracking:**
- Driver's location updates every 5 seconds
- Students see live bus movement on map
- ETA calculated using Dijkstra's algorithm

**Attendance Lock System:**
- Attendance locks 10 minutes before bus reaches stop
- Students receive notification when lock is approaching
- Driver sees confirmed student count per stop

**Notifications:**
- Bus arrival alerts
- Attendance lock warnings
- Breakdown notifications
- Delay updates

### 🗂️ Project Structure

```
real-time-bustracker/
├── backend/
│   ├── dataStructures/       # HashMap, Graph, Queue (DSA)
│   ├── services/             # Business logic
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth, error handling
│   ├── scripts/              # DB init & seed
│   ├── database/             # SQLite database
│   └── server.js             # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Dashboard pages
│   │   ├── context/          # React context (Auth)
│   │   ├── services/         # WebSocket, API
│   │   └── styles/           # CSS files
│   └── index.html
│
├── ARCHITECTURE.md           # System design document
└── QUICKSTART.md            # This file
```

### 🔧 Troubleshooting

**Backend won't start:**
```bash
# Check if port 5000 is available
# Kill any process using port 5000
# Re-run: npm run dev
```

**Frontend won't connect:**
```bash
# Ensure backend is running first
# Check CORS settings in backend/.env
# Clear browser cache
```

**Database errors:**
```bash
# Re-initialize database
cd backend
npm run init-db
npm run seed
```

**WebSocket not connecting:**
- Ensure both backend and frontend are running
- Check browser console for errors
- Verify token is being sent correctly

### 📊 Data Structures Used

1. **HashMap** - O(1) user/bus lookups
2. **Graph** - Route representation with Dijkstra's algorithm
3. **Queue** - Notification management (FIFO)
4. **Priority Queue** - ETA calculations (Min-Heap)

### 🎨 Design Features

- **Dark Mode** - Premium dark theme by default
- **Glassmorphism** - Modern frosted glass effects
- **Smooth Animations** - Micro-interactions throughout
- **Responsive** - Works on desktop and mobile
- **Real-time Updates** - Live data via WebSocket

### 📝 API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Student:**
- `GET /api/student/dashboard` - Dashboard data
- `GET /api/student/bus-location` - Current bus location
- `POST /api/student/attendance` - Confirm attendance
- `GET /api/student/notifications` - Get notifications

**Driver:**
- `GET /api/driver/dashboard` - Dashboard data
- `POST /api/driver/trip/start` - Start trip
- `POST /api/driver/trip/end` - End trip
- `POST /api/driver/breakdown` - Report breakdown
- `POST /api/driver/delay` - Update delay
- `GET /api/driver/manifest` - Student counts

**Admin:**
- `GET /api/admin/dashboard` - Overview stats
- `GET /api/admin/buses` - All buses
- `GET /api/admin/logs` - System logs
- `GET /api/admin/analytics` - Analytics data

### 🚀 Deployment (Future)

**Backend:**
- Deploy to Railway, Render, or Heroku
- Migrate SQLite to PostgreSQL
- Set environment variables

**Frontend:**
- Deploy to Vercel or Netlify
- Update API base URL
- Configure CORS

### 💡 Key Features

✅ Real-time GPS tracking (WebSocket)
✅ ETA-based attendance locking
✅ Role-based dashboards
✅ Notification system
✅ Driver manifest
✅ Admin analytics
✅ Premium UI/UX
✅ DSA implementation

### 📚 Additional Documentation

- `ARCHITECTURE.md` - Detailed system architecture
- `backend/services/` - Service documentation
- `backend/dataStructures/` - DSA implementation details

### 🎓 For Students/Interviews

**Key Points to Highlight:**
1. **Real-time System** - WebSocket-based GPS tracking
2. **DSA Implementation** - Graph, HashMap, Queue, Priority Queue
3. **Algorithm** - Dijkstra's for shortest path/ETA
4. **Full-Stack** - Node.js backend + React frontend
5. **System Design** - Scalable architecture
6. **Database** - SQLite with proper schema design
7. **Authentication** - JWT-based secure auth
8. **UI/UX** - Premium dark mode design

**Demo Flow:**
1. Show login with different roles
2. Demonstrate real-time GPS tracking
3. Explain attendance lock algorithm
4. Show notification system
5. Display admin analytics

### 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Check backend terminal for logs
3. Verify database is initialized
4. Ensure all dependencies are installed

### 🎉 You're Ready!

The system is fully functional and ready to use. Start the backend and frontend servers, then login with any demo account to explore the features.

**Happy Tracking! 🚌**
