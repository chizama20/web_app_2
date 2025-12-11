// Required dependencies
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware to parse JSON data and handle CORS (Cross-Origin Resource Sharing)
app.use(bodyParser.json());
app.use(cors());

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads', 'service-requests');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',  // Database host, usually 'localhost' in local development
  user: 'root',       // Default username in XAMPP
  password: '',       // Leave blank if no password is set in XAMPP
  database: 'jwt_auth_db',  // Database name
});

// Connect to the MySQL database
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Start the server and listen on port 5000
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

// User registration route
app.post('/register', async (req, res) => {
  const { 
    firstName,
    lastName,
    address,
    email,
    number,
    password,
    cardNumber,
    cardName,
    expMonth,
    expYear,
    cvv } = req.body;  // Extract username, email, and password from request body
  
  if (!firstName || !lastName || !address || !email || !number || !password || !cardNumber || !cardName || !expMonth || !expYear || !cvv) {
    return res.status(400).json({ message: 'All fields are required' });  // Validate input fields
  }

  const clientid = uuidv4(); // Generate a unique client ID

  const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password for security
  
  // Note: role column defaults to 'client' in database, so we don't need to specify it here
  const sql = 'INSERT INTO users (clientId, firstName, lastName, address, email, number, password, cardNumber, cardName, expMonth, expYear, cvv) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    // Insert the new user into the 'users' table
    db.query( sql, 
      [
      clientid,
      firstName,
      lastName,
      address,
      email,
      number,
      hashedPassword,
      cardNumber,
      cardName,
      expMonth,
      expYear,
      cvv],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'User registration failed', error: err });  // Send error response if registration fails
      }
      res.status(201).json({ message: 'User registered successfully', clientid: clientid });  // Send success response
    }
  );
});

// User login route
app.post('/login', (req, res) => {
  const { identifier , password } = req.body;  // Extract username and password from request body

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required' });  // Validate input fields
  }

  // Query the database for the user with the provided username
  const sql = "SELECT * FROM users WHERE email = ? OR number = ?";

  db.query(sql, [identifier, identifier], async (err, results) => {
    if(err) return res.status(500).json({ message: 'Database query error', error: err });

    if (err || results.length === 0) {
      return res.status(400).json({ message: 'User not found' });  // Send error response if user is not found
    }

    const user = results[0];  // Get the user record from the query result
    const passwordMatch = await bcrypt.compare(password, user.password);  // Compare the provided password with the hashed password

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });  // Send error response if the password does not match
    }

    // Generate a JWT token with the user ID, role and a secret key, valid for 3 hour
    const userRole = user.role || 'client';
    const token = jwt.sign({ userId: user.id, role: userRole }, 'your_jwt_secret', { expiresIn: '3h' });

    // Send the JWT token and user info as the response
    res.json({ token, role: userRole, userId: user.id, user: { id: user.id, role: userRole } });
  });
});

// Middleware function to authenticate JWT tokens and fetch user role
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];  // Get the token from the 'Authorization' header

  if (!token) return res.status(401).json({ message: 'Access denied' });  // If no token is provided, deny access

  // Verify the JWT token
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });  // If the token is invalid, send a 403 error
    
    // Fetch user role from database to ensure it's current
    db.query('SELECT id, role FROM users WHERE id = ?', [decoded.userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(403).json({ message: 'User not found' });
      }
      
      req.user = {
        userId: decoded.userId,
        role: results[0].role || 'client'
      };
      next();  // Proceed to the next middleware/route handler
    });
  });
};

// Role-based authorization middleware
const requireContractor = (req, res, next) => {
  if (req.user.role !== 'contractor') {
    return res.status(403).json({ message: 'Access denied. Contractor role required.' });
  }
  next();
};

const requireClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Access denied. Client role required.' });
  }
  next();
};

// Protected route that requires JWT authentication
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the dashboard. You are authenticated!' });  // Send a success message if authentication is valid
});


app.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;  // Extract userId from JWT

  db.query('SELECT firstName, lastName, email, number, address, role FROM users WHERE id = ?', [userId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      firstName: result[0].firstName,
      lastName: result[0].lastName,
      email: result[0].email,
      number: result[0].number,
      address: result[0].address,
      role: result[0].role || 'client'
    });
  });
});

// ==================== SERVICE REQUESTS API ====================

