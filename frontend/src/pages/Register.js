import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCVV] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/register', {
        firstName,
        lastName,
        email,
        number,
        password,
        confirmPassword,
        address,
        cardName,
        cardNumber,
        expMonth,
        expYear,
        cvv
      });
      if (res.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleCopy = () => {
    const codeText = document.getElementById('sql-code').innerText;
    navigator.clipboard.writeText(codeText);
    alert('SQL code copied to clipboard');
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#007bff', marginBottom: '20px' }}>Register</h2>

      {/* Navigation Menu */}
      <nav style={{ textAlign: 'center', marginBottom: '20px' }}>
        <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <li><Link to="/" style={menuLinkStyle}>Home</Link></li>
          <li><Link to="/dashboard" style={menuLinkStyle}>Dashboard</Link></li>
          <li><Link to="/login" style={menuLinkStyle}>Login</Link></li>
          <li><Link to="/profile" style={menuLinkStyle}>Profile</Link></li>
        </ul>
      </nav>

      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="text" placeholder="Phone Number" value={number} onChange={e => setNumber(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <input type="text" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} required />
        <input type="text" placeholder="Cardholder Name" value={cardName} onChange={e => setCardName(e.target.value)} required />
        <input type="text" placeholder="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required />
        <input type="text" placeholder="Exp Month (MM)" value={expMonth} onChange={e => setExpMonth(e.target.value)} required />
        <input type="text" placeholder="Exp Year (YYYY)" value={expYear} onChange={e => setExpYear(e.target.value)} required />
        <input type="text" placeholder="CVV" value={cvv} onChange={e => setCVV(e.target.value)} required />

        <button type="submit" style={{ marginTop: '10px' }}>Register</button>
      </form>

      {/* Database Setup Instructions */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1.5rem', color: '#007bff', marginBottom: '15px', textAlign: 'center' }}>
          Before Registering: Set Up the Database
        </h3>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
          To enable the registration functionality, you must first create the required database and table in MySQL.
          Follow these steps:
        </p>

        <ol style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555', paddingLeft: '20px' }}>
          <li><strong>Start MySQL in XAMPP</strong>: Open XAMPP and start the MySQL module. You can use phpMyAdmin or MySQL CLI.</li>
          <li><strong>Create the Database</strong>: 
            <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
              CREATE DATABASE jwt_auth_db;
            </pre>
          </li>
          <li><strong>Use the Database</strong>: 
            <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
              USE jwt_auth_db;
            </pre>
          </li>
          <li><strong>Create the Users Table</strong>: 
            <pre id="sql-code" style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientid VARCHAR(100) NOT NULL UNIQUE,

  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  
  email VARCHAR(100) NOT NULL UNIQUE,
  number VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  
  address VARCHAR(100) NOT NULL,
  
  cardName VARCHAR(100) NOT NULL,
  cardNumber VARCHAR(25) NOT NULL,
  expMonth VARCHAR(2) NOT NULL,
  expYear VARCHAR(4) NOT NULL,
  cvv VARCHAR(4) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
            </pre>
            <button onClick={handleCopy} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Copy SQL Code
            </button>
          </li>
        </ol>

        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
          Once the database and table are set up, you can register users, and their data will be stored in the database.
        </p>
      </div>
    </div>
  );
};

// Define the common styles for the menu links
const menuLinkStyle = {
  textDecoration: 'none',
  fontSize: '1.2rem',
  color: '#007bff',
  padding: '10px 20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  display: 'inline-block',
  transition: 'background-color 0.3s',
};

// Add a hover effect for the links
menuLinkStyle[':hover'] = {
  backgroundColor: '#e0e0e0',
};

export default Register;
