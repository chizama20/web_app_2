import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';

const RequestManagement = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteData, setQuoteData] = useState({
    adjusted_price: '',
    scheduled_date: '',
    scheduled_time_start: '',
    scheduled_time_end: '',
    notes: ''
  });
  const [isRejection, setIsRejection] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateQuote = async (requestId) => {
    if (isRejection) {
      if (!rejectionReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }
    } else {
      if (!quoteData.adjusted_price || !quoteData.scheduled_date || 
          !quoteData.scheduled_time_start || !quoteData.scheduled_time_end) {
        alert('Please fill all required fields');
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/quotes',
        {
          request_id: requestId,
          ...quoteData,
          is_rejection: isRejection,
          rejection_reason: rejectionReason
        },
        {
          headers: {
            'Authorization': token
          }
        }
      );

      alert(isRejection ? 'Request rejected successfully' : 'Quote created successfully');
      setShowQuoteForm(false);
      setSelectedRequest(null);
      setQuoteData({
        adjusted_price: '',
        scheduled_date: '',
        scheduled_time_start: '',
        scheduled_time_end: '',
        notes: ''
      });
      setRejectionReason('');
      setIsRejection(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quote/rejection');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#007bff' }}>Service Requests</h2>
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
          <h3 style={{ marginBottom: '15px' }}>All Requests</h3>
          {requests.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No requests found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {requests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowQuoteForm(false);
                  }}
                  style={{
                    padding: '20px',
                    backgroundColor: selectedRequest?.id === request.id ? '#e7f3ff' : '#fff',
                    border: selectedRequest?.id === request.id ? '2px solid #007bff' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{request.service_address}</h4>
                      <p style={{ margin: '0', color: '#666' }}>
                        {request.firstName} {request.lastName} • {request.cleaning_type} • {request.num_rooms} rooms
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
                    <p style={{ margin: '5px 0' }}>
                      <strong>Contact:</strong> {request.email} • {request.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedRequest && (
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Request Details</h3>
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Address:</strong> {selectedRequest.service_address}</p>
              <p><strong>Client:</strong> {selectedRequest.firstName} {selectedRequest.lastName}</p>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              <p><strong>Phone:</strong> {selectedRequest.phone}</p>
              <p><strong>Type:</strong> {selectedRequest.cleaning_type}</p>
              <p><strong>Rooms:</strong> {selectedRequest.num_rooms}</p>
              <p><strong>Date:</strong> {new Date(selectedRequest.preferred_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedRequest.preferred_time}</p>
              <p><strong>Budget:</strong> ${parseFloat(selectedRequest.proposed_budget).toFixed(2)}</p>
              {selectedRequest.notes && <p><strong>Notes:</strong> {selectedRequest.notes}</p>}
              <p><strong>Status:</strong> <StatusBadge status={selectedRequest.status} /></p>
            </div>

            {(selectedRequest.status === 'pending' || selectedRequest.status === 'quote_sent') && !showQuoteForm && (
              <button
                onClick={() => setShowQuoteForm(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                Create Quote / Reject
              </button>
            )}

            {showQuoteForm && (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
                <h4>Create Quote or Reject</h4>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <input
                      type="radio"
                      checked={!isRejection}
                      onChange={() => setIsRejection(false)}
                      style={{ marginRight: '8px' }}
                    />
                    Create Quote
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      checked={isRejection}
                      onChange={() => setIsRejection(true)}
                      style={{ marginRight: '8px' }}
                    />
                    Reject Request
                  </label>
                </div>

                {isRejection ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="4"
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '15px' }}
                    />
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Adjusted Price ($) *
                      </label>
                      <input
                        type="number"
                        value={quoteData.adjusted_price}
                        onChange={(e) => setQuoteData({ ...quoteData, adjusted_price: e.target.value })}
                        min="0"
                        step="0.01"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Scheduled Date *
                      </label>
                      <input
                        type="date"
                        value={quoteData.scheduled_date}
                        onChange={(e) => setQuoteData({ ...quoteData, scheduled_date: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Time Start *
                      </label>
                      <input
                        type="time"
                        value={quoteData.scheduled_time_start}
                        onChange={(e) => setQuoteData({ ...quoteData, scheduled_time_start: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Time End *
                      </label>
                      <input
                        type="time"
                        value={quoteData.scheduled_time_end}
                        onChange={(e) => setQuoteData({ ...quoteData, scheduled_time_end: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Notes
                      </label>
                      <textarea
                        value={quoteData.notes}
                        onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                        rows="3"
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleCreateQuote(selectedRequest.id)}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: isRejection ? '#dc3545' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submitting ? 'Submitting...' : isRejection ? 'Reject Request' : 'Create Quote'}
                  </button>
                  <button
                    onClick={() => {
                      setShowQuoteForm(false);
                      setIsRejection(false);
                      setRejectionReason('');
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestManagement;

