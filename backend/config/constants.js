/**
 * Application constants and configuration
 */

module.exports = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '3h',

  // Server Configuration
  PORT: process.env.PORT || 5000,

  // Database Configuration (will use environment variables in production)
  DB_CONFIG: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jwt_auth_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // File Upload Configuration
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  },

  // User Roles
  ROLES: {
    CLIENT: 'client',
    CONTRACTOR: 'contractor'
  }
};