// Create service request
app.post('/api/service-requests', authenticateToken, requireClient, (req, res) => {
  const { service_address, cleaning_type, num_rooms, preferred_date, preferred_time, proposed_budget, notes } = req.body;
  const client_id = req.user.userId;

  if (!service_address || !cleaning_type || !num_rooms || !preferred_date || !preferred_time || !proposed_budget) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  const sql = `INSERT INTO service_requests 
    (client_id, service_address, cleaning_type, num_rooms, preferred_date, preferred_time, proposed_budget, notes, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

  db.query(sql, [client_id, service_address, cleaning_type, num_rooms, preferred_date, preferred_time, proposed_budget, notes || null], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to create service request', error: err.message });
    }
    res.status(201).json({ message: 'Service request created successfully', requestId: result.insertId });
  });
});

// Upload photos for service request
app.post('/api/service-requests/:id/photos', authenticateToken, requireClient, upload.array('photos', 5), (req, res) => {
  const requestId = parseInt(req.params.id);
  const client_id = req.user.userId;

  // Verify request belongs to client
  db.query('SELECT id FROM service_requests WHERE id = ? AND client_id = ?', [requestId, client_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Service request not found or access denied' });
    }

    // Check existing photo count
    db.query('SELECT COUNT(*) as count FROM service_request_photos WHERE request_id = ?', [requestId], (err, countResult) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      const existingCount = countResult[0].count;
      const newPhotos = req.files || [];
      
      if (existingCount + newPhotos.length > 5) {
        // Delete uploaded files
        newPhotos.forEach(file => {
          fs.unlinkSync(file.path);
        });
        return res.status(400).json({ message: 'Maximum 5 photos allowed per request' });
      }

      // Save photo paths
      const photoPaths = newPhotos.map(file => `/uploads/service-requests/${path.basename(file.path)}`);
      const values = photoPaths.map(photoPath => [requestId, photoPath]);
      
      if (values.length === 0) {
        return res.status(400).json({ message: 'No photos uploaded' });
      }

      const insertSql = 'INSERT INTO service_request_photos (request_id, photo_path) VALUES ?';
      db.query(insertSql, [values], (err, result) => {
        if (err) {
          // Clean up uploaded files on error
          newPhotos.forEach(file => {
            fs.unlinkSync(file.path);
          });
          return res.status(500).json({ message: 'Failed to save photos', error: err.message });
        }
        res.status(201).json({ message: 'Photos uploaded successfully', photos: photoPaths });
      });
    });
  });
});

// Get service requests (filtered by role)
app.get('/api/service-requests', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  let sql, params;
  
  if (role === 'contractor') {
    // Contractor sees all requests
    sql = `SELECT sr.*, u.firstName, u.lastName, u.email, u.number as phone
           FROM service_requests sr
           JOIN users u ON sr.client_id = u.id
           ORDER BY sr.created_at DESC`;
    params = [];
  } else {
    // Clients see only their requests
    sql = `SELECT sr.*, 
           (SELECT COUNT(*) FROM service_request_photos WHERE request_id = sr.id) as photo_count
           FROM service_requests sr
           WHERE sr.client_id = ?
           ORDER BY sr.created_at DESC`;
    params = [userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.json(results);
  });
});

// Get service request details
app.get('/api/service-requests/:id', authenticateToken, (req, res) => {
  const requestId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;

  // Build query based on role
  let sql, params;
  if (role === 'contractor') {
    sql = `SELECT sr.*, u.firstName, u.lastName, u.email, u.number as phone, u.address
           FROM service_requests sr
           JOIN users u ON sr.client_id = u.id
           WHERE sr.id = ?`;
    params = [requestId];
  } else {
    sql = `SELECT * FROM service_requests WHERE id = ? AND client_id = ?`;
    params = [requestId, userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    const request = results[0];

    // Get photos
    db.query('SELECT * FROM service_request_photos WHERE request_id = ?', [requestId], (err, photoResults) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      request.photos = photoResults;
      res.json(request);
    });
  });
});

// ==================== QUOTES API ====================

// Create quote or rejection
app.post('/api/quotes', authenticateToken, requireContractor, (req, res) => {
  const { request_id, adjusted_price, scheduled_date, scheduled_time_start, scheduled_time_end, notes, is_rejection, rejection_reason } = req.body;
  const contractor_id = req.user.userId;

  if (!request_id) {
    return res.status(400).json({ message: 'Request ID is required' });
  }

  if (is_rejection) {
    // Create rejection
    if (!rejection_reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const sql = `INSERT INTO quotes 
      (request_id, contractor_id, adjusted_price, scheduled_date, scheduled_time_start, scheduled_time_end, notes, status, is_rejection, rejection_reason) 
      VALUES (?, ?, 0, CURDATE(), '00:00:00', '00:00:00', ?, 'rejected', TRUE, ?)`;

    db.query(sql, [request_id, contractor_id, notes || null, rejection_reason], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to create rejection', error: err.message });
      }

      // Update request status
      db.query('UPDATE service_requests SET status = ? WHERE id = ?', ['rejected', request_id], (updateErr) => {
        if (updateErr) {
          console.error('Failed to update request status:', updateErr);
        }
      });

      res.status(201).json({ message: 'Request rejected', quoteId: result.insertId });
    });
  } else {
    // Create quote
    if (!adjusted_price || !scheduled_date || !scheduled_time_start || !scheduled_time_end) {
      return res.status(400).json({ message: 'All quote fields are required' });
    }

    const sql = `INSERT INTO quotes 
      (request_id, contractor_id, adjusted_price, scheduled_date, scheduled_time_start, scheduled_time_end, notes, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;

    db.query(sql, [request_id, contractor_id, adjusted_price, scheduled_date, scheduled_time_start, scheduled_time_end, notes || null], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to create quote', error: err.message });
      }

      // Update request status
      db.query('UPDATE service_requests SET status = ? WHERE id = ?', ['quote_sent', request_id], (updateErr) => {
        if (updateErr) {
          console.error('Failed to update request status:', updateErr);
        }
      });

      res.status(201).json({ message: 'Quote created successfully', quoteId: result.insertId });
    });
  }
});

