/**
 * Database Connection and Query Wrapper
 * Provides a clean interface for database operations
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseService {
    constructor() {
        const dbDir = path.join(__dirname, '..', 'database');
        const dbPath = process.env.DB_PATH
            ? path.resolve(process.env.DB_PATH)
            : path.join(dbDir, 'bus_tracker.db');
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        this.db = new Database(dbPath);
        this.db.pragma('foreign_keys = ON');

        console.log('📦 Database connected');
        
        // Auto-cleanup duplicates on startup (ensures production consistency)
        this.cleanupDuplicates();
    }

    /**
     * Identifies and removes duplicate stops, merging any student assignments
     */
    cleanupDuplicates() {
        try {
            // Find duplicate groups
            const duplicates = this.db.prepare(`
                SELECT name, route_id, MIN(id) as keep_id, GROUP_CONCAT(id) as all_ids
                FROM stops 
                GROUP BY name, route_id 
                HAVING COUNT(*) > 1
            `).all();

            if (duplicates.length === 0) return;

            console.log(`🧹 Found ${duplicates.length} duplicate stop groups. Cleaning up...`);

            const transaction = this.db.transaction(() => {
                for (const group of duplicates) {
                    const idsToDelete = group.all_ids.split(',').filter(id => id != group.keep_id);
                    
                    for (const deleteId of idsToDelete) {
                        // Update references in other tables before deleting
                        this.db.prepare('UPDATE OR IGNORE student_stops SET stop_id = ? WHERE stop_id = ?').run(group.keep_id, deleteId);
                        this.db.prepare('UPDATE OR IGNORE attendance SET stop_id = ? WHERE stop_id = ?').run(group.keep_id, deleteId);
                        
                        // Delete the duplicate row
                        this.db.prepare('DELETE FROM stops WHERE id = ?').run(deleteId);
                    }
                }
            });

            transaction();
            console.log('✅ Duplicate stops cleanup complete');
        } catch (error) {
            console.error('❌ Failed to cleanup duplicates:', error);
        }
    }

    /**
     * Execute a query that returns multiple rows
     */
    query(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.all(params);
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }

    /**
     * Execute a query that returns a single row
     */
    queryOne(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.get(params);
        } catch (error) {
            console.error('QueryOne error:', error);
            throw error;
        }
    }

    /**
     * Execute an INSERT, UPDATE, or DELETE query
     */
    execute(sql, params = []) {
        try {
            const stmt = this.db.prepare(sql);
            return stmt.run(params);
        } catch (error) {
            console.error('Execute error:', error);
            throw error;
        }
    }

    /**
     * Execute multiple queries in a transaction
     */
    transaction(callback) {
        const transaction = this.db.transaction(callback);
        return transaction();
    }

    /**
     * Close database connection
     */
    close() {
        this.db.close();
        console.log('📦 Database connection closed');
    }

    /**
     * Get database instance for advanced operations
     */
    getDb() {
        return this.db;
    }
}

// Singleton instance
let instance = null;

module.exports = {
    getInstance: () => {
        if (!instance) {
            instance = new DatabaseService();
        }
        return instance;
    },
    DatabaseService
};
