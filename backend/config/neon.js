const { neon, neonConfig } = require('@neondatabase/serverless');
const { Pool } = require('@neondatabase/serverless');
require('dotenv').config();

// Configure Neon for WebSocket usage (for better performance in serverless)
neonConfig.fetchConnectionCache = true;

// Direct SQL query function for Neon
const sql = neon(process.env.DATABASE_URL);

// Connection pool for more complex operations
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// Utility function for executing raw SQL with Neon
async function executeQuery(query, params = []) {
  try {
    const result = await sql(query, params);
    return result;
  } catch (error) {
    console.error('Neon Query Error:', error);
    throw error;
  }
}

// Health check function
async function healthCheck() {
  try {
    const result = await sql`SELECT 1 as health`;
    return result[0]?.health === 1;
  } catch (error) {
    console.error('Neon Health Check Failed:', error);
    return false;
  }
}

// Export both the direct sql function and utilities
module.exports = {
  sql,
  pool,
  executeQuery,
  healthCheck,
  neonConfig
}; 