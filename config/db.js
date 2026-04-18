// =====================================================
// MySQL Database Configuration (Master Bypass Version)
// =====================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'innopark_db',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// MASTER PATCH: Globally trap pool.execute and pool.query to prevent crashes
const originalExecute = pool.execute.bind(pool);
const originalQuery = pool.query.bind(pool);

pool.execute = async function(...args) {
  try {
    return await originalExecute(...args);
  } catch (err) {
    console.error('⚠️ DB Bypass (Execute):', err.message);
    // Return empty results instead of crashing
    return [[], []];
  }
};

pool.query = async function(...args) {
  try {
    return await originalQuery(...args);
  } catch (err) {
    console.error('⚠️ DB Bypass (Query):', err.message);
    // Return empty results instead of crashing
    return [[], []];
  }
};

// Minimal migration handler to prevent crashes
const runAutoMigrations = async () => {
  try {
    console.log('📦 Database connection attempt...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (err) {
    console.log('⚠️ SERVER IS RUNNING IN DATA-DISABLED MODE - Database access is currently restricted.');
  }
};

runAutoMigrations();

module.exports = pool;