// Get quote details with response history
app.get('/api/quotes/:id', authenticateToken, (req, res) => {
  const quoteId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;

  const sql = `SELECT q.*, sr.client_id, sr.service_address, sr.cleaning_type, sr.proposed_budget
               FROM quotes q
               JOIN service_requests sr ON q.request_id = sr.id
               WHERE q.id = ?`;

  db.query(sql, [quoteId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    const quote = results[0];

    // Check access permission
    if (role === 'client' && quote.client_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get response history
    db.query(`SELECT qr.*, u.firstName, u.lastName, u.role 
              FROM quote_responses qr
              JOIN users u ON qr.responder_id = u.id
              WHERE qr.quote_id = ?
              ORDER BY qr.created_at ASC`, [quoteId], (err, responses) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      quote.responses = responses;
      res.json(quote);
    });
  });
});

// Respond to quote (accept/renegotiate)
app.post('/api/quotes/:id/responses', authenticateToken, requireClient, (req, res) => {
  const quoteId = parseInt(req.params.id);
  const userId = req.user.userId;
  const { response_type, counter_note } = req.body;

  if (!response_type || !['accept', 'renegotiate', 'counter'].includes(response_type)) {
    return res.status(400).json({ message: 'Valid response type is required (accept, renegotiate, counter)' });
  }

  // Verify quote exists and belongs to user's request
  db.query(`SELECT q.*, sr.client_id 
            FROM quotes q
            JOIN service_requests sr ON q.request_id = sr.id
            WHERE q.id = ? AND sr.client_id = ?`, [quoteId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Quote not found or access denied' });
    }

    const quote = results[0];

    if (quote.status === 'accepted' || quote.status === 'rejected') {
      return res.status(400).json({ message: 'Quote already has final status' });
    }

    // Insert response
    const sql = `INSERT INTO quote_responses (quote_id, responder_id, response_type, counter_note) 
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [quoteId, userId, response_type, counter_note || null], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to save response', error: err.message });
      }

      let newStatus = 'renegotiating';
      if (response_type === 'accept') {
        newStatus = 'accepted';
        
        // Update quote status
        db.query('UPDATE quotes SET status = ? WHERE id = ?', [newStatus, quoteId], (updateErr) => {
          if (updateErr) {
            console.error('Failed to update quote status:', updateErr);
          }
        });

        // Create service order automatically
        const orderSql = `INSERT INTO service_orders 
          (request_id, quote_id, client_id, scheduled_date, scheduled_time_start, scheduled_time_end, final_price, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`;
        
        db.query(orderSql, [
          quote.request_id,
          quoteId,
          userId,
          quote.scheduled_date,
          quote.scheduled_time_start,
          quote.scheduled_time_end,
          quote.adjusted_price
        ], (orderErr, orderResult) => {
          if (orderErr) {
            console.error('Failed to create order:', orderErr);
          }

          // Update request status
          db.query('UPDATE service_requests SET status = ? WHERE id = ?', ['accepted', quote.request_id], (reqUpdateErr) => {
            if (reqUpdateErr) {
              console.error('Failed to update request status:', reqUpdateErr);
            }
          });
        });
      } else {
        // Update quote status to renegotiating
        db.query('UPDATE quotes SET status = ? WHERE id = ?', [newStatus, quoteId], (updateErr) => {
          if (updateErr) {
            console.error('Failed to update quote status:', updateErr);
          }
        });
      }

      res.status(201).json({ message: 'Response saved successfully', responseId: result.insertId });
    });
  });
});

// Get all quotes for a request
app.get('/api/service-requests/:requestId/quotes', authenticateToken, (req, res) => {
  const requestId = parseInt(req.params.requestId);
  const userId = req.user.userId;
  const role = req.user.role;

  // Verify access
  let sql = `SELECT q.* FROM quotes q JOIN service_requests sr ON q.request_id = sr.id WHERE sr.id = ?`;
  let params = [requestId];

  if (role === 'client') {
    sql += ' AND sr.client_id = ?';
    params.push(userId);
  }

  sql += ' ORDER BY q.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    // Get responses for each quote
    const quoteIds = results.map(q => q.id);
    if (quoteIds.length === 0) {
      return res.json(results);
    }

    db.query(`SELECT qr.*, u.firstName, u.lastName, u.role 
              FROM quote_responses qr
              JOIN users u ON qr.responder_id = u.id
              WHERE qr.quote_id IN (?)
              ORDER BY qr.created_at ASC`, [quoteIds], (err, responses) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      // Attach responses to quotes
      results.forEach(quote => {
        quote.responses = responses.filter(r => r.quote_id === quote.id);
      });

      res.json(results);
    });
  });
});

// ==================== SERVICE ORDERS API ====================

// Get orders (filtered by role)
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type, u.firstName, u.lastName, u.email, u.number as phone
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON o.client_id = u.id
           ORDER BY o.created_at DESC`;
    params = [];
  } else {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE o.client_id = ?
           ORDER BY o.created_at DESC`;
    params = [userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.json(results);
  });
});

// Get order details
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const orderId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;

  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type, sr.notes as request_notes, 
           u.firstName, u.lastName, u.email, u.number as phone, u.address
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON o.client_id = u.id
           WHERE o.id = ?`;
    params = [orderId];
  } else {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type, sr.notes as request_notes
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE o.id = ? AND o.client_id = ?`;
    params = [orderId, userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(results[0]);
  });
});

// Mark order as completed
app.put('/api/orders/:id/complete', authenticateToken, requireContractor, (req, res) => {
  const orderId = parseInt(req.params.id);

  db.query('SELECT * FROM service_orders WHERE id = ?', [orderId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = results[0];
    if (order.status === 'completed') {
      return res.status(400).json({ message: 'Order already completed' });
    }

    // Update order status
    db.query('UPDATE service_orders SET status = ?, completed_at = NOW() WHERE id = ?', ['completed', orderId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to update order', error: err.message });
      }

      // Create bill automatically
      const billSql = `INSERT INTO bills (order_id, client_id, amount, status) 
                       VALUES (?, ?, ?, 'pending')`;
      
      db.query(billSql, [orderId, order.client_id, order.final_price], (billErr, billResult) => {
        if (billErr) {
          console.error('Failed to create bill:', billErr);
          return res.status(500).json({ message: 'Order completed but failed to create bill', error: billErr.message });
        }

        res.json({ message: 'Order completed and bill created', billId: billResult.insertId });
      });
    });
  });
});

// ==================== BILLS API ====================

// Get bills (filtered by role)
app.get('/api/bills', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT b.*, o.final_price, sr.service_address, u.firstName, u.lastName, u.email
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON b.client_id = u.id
           ORDER BY b.created_at DESC`;
    params = [];
  } else {
    sql = `SELECT b.*, o.final_price, sr.service_address
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE b.client_id = ?
           ORDER BY b.created_at DESC`;
    params = [userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    res.json(results);
  });
});

// Get bill details with response history
app.get('/api/bills/:id', authenticateToken, (req, res) => {
  const billId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;

  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT b.*, o.final_price, sr.service_address, u.firstName, u.lastName, u.email
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON b.client_id = u.id
           WHERE b.id = ?`;
    params = [billId];
  } else {
    sql = `SELECT b.*, o.final_price, sr.service_address
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE b.id = ? AND b.client_id = ?`;
    params = [billId, userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    const bill = results[0];

    // Get response history
    db.query(`SELECT br.*, u.firstName, u.lastName, u.role 
              FROM bill_responses br
              JOIN users u ON br.responder_id = u.id
              WHERE br.bill_id = ?
              ORDER BY br.created_at ASC`, [billId], (err, responses) => {
      if (err) {
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      bill.responses = responses;
      res.json(bill);
    });
  });
});

// Respond to bill (pay, dispute, or revise)
app.post('/api/bills/:id/responses', authenticateToken, (req, res) => {
  const billId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;
  const { response_type, dispute_note, revised_amount, revision_note } = req.body;

  if (!response_type || !['pay', 'dispute', 'revise'].includes(response_type)) {
    return res.status(400).json({ message: 'Valid response type is required (pay, dispute, revise)' });
  }

  // Validate role-based actions
  if (role === 'client' && response_type === 'revise') {
    return res.status(403).json({ message: 'Only contractor can revise bills' });
  }

  if (role === 'contractor' && (response_type === 'pay' || response_type === 'dispute')) {
    return res.status(403).json({ message: 'Only clients can pay or dispute bills' });
  }

  // Verify bill exists and access
  let sql, params;
  if (role === 'contractor') {
    sql = `SELECT * FROM bills WHERE id = ?`;
    params = [billId];
  } else {
    sql = `SELECT * FROM bills WHERE id = ? AND client_id = ?`;
    params = [billId, userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Bill not found or access denied' });
    }

    const bill = results[0];

    if (bill.status === 'paid' && response_type !== 'revise') {
      return res.status(400).json({ message: 'Bill already paid' });
    }

    // Insert response
    let responseSql, responseParams;
    
    if (response_type === 'revise') {
      if (!revised_amount) {
        return res.status(400).json({ message: 'Revised amount is required' });
      }
      responseSql = `INSERT INTO bill_responses (bill_id, responder_id, response_type, revised_amount, revision_note) 
                     VALUES (?, ?, ?, ?, ?)`;
      responseParams = [billId, userId, response_type, revised_amount, revision_note || null];
    } else if (response_type === 'dispute') {
      if (!dispute_note) {
        return res.status(400).json({ message: 'Dispute note is required' });
      }
      responseSql = `INSERT INTO bill_responses (bill_id, responder_id, response_type, dispute_note) 
                     VALUES (?, ?, ?, ?)`;
      responseParams = [billId, userId, response_type, dispute_note];
    } else { // pay
      responseSql = `INSERT INTO bill_responses (bill_id, responder_id, response_type) 
                     VALUES (?, ?, ?)`;
      responseParams = [billId, userId, response_type];
    }

    db.query(responseSql, responseParams, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to save response', error: err.message });
      }

      // Update bill status
      let newStatus = bill.status;
      let updateSql, updateParams;

      if (response_type === 'pay') {
        newStatus = 'paid';
        updateSql = 'UPDATE bills SET status = ?, paid_at = NOW() WHERE id = ?';
        updateParams = [newStatus, billId];
      } else if (response_type === 'dispute') {
        newStatus = 'disputed';
        updateSql = 'UPDATE bills SET status = ? WHERE id = ?';
        updateParams = [newStatus, billId];
      } else { // revise
        // Update bill amount
        updateSql = 'UPDATE bills SET amount = ?, status = ? WHERE id = ?';
        updateParams = [revised_amount, 'pending', billId];
      }

      if (updateSql) {
        db.query(updateSql, updateParams, (updateErr) => {
          if (updateErr) {
            console.error('Failed to update bill:', updateErr);
          }
        });
      }

      res.status(201).json({ message: 'Response saved successfully', responseId: result.insertId });
    });
  });
});
