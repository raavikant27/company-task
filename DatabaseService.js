const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../storage/database.db');
    this.db = null;
    
    // Ensure storage directory exists
    const storageDir = path.dirname(this.dbPath);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Failed to connect to database:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Connected to SQLite database');
        this.createTables()
          .then(resolve)
          .catch(reject);
      });
    });
  }

  /**
   * Create necessary database tables
   */
  async createTables() {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS video_clips (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          filename TEXT NOT NULL,
          duration INTEGER NOT NULL,
          size INTEGER NOT NULL,
          path TEXT NOT NULL,
          thumbnail_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) {
          console.error('❌ Failed to create table:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Database tables created/verified');
        resolve();
      });
    });
  }

  /**
   * Save a new video clip to database
   */
  async saveClip(clipData) {
    return new Promise((resolve, reject) => {
      const { id, timestamp, filename, duration, size, path: filePath, thumbnailPath, metadata } = clipData;
      
      const insertSQL = `
        INSERT INTO video_clips (id, timestamp, filename, duration, size, path, thumbnail_path, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(insertSQL, [
        id,
        timestamp,
        filename,
        duration,
        size,
        filePath,
        thumbnailPath || null,
        metadata ? JSON.stringify(metadata) : null
      ], function(err) {
        if (err) {
          console.error('❌ Failed to save clip to database:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Clip saved to database with ID:', id);
        resolve({ id, changes: this.changes });
      });
    });
  }

  /**
   * Get all video clips from database
   */
  async getAllClips() {
    return new Promise((resolve, reject) => {
      const selectSQL = `
        SELECT id, timestamp, filename, duration, size, thumbnail_path, created_at, metadata
        FROM video_clips
        ORDER BY created_at DESC
      `;

      this.db.all(selectSQL, [], (err, rows) => {
        if (err) {
          console.error('❌ Failed to fetch clips from database:', err);
          reject(err);
          return;
        }

        // Parse metadata for each row
        const clips = rows.map(row => ({
          ...row,
          metadata: row.metadata ? JSON.parse(row.metadata) : null
        }));

        resolve(clips);
      });
    });
  }

  /**
   * Get a specific video clip by ID
   */
  async getClip(id) {
    return new Promise((resolve, reject) => {
      const selectSQL = `
        SELECT id, timestamp, filename, duration, size, path, thumbnail_path, created_at, metadata
        FROM video_clips
        WHERE id = ?
      `;

      this.db.get(selectSQL, [id], (err, row) => {
        if (err) {
          console.error('❌ Failed to fetch clip from database:', err);
          reject(err);
          return;
        }

        if (row) {
          row.metadata = row.metadata ? JSON.parse(row.metadata) : null;
        }

        resolve(row);
      });
    });
  }

  /**
   * Delete a video clip from database
   */
  async deleteClip(id) {
    return new Promise((resolve, reject) => {
      const deleteSQL = 'DELETE FROM video_clips WHERE id = ?';

      this.db.run(deleteSQL, [id], function(err) {
        if (err) {
          console.error('❌ Failed to delete clip from database:', err);
          reject(err);
          return;
        }

        console.log('✅ Clip deleted from database:', id);
        resolve({ changes: this.changes });
      });
    });
  }

  /**
   * Update clip metadata
   */
  async updateClipMetadata(id, metadata) {
    return new Promise((resolve, reject) => {
      const updateSQL = 'UPDATE video_clips SET metadata = ? WHERE id = ?';
      
      this.db.run(updateSQL, [JSON.stringify(metadata), id], function(err) {
        if (err) {
          console.error('❌ Failed to update clip metadata:', err);
          reject(err);
          return;
        }

        resolve({ changes: this.changes });
      });
    });
  }

  /**
   * Get database statistics
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      const statsSQL = `
        SELECT 
          COUNT(*) as total_clips,
          SUM(size) as total_size,
          SUM(duration) as total_duration,
          MIN(created_at) as oldest_clip,
          MAX(created_at) as newest_clip
        FROM video_clips
      `;

      this.db.get(statsSQL, [], (err, row) => {
        if (err) {
          console.error('❌ Failed to get database stats:', err);
          reject(err);
          return;
        }

        resolve(row);
      });
    });
  }

  /**
   * Close database connection
   */
  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Error closing database:', err);
          } else {
            console.log('✅ Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = DatabaseService;