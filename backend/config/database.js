/**
 * Database connection configuration using connection pooling
 */

const mysql = require('mysql2');
const { DB_CONFIG } = require('./constants');

// Create connection pool for better performance and connection management
const pool = mysql.createPool(DB_CONFIG);

// Get promise-based pool
const promisePool = pool.promise();

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Connected to MySQL database.');
    connection.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', err.stack);
    return false;
  }
};

/**
 * Execute a query
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await promisePool.execute(sql, params);
    return results;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

/**
 * Begin a transaction
 * @returns {Promise} Connection object for transaction
 */
const beginTransaction = async () => {
  const connection = await promisePool.getConnection();
  await connection.beginTransaction();
  return connection;
};

/**
 * Commit a transaction
 * @param {Object} connection - Transaction connection
 */
const commitTransaction = async (connection) => {
  await connection.commit();
  connection.release();
};

/**
 * Rollback a transaction
 * @param {Object} connection - Transaction connection
 */
const rollbackTransaction = async (connection) => {
  await connection.rollback();
  connection.release();
};

module.exports = {
  pool: promisePool,
  query,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  testConnection
};

