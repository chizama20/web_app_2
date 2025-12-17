import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#007bff', marginBottom: '20px' }}>
        Welcome to Your Profile, {user?.firstName}!
      </h2>

      {/* Navigation Menu */}
      <nav style={{ textAlign: 'center', marginBottom: '20px' }}>
        <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <li><Link to="/" style={menuLinkStyle}>Home</Link></li>
          <li><Link to="/dashboard" style={menuLinkStyle}>Dashboard</Link></li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                ...menuLinkStyle,
                background: '#f5f5f5',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {/* Profile Information */}
      {user && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, color: '#007bff' }}>Your Information</h3>
          <div style={{ fontSize: '1.1rem', color: '#555', lineHeight: '2' }}>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Address:</strong> {user.address}</p>
          </div>
        </div>
      )}

      {/* Explanation Paragraph */}
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1.5rem', color: '#007bff', marginBottom: '15px' }}>Understanding JWT-Based Access</h3>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
          This profile page fetches your data from the server using the JWT token stored in your browser's localStorage.
          The token is automatically sent with each request to authenticate you.
        </p>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
          If you log out, the JWT token will be removed, and you will no longer be able to access this page.
          Try logging out and accessing this page directly - you'll be redirected to the login page.
        </p>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
          This demonstrates how protected routes work with JWT authentication.
        </p>
      </div>
    </div>
  );
};

// Define the common styles for the menu links and buttons
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

export default Profile;
