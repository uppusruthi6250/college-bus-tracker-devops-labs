const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database', 'bus_tracker.db');
const db = new Database(dbPath);

const stops = db.prepare('SELECT * FROM stops').all();
console.log('Total stops:', stops.length);
console.log(JSON.stringify(stops.slice(0, 10), null, 2));

// Check for duplicates
const duplicates = db.prepare(`
    SELECT name, route_id, COUNT(*) as count 
    FROM stops 
    GROUP BY name, route_id 
    HAVING count > 1
`).all();

console.log('Duplicates found:', JSON.stringify(duplicates, null, 2));

db.close();
