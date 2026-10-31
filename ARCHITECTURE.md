# 🏗️ College Bus Tracking & Attendance System - Architecture

## System Overview

A real-time bus tracking system with attendance locking mechanism for college students, drivers, and administrators.

## Technology Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Real-time**: Socket.IO (WebSocket)
- **Database**: SQLite3 with better-sqlite3
- **Authentication**: JWT (JSON Web Tokens)

### Frontend
- **Framework**: React 18
- **Bundler**: Vite
- **Styling**: Vanilla CSS (Dark Mode)
- **Maps**: Leaflet + OpenStreetMap
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client

### Data Structures & Algorithms

1. **HashMap (Object/Map)**
   - User storage: O(1) lookup
   - Bus storage: O(1) access
   - Session management

2. **Graph (Adjacency List)**
   - Bus routes representation
   - Stops as vertices, routes as edges
   - Weighted edges (distance/time)

3. **Priority Queue (Min-Heap)**
   - ETA calculations
   - Notification scheduling
   - Event processing

4. **Queue (Array-based)**
   - Notification buffer
   - Event queue
   - Message broadcasting

## Core Modules

### 1. Authentication Module
- Simple JWT-based auth (no external services)
- Demo accounts for testing
- Role-based access control (Student/Driver/Admin)
- Session management

### 2. Real-Time GPS Module (Already Implemented)
- WebSocket-based location streaming
- Live position updates
- Multi-client support
- Connection state management

### 3. Attendance Lock System
**Algorithm:**
```
For each stop S in route R:
  1. Calculate ETA to stop S using Dijkstra's algorithm
  2. If ETA <= LOCK_THRESHOLD (e.g., 10 minutes):
     - Lock attendance for stop S
     - Prevent new confirmations
  3. Else:
     - Allow students to confirm presence
  4. Update driver manifest with confirmed count
```

### 4. Notification System
**Types:**
- Bus arrival alerts (ETA-based)
- Attendance lock warnings
- Breakdown notifications
- Delay updates

**Delivery:**
- WebSocket push (real-time)
- Browser notifications API
- In-app notification center

### 5. ETA Calculation Engine
**Algorithm: Modified Dijkstra**
```javascript
function calculateETA(currentLocation, targetStop, routeGraph) {
  // Use current GPS position as source
  // Apply Dijkstra's shortest path
  // Consider:
  //   - Traffic factor (constant multiplier)
  //   - Average speed
  //   - Distance between stops
  return estimatedTimeInMinutes;
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- hashed
  role TEXT NOT NULL, -- 'student', 'driver', 'admin'
  full_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Buses Table
```sql
CREATE TABLE buses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_number TEXT UNIQUE NOT NULL,
  route_id INTEGER NOT NULL,
  driver_id INTEGER,
  status TEXT DEFAULT 'idle', -- 'idle', 'active', 'breakdown'
  current_lat REAL,
  current_lng REAL,
  FOREIGN KEY (driver_id) REFERENCES users(id)
);
```

### Routes Table
```sql
CREATE TABLE routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);
```

### Stops Table
```sql
CREATE TABLE stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  sequence_order INTEGER NOT NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  stop_id INTEGER NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- 'present', 'absent'
  confirmed_at DATETIME,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (stop_id) REFERENCES stops(id)
);
```

### Student_Stops Table (Student's assigned stop)
```sql
CREATE TABLE student_stops (
  student_id INTEGER NOT NULL,
  stop_id INTEGER NOT NULL,
  PRIMARY KEY (student_id, stop_id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (stop_id) REFERENCES stops(id)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Trips Table (Trip logs)
```sql
CREATE TABLE trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (bus_id) REFERENCES buses(id),
  FOREIGN KEY (driver_id) REFERENCES users(id)
);
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/student/dashboard` - Dashboard data
- `GET /api/student/bus-location` - Current bus location
- `POST /api/student/attendance` - Confirm attendance
- `GET /api/student/notifications` - Get notifications

### Driver
- `POST /api/driver/trip/start` - Start trip
- `POST /api/driver/trip/end` - End trip
- `POST /api/driver/breakdown` - Report breakdown
- `POST /api/driver/delay` - Update delay
- `GET /api/driver/manifest` - Get student counts per stop

### Admin
- `GET /api/admin/buses` - All buses status
- `GET /api/admin/logs` - System logs
- `GET /api/admin/analytics` - Analytics data
- `POST /api/admin/routes` - Create/update routes
- `POST /api/admin/stops` - Create/update stops

## WebSocket Events

### Client → Server
- `send-location` - GPS position update
- `join-room` - Join specific room (bus/route)
- `leave-room` - Leave room

### Server → Client
- `receive-location` - Bus location update
- `eta-update` - ETA changed
- `attendance-locked` - Stop attendance locked
- `notification` - New notification
- `bus-status-changed` - Bus status update
- `user-disconnected` - User went offline

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based middleware
3. **Input Validation**: Sanitize all inputs
4. **SQL Injection**: Use parameterized queries
5. **XSS Prevention**: Escape user content
6. **Rate Limiting**: Prevent API abuse

## Performance Optimizations

1. **Caching**: In-memory cache for routes/stops
2. **Debouncing**: GPS updates (every 3-5 seconds)
3. **Lazy Loading**: Frontend components
4. **Connection Pooling**: Database connections
5. **Compression**: Gzip responses

## Deployment Strategy

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production (Future)
- **Backend**: Deploy to Railway/Render/Heroku
- **Frontend**: Deploy to Vercel/Netlify
- **Database**: Migrate to PostgreSQL
- **Environment**: Use .env for secrets

## Testing Strategy

1. **Unit Tests**: Core algorithms (ETA, locking)
2. **Integration Tests**: API endpoints
3. **E2E Tests**: User flows
4. **Load Tests**: WebSocket connections

## Future Enhancements

1. Historical route analytics
2. Predictive ETA using ML
3. Multi-route support per student
4. Parent notifications
5. Offline mode support
6. Mobile app (React Native)
