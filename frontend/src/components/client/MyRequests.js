import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/service-requests', {
        headers: {
          'Authorization': token
        }
      });
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#007bff' }}>My Service Requests</h2>
        <Link
          to="/service-request"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          New Request
        </Link>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>No service requests yet.</p>
          <Link
            to="/service-request"
            style={{
              display: 'inline-block',
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Create Your First Request
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {requests.map((request) => (
            <Link
              key={request.id}
              to={`/requests/${request.id}`}
              style={{
                display: 'block',
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{request.service_address}</h3>
                  <p style={{ margin: '0', color: '#666' }}>
                    {request.cleaning_type} • {request.num_rooms} rooms
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>Date:</strong> {new Date(request.preferred_date).toLocaleDateString()} at {request.preferred_time}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Budget:</strong> ${parseFloat(request.proposed_budget).toFixed(2)}
                </p>
                <p style={{ margin: '5px 0', color: '#999' }}>
                  Created: {new Date(request.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;

