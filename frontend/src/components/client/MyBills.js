import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';
import NegotiationHistory from '../common/NegotiationHistory';

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [billDetail, setBillDetail] = useState(null);
  const [responseType, setResponseType] = useState('pay');
  const [disputeNote, setDisputeNote] = useState('');
  const [responding, setResponding] = useState(false);

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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch bill details');
    }
  };

  const handleBillResponse = async (billId) => {
    if (responseType === 'dispute' && !disputeNote.trim()) {
      alert('Please provide a dispute note');
      return;
    }

    setResponding(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/bills/${billId}/responses`,
        {
          response_type: responseType,
          dispute_note: responseType === 'dispute' ? disputeNote : null
        },
        {
          headers: {
            'Authorization': token
          }
        }
      );

      alert('Response submitted successfully!');
      setSelectedBill(null);
      setBillDetail(null);
      setDisputeNote('');
      fetchBills();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#007bff', marginBottom: '20px' }}>My Bills</h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {bills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>No bills yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '15px' }}>All Bills</h3>
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
          </div>

          {billDetail && (
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '15px' }}>Bill Details</h3>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Bill ID:</strong> #{billDetail.id}</p>
                <p><strong>Amount:</strong> ${parseFloat(billDetail.amount).toFixed(2)}</p>
                <p><strong>Status:</strong> <StatusBadge status={billDetail.status} /></p>
                <p><strong>Service:</strong> {billDetail.service_address}</p>
                {billDetail.paid_at && (
                  <p><strong>Paid At:</strong> {new Date(billDetail.paid_at).toLocaleString()}</p>
                )}
              </div>

              {billDetail.responses && billDetail.responses.length > 0 && (
                <NegotiationHistory responses={billDetail.responses} type="bill" />
              )}

              {billDetail.status !== 'paid' && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '8px' }}>
                  <h4>Respond to Bill</h4>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      <input
                        type="radio"
                        value="pay"
                        checked={responseType === 'pay'}
                        onChange={(e) => setResponseType(e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      Pay Bill
                    </label>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      <input
                        type="radio"
                        value="dispute"
                        checked={responseType === 'dispute'}
                        onChange={(e) => setResponseType(e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      Dispute Bill
                    </label>
                  </div>
                  {responseType === 'dispute' && (
                    <textarea
                      placeholder="Enter your dispute reason..."
                      value={disputeNote}
                      onChange={(e) => setDisputeNote(e.target.value)}
                      rows="3"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                    />
                  )}
                  <button
                    onClick={() => handleBillResponse(billDetail.id)}
                    disabled={responding}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: responseType === 'pay' ? '#28a745' : '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: responding ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {responding ? 'Submitting...' : responseType === 'pay' ? 'Pay Now' : 'Submit Dispute'}
                  </button>
                </div>
              )}

              {billDetail.status === 'paid' && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#155724' }}>✓ Bill has been paid.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBills;

