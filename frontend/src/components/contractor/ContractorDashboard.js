import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';

const ContractorDashboard = () => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeOrders: 0,
    unpaidBills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [requestsRes, ordersRes, billsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/service-requests', {
          headers: { 'Authorization': token }
        }),
        axios.get('http://localhost:5000/api/orders', {
          headers: { 'Authorization': token }
        }),
        axios.get('http://localhost:5000/api/bills', {
          headers: { 'Authorization': token }
        })
      ]);

      const pendingRequests = requestsRes.data.filter(r => r.status === 'pending' || r.status === 'quote_sent').length;
      const activeOrders = ordersRes.data.filter(o => o.status === 'scheduled' || o.status === 'in_progress').length;
      const unpaidBills = billsRes.data.filter(b => b.status !== 'paid').length;

      setStats({ pendingRequests, activeOrders, unpaidBills });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#007bff', marginBottom: '30px' }}>Contractor Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <Link
          to="/contractor/requests"
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
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Pending Requests</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#007bff' }}>
            {stats.pendingRequests}
          </div>
        </Link>

        <Link
          to="/contractor/orders"
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
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Active Orders</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.activeOrders}
          </div>
        </Link>

        <Link
          to="/contractor/billing"
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
          <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Unpaid Bills</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffc107' }}>
            {stats.unpaidBills}
          </div>
        </Link>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link
            to="/contractor/requests"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Manage Requests
          </Link>
          <Link
            to="/contractor/orders"
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Manage Orders
          </Link>
          <Link
            to="/contractor/billing"
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Manage Billing
          </Link>
          <Link
            to="/contractor/analytics"
            style={{
              padding: '10px 20px',
              backgroundColor: '#6f42c1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Analytics Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;

