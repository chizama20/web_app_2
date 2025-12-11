import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';
import NegotiationHistory from '../common/NegotiationHistory';

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetail, setBillDetail] = useState(null);
  const [revisedAmount, setRevisedAmount] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [revising, setRevising] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bills', {
        headers: {
          'Authorization': token
        }
      });
      setBills(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchBillDetail = async (billId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/bills/${billId}`, {
        headers: {
          'Authorization': token
        }
      });
      setBillDetail(res.data);
      setSelectedBill(billId);
      setRevisedAmount(res.data.amount);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch bill details');
    }
  };

  const handleReviseBill = async (billId) => {
    if (!revisedAmount || parseFloat(revisedAmount) < 0) {
      alert('Please enter a valid revised amount');
      return;
    }

    setRevising(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/bills/${billId}/responses`,
        {
          response_type: 'revise',
          revised_amount: revisedAmount,
          revision_note: revisionNote
        },
        {
          headers: {
            'Authorization': token
          }
        }
      );

      alert('Bill revised successfully!');
      setRevisionNote('');
      fetchBills();
      fetchBillDetail(billId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revise bill');
    } finally {
      setRevising(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#007bff' }}>Billing Management</h2>
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
          <h3 style={{ marginBottom: '15px' }}>All Bills</h3>
          {bills.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No bills found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  onClick={() => fetchBillDetail(bill.id)}
                  style={{
                    padding: '20px',
                    backgroundColor: selectedBill === bill.id ? '#e7f3ff' : '#fff',
                    border: selectedBill === bill.id ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>Bill #{bill.id}</h4>
                      <p style={{ margin: '0', color: '#666' }}>{bill.service_address}</p>
                      <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                        {bill.firstName} {bill.lastName} • {bill.email}
                      </p>
                    </div>
                    <StatusBadge status={bill.status} />
                  </div>
                  <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    ${parseFloat(bill.amount).toFixed(2)}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                    {new Date(bill.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {billDetail && (
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Bill Details</h3>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Bill ID:</strong> #{billDetail.id}</p>
              <p><strong>Order ID:</strong> #{billDetail.order_id}</p>
              <p><strong>Amount:</strong> ${parseFloat(billDetail.amount).toFixed(2)}</p>
              <p><strong>Status:</strong> <StatusBadge status={billDetail.status} /></p>
              <p><strong>Client:</strong> {billDetail.firstName} {billDetail.lastName}</p>
              <p><strong>Email:</strong> {billDetail.email}</p>
              <p><strong>Service:</strong> {billDetail.service_address}</p>
              {billDetail.paid_at && (
                <p><strong>Paid At:</strong> {new Date(billDetail.paid_at).toLocaleString()}</p>
              )}
            </div>

            {billDetail.responses && billDetail.responses.length > 0 && (
              <NegotiationHistory responses={billDetail.responses} type="bill" />
            )}

            {billDetail.status === 'disputed' && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <h4>Revise Bill</h4>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Revised Amount ($) *
                  </label>
                  <input
                    type="number"
                    value={revisedAmount}
                    onChange={(e) => setRevisedAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Revision Note
                  </label>
                  <textarea
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="Explain the revision..."
                    rows="3"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
                <button
                  onClick={() => handleReviseBill(billDetail.id)}
                  disabled={revising}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: revising ? 'not-allowed' : 'pointer'
                  }}
                >
                  {revising ? 'Revising...' : 'Revise Bill'}
                </button>
              </div>
            )}

            {billDetail.status === 'paid' && (
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', color: '#155724' }}>
                <p style={{ margin: 0 }}>✓ Bill has been paid.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingManagement;

