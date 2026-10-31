require('dotenv').config();
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const sourcePath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '..', 'database', 'bus_tracker.db');
const backupPath = path.resolve(
    process.argv[2] || path.join(path.dirname(sourcePath), 'bus_tracker.backup.db')
);

if (sourcePath === backupPath) {
    throw new Error('The backup destination must be different from the source database');
}

fs.mkdirSync(path.dirname(backupPath), { recursive: true });

async function createBackup() {
    const database = new Database(sourcePath, { readonly: true, fileMustExist: true });
    try {
        await database.backup(backupPath);
        console.log(`SQLite backup written to ${backupPath}`);
    } finally {
        database.close();
    }
}

createBackup().catch(error => {
    console.error('SQLite backup failed:', error);
    process.exitCode = 1;
});
