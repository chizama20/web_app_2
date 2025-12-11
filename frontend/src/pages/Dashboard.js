// This is the code for Dashboard page (Client Dashboard)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRoleFromToken } from './utils';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const role = getRoleFromToken();

  // Redirect contractors to their dashboard
  if (role === 'contractor') {
    return <Navigate to="/contractor/dashboard" />;
  }

  // Log out function to clear the token and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', color: '#007bff', textAlign: 'center', marginBottom: '20px' }}>Client Dashboard</h2>
      
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
            <Link to="/service-request" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff', padding: '10px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              New Request
            </Link>
          </li>
          <li>
            <Link to="/my-requests" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff', padding: '10px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              My Requests
            </Link>
          </li>
          <li>
            <Link to="/my-orders" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff', padding: '10px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              My Orders
            </Link>
          </li>
          <li>
            <Link to="/my-bills" style={{ textDecoration: 'none', fontSize: '1.2rem', color: '#007bff', padding: '10px 20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              My Bills
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

      <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0, color: '#007bff' }}>Welcome to Your Dashboard</h3>
        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
          Manage your home cleaning service requests, view quotes, track orders, and handle billing all in one place.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <Link
          to="/service-request"
          style={{
            padding: '30px',
            backgroundColor: '#fff',
            border: '2px solid #007bff',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Submit Request</h3>
          <p style={{ margin: 0, color: '#666' }}>Create a new service request</p>
        </Link>

        <Link
          to="/my-requests"
          style={{
            padding: '30px',
            backgroundColor: '#fff',
            border: '2px solid #28a745',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>My Requests</h3>
          <p style={{ margin: 0, color: '#666' }}>View and manage your requests</p>
        </Link>

        <Link
          to="/my-orders"
          style={{
            padding: '30px',
            backgroundColor: '#fff',
            border: '2px solid #17a2b8',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>My Orders</h3>
          <p style={{ margin: 0, color: '#666' }}>Track your service orders</p>
        </Link>

        <Link
          to="/my-bills"
          style={{
            padding: '30px',
            backgroundColor: '#fff',
            border: '2px solid #ffc107',
            borderRadius: '8px',
            textDecoration: 'none',
            color: 'inherit',
            textAlign: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>My Bills</h3>
          <p style={{ margin: 0, color: '#666' }}>View and pay your bills</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
