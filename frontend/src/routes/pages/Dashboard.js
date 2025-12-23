import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Log out function to clear the token and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMakeRecipe = () => {
    navigate('/CreateRecipe');
  }

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', color: '#007bff', textAlign: 'center', marginBottom: '20px' }}>Dashboard</h2>

      {/* Menu */}
      <nav style={{ textAlign: 'center', marginBottom: '20px' }}>
        <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <li>
            <Link to="/" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff', padding: '10px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/profile" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff', padding: '10px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                fontSize: '1.2rem',
                color: '#007bff',
                backgroundColor: '#f5f5f5',
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      <div style={{ backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '8px', marginBottom: '30px', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, color: '#007bff' }}>Welcome to Your Dashboard!</h3>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
          You are now logged in. This is a protected route that requires authentication.
        </p>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6', marginTop: '15px' }}>
          You can use this dashboard as a starting point for your new application.
        </p>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '30px', border: '2px solid #007bff', borderRadius: '8px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>Ready to Build</h3>
        <p style={{ margin: 0, color: '#666', fontSize: '1.1rem' }}>
          Start adding your app features here!
        </p>
      </div>
      <div style={{backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '30px', textAlign: 'center' }}>
        <button onClick={handleMakeRecipe} style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
          Make a recipe
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
