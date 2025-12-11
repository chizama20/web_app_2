import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    frequentClients: [],
    uncommittedClients: [],
    monthlyQuotes: [],
    prospectiveClients: [],
    largestJobs: [],
    overdueBills: [],
    badClients: [],
    goodClients: []
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllAnalytics();
  }, [selectedMonth]);

  const fetchAllAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': token } };

      const [
        frequentClientsRes,
        uncommittedClientsRes,
        monthlyQuotesRes,
        prospectiveClientsRes,
        largestJobsRes,
        overdueBillsRes,
        badClientsRes,
        goodClientsRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/frequent-clients', config),
        axios.get('http://localhost:5000/api/analytics/uncommitted-clients', config),
        axios.get(`http://localhost:5000/api/analytics/monthly-quotes?month=${selectedMonth}`, config),
        axios.get('http://localhost:5000/api/analytics/prospective-clients', config),
        axios.get('http://localhost:5000/api/analytics/largest-jobs', config),
        axios.get('http://localhost:5000/api/analytics/overdue-bills', config),
        axios.get('http://localhost:5000/api/analytics/bad-clients', config),
        axios.get('http://localhost:5000/api/analytics/good-clients', config)
      ]);

      setAnalytics({
        frequentClients: frequentClientsRes.data,
        uncommittedClients: uncommittedClientsRes.data,
        monthlyQuotes: monthlyQuotesRes.data,
        prospectiveClients: prospectiveClientsRes.data,
        largestJobs: largestJobsRes.data,
        overdueBills: overdueBillsRes.data,
        badClients: badClientsRes.data,
        goodClients: goodClientsRes.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div style={styles.loading}>Loading analytics...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Analytics Dashboard</h1>
        <div style={styles.nav}>
          <button onClick={() => navigate('/contractor/dashboard')} style={styles.navBtn}>
            Back to Dashboard
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Frequent Clients */}
        <div style={styles.card}>
          <h3>Frequent Clients</h3>
          <p>Clients with most completed orders</p>
          {analytics.frequentClients.length > 0 ? (
            <ul style={styles.list}>
              {analytics.frequentClients.slice(0, 5).map(client => (
                <li key={client.id}>
                  <strong>{client.firstName} {client.lastName}</strong><br/>
                  {client.completed_orders} orders completed
                </li>
              ))}
            </ul>
          ) : <p>No data available</p>}
        </div>

        {/* Uncommitted Clients */}
        <div style={styles.card}>
          <h3>Uncommitted Clients</h3>
          <p>3+ requests but never completed an order</p>
          {analytics.uncommittedClients.length > 0 ? (
            <ul style={styles.list}>
              {analytics.uncommittedClients.map(client => (
                <li key={client.id}>
                  <strong>{client.firstName} {client.lastName}</strong><br/>
                  {client.total_requests} requests submitted
                </li>
              ))}
            </ul>
          ) : <p>No uncommitted clients found</p>}
        </div>

        {/* Monthly Quotes */}
        <div style={styles.card}>
          <h3>This Month's Accepted Quotes</h3>
          <div style={styles.monthPicker}>
            <label>Month: </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={styles.input}
            />
          </div>
          {analytics.monthlyQuotes.length > 0 ? (
            <ul style={styles.list}>
              {analytics.monthlyQuotes.map(quote => (
                <li key={quote.id}>
                  <strong>{quote.firstName} {quote.lastName}</strong><br/>
                  ${quote.adjusted_price} - {quote.service_address}
                </li>
              ))}
            </ul>
          ) : <p>No quotes accepted this month</p>}
        </div>

        {/* Prospective Clients */}
        <div style={styles.card}>
          <h3>Prospective Clients</h3>
          <p>Registered but never submitted a request</p>
          {analytics.prospectiveClients.length > 0 ? (
            <ul style={styles.list}>
              {analytics.prospectiveClients.slice(0, 5).map(client => (
                <li key={client.id}>
                  <strong>{client.firstName} {client.lastName}</strong><br/>
                  Registered: {new Date(client.created_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : <p>No prospective clients</p>}
        </div>

        {/* Largest Jobs */}
        <div style={styles.card}>
          <h3>Largest Jobs</h3>
          <p>Jobs with most rooms completed</p>
          {analytics.largestJobs.length > 0 ? (
            <ul style={styles.list}>
              {analytics.largestJobs.slice(0, 5).map(job => (
                <li key={job.id}>
                  <strong>{job.num_rooms} rooms</strong> - ${job.final_price}<br/>
                  {job.firstName} {job.lastName} - {job.cleaning_type}
                </li>
              ))}
            </ul>
          ) : <p>No completed jobs found</p>}
        </div>

        {/* Overdue Bills */}
        <div style={{...styles.card, borderLeft: '4px solid #dc3545'}}>
          <h3>Overdue Bills</h3>
          <p>Unpaid bills older than one week</p>
          {analytics.overdueBills.length > 0 ? (
            <ul style={styles.list}>
              {analytics.overdueBills.map(bill => (
                <li key={bill.id}>
                  <strong>{bill.firstName} {bill.lastName}</strong><br/>
                  ${bill.amount} - Overdue since {new Date(bill.created_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : <p style={{color: '#28a745'}}>No overdue bills!</p>}
        </div>

        {/* Bad Clients */}
        <div style={{...styles.card, borderLeft: '4px solid #dc3545'}}>
          <h3>Bad Clients</h3>
          <p>Never paid any overdue bills</p>
          {analytics.badClients.length > 0 ? (
            <ul style={styles.list}>
              {analytics.badClients.map(client => (
                <li key={client.id}>
                  <strong>{client.firstName} {client.lastName}</strong><br/>
                  ${client.total_overdue_amount} in overdue bills
                </li>
              ))}
            </ul>
          ) : <p style={{color: '#28a745'}}>No bad clients!</p>}
        </div>

        {/* Good Clients */}
        <div style={{...styles.card, borderLeft: '4px solid #28a745'}}>
          <h3>Good Clients</h3>
          <p>Always pay bills within 24 hours</p>
          {analytics.goodClients.length > 0 ? (
            <ul style={styles.list}>
              {analytics.goodClients.map(client => (
                <li key={client.id}>
                  <strong>{client.firstName} {client.lastName}</strong><br/>
                  Avg payment time: {Math.round(client.avg_payment_hours)} hours
                </li>
              ))}
            </ul>
          ) : <p>No clients with perfect payment history yet</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  nav: {
    display: 'flex',
    gap: '10px'
  },
  navBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #007bff'
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0
  },
  monthPicker: {
    marginBottom: '15px'
  },
  input: {
    marginLeft: '10px',
    padding: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px'
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px'
  }
};

export default AnalyticsDashboard;