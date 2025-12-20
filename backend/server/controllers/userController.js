const db = require('../config/db');

// Get user profile
const getProfile = (req, res) => {
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
};

// Update user profile
const updateProfile = (req, res) => {
  const userId = req.user.userId;
  const { firstName, lastName, phone, address } = req.body;

  const sql = 'UPDATE users SET firstName = ?, lastName = ?, phone = ?, address = ? WHERE id = ?';

  db.query(sql, [firstName, lastName, phone, address, userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  });
};

module.exports = {
  getProfile,
  updateProfile
};
