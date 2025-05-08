import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'hopper.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'DzYfPAgJyogksidWBcHhJJdsSMExHKvL',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 56234, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// DB_HOST=hopper.proxy.rlwy.net
// DB_USER=root
// DB_PASSWORD=DzYfPAgJyogksidWBcHhJJdsSMExHKvL
// DB_PORT=56234
// DB_NAME=railway

// Create connection pool
const pool = mysql.createPool(config);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

// Initialize database with tables if they don't exist
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('artist', 'curator', 'admin') NOT NULL,
        profile_image VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create artworks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        medium VARCHAR(50) NOT NULL,
        dimensions VARCHAR(50),
        image_url VARCHAR(255) NOT NULL,
        artist_id INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        curator_feedback TEXT,
        curator_id INT,
        view_count INT DEFAULT 0,
        like_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (curator_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create artwork_tags junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS artwork_tags (
        artwork_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (artwork_id, tag_id),
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);
    
    // Create galleries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS galleries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        curator_id INT NOT NULL,
        is_published BOOLEAN DEFAULT FALSE,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (curator_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create gallery_artworks junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_artworks (
        gallery_id INT NOT NULL,
        artwork_id INT NOT NULL,
        display_order INT NOT NULL,
        PRIMARY KEY (gallery_id, artwork_id),
        FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE,
        FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization
testConnection().then(() => {
  initializeDatabase();
});

export default pool;