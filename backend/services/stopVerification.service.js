/**
 * Stop Verification Service
 * Handles automatic stop visit detection via geofencing
 */

const { getInstance } = require('./database.service');
const { haversineDistance, isWithinGeofence } = require('../utils/haversine');

const GEOFENCE_RADIUS_METERS = 40; // Configurable radius

class StopVerificationService {
    constructor() {
        this.db = getInstance();
        this.db.getDb().exec(`
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
            );
            CREATE INDEX IF NOT EXISTS idx_stop_visits_trip ON stop_visits(trip_id);
            CREATE INDEX IF NOT EXISTS idx_stop_visits_date ON stop_visits(date);
            CREATE INDEX IF NOT EXISTS idx_stop_visits_stop ON stop_visits(stop_id);
        `);
    }

    /**
     * Check if driver has reached any unvisited stops
     * @param {number} tripId - Active trip ID
     * @param {string} routeId - Route ID
     * @param {number} driverLat - Driver's current latitude
     * @param {number} driverLng - Driver's current longitude
     * @returns {Array} Array of newly visited stops
     */
    checkStopVisits(tripId, routeId, driverLat, driverLng) {
        if (
            !Number.isFinite(driverLat) ||
            !Number.isFinite(driverLng) ||
            driverLat < -90 ||
            driverLat > 90 ||
            driverLng < -180 ||
            driverLng > 180
        ) {
            throw new RangeError('Driver coordinates must be valid latitude and longitude values');
        }

        const today = new Date().toISOString().split('T')[0];

        const newlyVisited = this.db.transaction(() => {
            const newlyVisited = [];

            // Get all stops for this route
            const stops = this.db.query(
                `SELECT id, name, latitude, longitude, sequence_order
                 FROM stops
                 WHERE route_id = ?
                 ORDER BY sequence_order`,
                [routeId]
            );

            // Get already visited stops for this trip today
            const visitedStops = this.db.query(
                `SELECT stop_id
                 FROM stop_visits
                 WHERE trip_id = ? AND date = ?`,
                [tripId, today]
            );

            const visitedStopIds = new Set(visitedStops.map(v => v.stop_id));

            // Check each unvisited stop
            for (const stop of stops) {
                if (visitedStopIds.has(stop.id)) {
                    continue;
                }

                // Calculate distance
                const distance = haversineDistance(
                    driverLat,
                    driverLng,
                    stop.latitude,
                    stop.longitude
                );

                // Check if within geofence
                if (isWithinGeofence(driverLat, driverLng, stop.latitude, stop.longitude, GEOFENCE_RADIUS_METERS)) {
                    // Mark as visited
                    this.db.execute(
                        `INSERT INTO stop_visits (trip_id, stop_id, visited_at, date, driver_lat, driver_lng, distance_meters)
                         VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
                        [tripId, stop.id, today, driverLat, driverLng, distance]
                    );

                    newlyVisited.push({
                        stopId: stop.id,
                        stopName: stop.name,
                        sequenceOrder: stop.sequence_order,
                        distance: Math.round(distance),
                        timestamp: new Date().toISOString()
                    });

                    visitedStopIds.add(stop.id);
                }
            }

            return newlyVisited;
        });

        newlyVisited.forEach(stop => {
            console.log(`✅ Stop verified: ${stop.stopName} (${stop.distance}m away)`);
        });
        return newlyVisited;
    }

    /**
     * Get visited stops for a trip
     * @param {number} tripId - Trip ID
     * @returns {Array} Array of visited stop IDs
     */
    getVisitedStops(tripId) {
        const today = new Date().toISOString().split('T')[0];
        const visited = this.db.query(
            `SELECT stop_id, visited_at, distance_meters
             FROM stop_visits
             WHERE trip_id = ? AND date = ?
             ORDER BY visited_at`,
            [tripId, today]
        );

        return visited.map(v => ({
            stopId: v.stop_id,
            visitedAt: v.visited_at,
            distance: v.distance_meters
        }));
    }
}

// Singleton instance
let instance = null;

function getStopVerificationService() {
    if (!instance) {
        instance = new StopVerificationService();
    }
    return instance;
}

module.exports = getStopVerificationService();
