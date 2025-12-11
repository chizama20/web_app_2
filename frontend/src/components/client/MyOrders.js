import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': token
        }
      });
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#007bff', marginBottom: '20px' }}>My Service Orders</h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>No orders yet.</p>
          <Link
            to="/my-requests"
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
            View My Requests
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
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
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Order #{order.id}</h3>
                  <p style={{ margin: '0', color: '#666' }}>
                    {order.service_address} • {order.cleaning_type}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                <p style={{ margin: '5px 0' }}>
                  <strong>Scheduled:</strong> {new Date(order.scheduled_date).toLocaleDateString()} at {order.scheduled_time_start}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Price:</strong> ${parseFloat(order.final_price).toFixed(2)}
                </p>
                {order.completed_at && (
                  <p style={{ margin: '5px 0', color: '#28a745' }}>
                    Completed: {new Date(order.completed_at).toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

