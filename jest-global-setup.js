const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Use a file-based database for test consistency
const dbPath = path.join(__dirname, 'test-database.db');

module.exports = async () => {
  // Clean up the previous database file
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Could not connect to test database', err);
        reject(err);
      } else {
        console.log('Connected to the test SQLite database.');
        const schemaSql = fs.readFileSync(path.join(__dirname, './server/test/test-schema.db'), 'utf8');
        db.exec(schemaSql, (err) => {
          if (err) {
            console.error('Failed to apply test database schema:', err);
            reject(err);
          } else {
            db.close();
            resolve();
          }
        });
      }
    });
  });
};
