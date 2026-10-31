const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database', 'bus_tracker.db');
const db = new Database(dbPath);

console.log('--- Cleaning up duplicate stops ---');

// Find duplicate groups
const duplicates = db.prepare(`
    SELECT name, route_id, MIN(id) as keep_id, GROUP_CONCAT(id) as all_ids
    FROM stops 
    GROUP BY name, route_id 
    HAVING COUNT(*) > 1
`).all();

console.log(`Found ${duplicates.length} duplicate stop groups.`);

db.transaction(() => {
    for (const group of duplicates) {
        const idsToDelete = group.all_ids.split(',').filter(id => id != group.keep_id);
        
        // Before deleting, update student_stops to point to the keep_id
        for (const deleteId of idsToDelete) {
            db.prepare('UPDATE student_stops SET stop_id = ? WHERE stop_id = ?').run(group.keep_id, deleteId);
            db.prepare('UPDATE attendance SET stop_id = ? WHERE stop_id = ?').run(group.keep_id, deleteId);
            // Delete the duplicate
            db.prepare('DELETE FROM stops WHERE id = ?').run(deleteId);
        }
    }
})();

console.log('Cleanup complete.');

// Now check if there are still duplicates
const remainingDuplicates = db.prepare(`
    SELECT name, route_id, COUNT(*) as count 
    FROM stops 
    GROUP BY name, route_id 
    HAVING count > 1
`).all();

console.log('Remaining duplicates:', remainingDuplicates.length);

db.close();
