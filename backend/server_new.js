/**
 * Main server entry point
 * Minimal file that sets up Express and mounts routes
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const { PORT } = require('./config/constants');
const { uploadsDir } = require('./config/multer');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Mount all routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  // Test database connection
  const connected = await db.testConnection();
  if (!connected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }

  // Start listening
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

