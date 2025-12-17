// Required dependencies
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Create a MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cuisine_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
  connection.release();
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ==================== AUTHENTICATION ROUTES ====================

// User registration route
app.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    email,
    phone,
    password
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !address || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Generate unique client ID
    const clientId = uuidv4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const sql = 'INSERT INTO users (clientId, firstName, lastName, address, email, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(
      sql,
      [clientId, firstName, lastName, address, email, phone, hashedPassword],
      (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          return res.status(500).json({ message: 'User registration failed', error: err.message });
        }
        res.status(201).json({
          message: 'User registered successfully',
          clientId: clientId
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email/Phone and password are required' });
  }

  try {
    // Query database for user by email or phone
    const sql = 'SELECT * FROM users WHERE email = ? OR phone = ?';

    db.query(sql, [identifier, identifier], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Database query error', error: err.message });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = results[0];

      // Compare password with hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token (valid for 3 hours)
      const token = jwt.sign(
        { userId: user.id, clientId: user.clientId },
        process.env.JWT_SECRET || 'your_jwt_secret_change_this',
        { expiresIn: '3h' }
      );

      // Send token and user info
      res.json({
        token,
        userId: user.id,
        user: {
          id: user.id,
          clientId: user.clientId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== MIDDLEWARE ====================

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_change_this', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      clientId: decoded.clientId
    };

    next();
  });
};

// ==================== PROTECTED ROUTES ====================

// Protected dashboard route
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    message: 'Welcome to the dashboard!',
    userId: req.user.userId
  });
});

// Get user profile
app.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const sql = 'SELECT id, clientId, firstName, lastName, email, phone, address FROM users WHERE id = ?';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  });
});
