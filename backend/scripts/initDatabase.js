/**
 * Database Initialization Script
 * Creates all necessary tables for the College Bus Tracker system
 */

require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '..', 'database', 'bus_tracker.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

console.log('🗄️  Initializing database...');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create Users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'driver', 'admin')),
        full_name TEXT,
        email TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ Created users table');

// Create Routes table
db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ Created routes table');

// Create Stops table
db.exec(`
    CREATE TABLE IF NOT EXISTS stops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_id TEXT NOT NULL,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        sequence_order INTEGER NOT NULL,
        distance_from_previous REAL DEFAULT 0,
        FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
        UNIQUE(route_id, name, sequence_order)
    )
`);

console.log('✅ Created stops table');

// Create Buses table
db.exec(`
    CREATE TABLE IF NOT EXISTS buses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_number TEXT UNIQUE NOT NULL,
        route_id TEXT NOT NULL,
        driver_id INTEGER,
        status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'active', 'breakdown', 'maintenance')),
        current_lat REAL,
        current_lng REAL,
        last_updated DATETIME,
        FOREIGN KEY (route_id) REFERENCES routes(id),
        FOREIGN KEY (driver_id) REFERENCES users(id)
    )
`);

console.log('✅ Created buses table');

// Create Student_Stops table (assigns students to stops)
db.exec(`
    CREATE TABLE IF NOT EXISTS student_stops (
        student_id INTEGER NOT NULL,
        stop_id INTEGER NOT NULL,
        PRIMARY KEY (student_id, stop_id),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
    )
`);

console.log('✅ Created student_stops table');

// Create Attendance table
db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        stop_id INTEGER NOT NULL,
        trip_id INTEGER,
        date DATE NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('present', 'absent')),
        confirmed_at DATETIME,
        is_locked BOOLEAN DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (stop_id) REFERENCES stops(id),
        FOREIGN KEY (trip_id) REFERENCES trips(id)
    )
`);

console.log('✅ Created attendance table');

// Create Trips table
db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        route_id TEXT NOT NULL,
        started_at DATETIME NOT NULL,
        ended_at DATETIME,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        delay_minutes INTEGER DEFAULT 0,
        breakdown_reported BOOLEAN DEFAULT 0,
        breakdown_message TEXT,
        FOREIGN KEY (bus_id) REFERENCES buses(id),
        FOREIGN KEY (driver_id) REFERENCES users(id),
        FOREIGN KEY (route_id) REFERENCES routes(id)
    )
`);

console.log('✅ Created trips table');

// Create Stop Visits table
db.exec(`
    CREATE TABLE IF NOT EXISTS stop_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        stop_id INTEGER NOT NULL,
        visited_at DATETIME NOT NULL,
        date DATE NOT NULL,
        driver_lat REAL NOT NULL,
        driver_lng REAL NOT NULL,
        distance_meters REAL NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
        UNIQUE(trip_id, stop_id, date)
    )
`);

console.log('✅ Created stop_visits table');

// Create Notifications table
db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('arrival', 'lock', 'breakdown', 'delay', 'general')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);

console.log('✅ Created notifications table');

// Create Logs table for admin monitoring
db.exec(`
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER,
        event_type TEXT NOT NULL,
        description TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id)
    )
`);

console.log('✅ Created logs table');

// Create Trip History table (for breadcrumbs and playback)
db.exec(`
    CREATE TABLE IF NOT EXISTS trip_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        speed REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
`);

console.log('✅ Created trip_history table');

// Create indexes for better query performance
db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_stops_route ON stops(route_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
    CREATE INDEX IF NOT EXISTS idx_stop_visits_trip ON stop_visits(trip_id);
    CREATE INDEX IF NOT EXISTS idx_stop_visits_date ON stop_visits(date);
    CREATE INDEX IF NOT EXISTS idx_stop_visits_stop ON stop_visits(stop_id);
    CREATE INDEX IF NOT EXISTS idx_buses_location ON buses(current_lat, current_lng);
    CREATE INDEX IF NOT EXISTS idx_history_trip ON trip_history(trip_id);
`);

console.log('✅ Created indexes');

db.close();

console.log('🎉 Database initialization complete!');
console.log(`📍 Database location: ${dbPath}`);
