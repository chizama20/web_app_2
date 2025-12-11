import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [completing, setCompleting] = useState(false);

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

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('Mark this order as completed? A bill will be automatically generated.')) {
      return;
    }

    setCompleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/complete`,
        {},
        {
          headers: {
            'Authorization': token
          }
        }
      );

      alert('Order completed and bill created successfully!');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete order');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#007bff' }}>Service Orders</h2>
        <Link to="/contractor/dashboard" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '15px' }}>All Orders</h3>
          {orders.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No orders found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    padding: '20px',
                    backgroundColor: selectedOrder?.id === order.id ? '#e7f3ff' : '#fff',
                    border: selectedOrder?.id === order.id ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h4>
                      <p style={{ margin: '0', color: '#666' }}>
                        {order.service_address} • {order.cleaning_type}
                      </p>
                      <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                        {order.firstName} {order.lastName} • {order.email}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Order Details</h3>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Order ID:</strong> #{selectedOrder.id}</p>
              <p><strong>Service Address:</strong> {selectedOrder.service_address}</p>
              <p><strong>Cleaning Type:</strong> {selectedOrder.cleaning_type}</p>
              <p><strong>Client:</strong> {selectedOrder.firstName} {selectedOrder.lastName}</p>
              <p><strong>Email:</strong> {selectedOrder.email}</p>
              <p><strong>Phone:</strong> {selectedOrder.phone}</p>
              <p><strong>Scheduled Date:</strong> {new Date(selectedOrder.scheduled_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedOrder.scheduled_time_start} - {selectedOrder.scheduled_time_end}</p>
              <p><strong>Final Price:</strong> ${parseFloat(selectedOrder.final_price).toFixed(2)}</p>
              <p><strong>Status:</strong> <StatusBadge status={selectedOrder.status} /></p>
              {selectedOrder.completed_at && (
                <p><strong>Completed At:</strong> {new Date(selectedOrder.completed_at).toLocaleString()}</p>
              )}
            </div>

            {selectedOrder.status !== 'completed' && selectedOrder.status !== 'canceled' && (
              <button
                onClick={() => handleCompleteOrder(selectedOrder.id)}
                disabled={completing}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: completing ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                {completing ? 'Completing...' : 'Mark as Completed'}
              </button>
            )}

            {selectedOrder.status === 'completed' && (
              <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', color: '#155724' }}>
                <p style={{ margin: 0 }}>✓ Order completed. Bill should have been generated.</p>
                <Link
                  to="/contractor/billing"
                  style={{ color: '#007bff', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}
                >
                  View Billing →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;

