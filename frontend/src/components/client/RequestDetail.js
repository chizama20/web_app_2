import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../common/StatusBadge';
import NegotiationHistory from '../common/NegotiationHistory';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [responseType, setResponseType] = useState('accept');
  const [counterNote, setCounterNote] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchRequest();
    fetchQuotes();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/service-requests/${id}`, {
        headers: {
          'Authorization': token
        }
      });
      setRequest(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch request');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/service-requests/${id}/quotes`, {
        headers: {
          'Authorization': token
        }
      });
      setQuotes(res.data);
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    }
  };

  const handleQuoteResponse = async (quoteId) => {
    if (responseType !== 'accept' && !counterNote.trim()) {
      alert('Please provide a counter note');
      return;
    }

    setResponding(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/quotes/${quoteId}/responses`,
        {
          response_type: responseType,
          counter_note: responseType !== 'accept' ? counterNote : null
        },
        {
          headers: {
            'Authorization': token
          }
        }
      );

      alert('Response submitted successfully!');
      setSelectedQuote(null);
      setCounterNote('');
      fetchRequest();
      fetchQuotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error || !request) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error || 'Request not found'}</p>
        <Link to="/my-requests">Back to Requests</Link>
      </div>
    );
  }

  const activeQuotes = quotes.filter(q => q.status === 'pending' || q.status === 'renegotiating');

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/my-requests" style={{ color: '#007bff', textDecoration: 'none' }}>
          ← Back to Requests
        </Link>
      </div>

      <h2 style={{ color: '#007bff', marginBottom: '20px' }}>Service Request Details</h2>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0' }}>{request.service_address}</h3>
            <p style={{ margin: '5px 0', color: '#666' }}>
              <strong>Type:</strong> {request.cleaning_type} • <strong>Rooms:</strong> {request.num_rooms}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div style={{ marginTop: '15px' }}>
          <p><strong>Preferred Date:</strong> {new Date(request.preferred_date).toLocaleDateString()}</p>
          <p><strong>Preferred Time:</strong> {request.preferred_time}</p>
          <p><strong>Proposed Budget:</strong> ${parseFloat(request.proposed_budget).toFixed(2)}</p>
          {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
        </div>

        {request.photos && request.photos.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Photos</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {request.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000${photo.photo_path}`}
                  alt={`Photo ${index + 1}`}
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Quotes</h3>

      {quotes.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No quotes yet. Waiting for contractor response.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {quotes.map((quote) => (
            <div
              key={quote.id}
              style={{
                padding: '20px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            >
              {quote.is_rejection ? (
                <div>
                  <h4 style={{ color: '#dc3545' }}>Request Rejected</h4>
                  <p><strong>Reason:</strong> {quote.rejection_reason}</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    {new Date(quote.created_at).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 10px 0' }}>Quote #{quote.id}</h4>
                      <p><strong>Price:</strong> ${parseFloat(quote.adjusted_price).toFixed(2)}</p>
                      <p><strong>Scheduled:</strong> {new Date(quote.scheduled_date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {quote.scheduled_time_start} - {quote.scheduled_time_end}</p>
                      {quote.notes && <p><strong>Notes:</strong> {quote.notes}</p>}
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>

                  {quote.responses && quote.responses.length > 0 && (
                    <NegotiationHistory responses={quote.responses} type="quote" />
                  )}

                  {quote.status === 'pending' || quote.status === 'renegotiating' ? (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <h4>Respond to Quote</h4>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                          <input
                            type="radio"
                            value="accept"
                            checked={responseType === 'accept'}
                            onChange={(e) => setResponseType(e.target.value)}
                            style={{ marginRight: '8px' }}
                          />
                          Accept
                        </label>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                          <input
                            type="radio"
                            value="renegotiate"
                            checked={responseType === 'renegotiate'}
                            onChange={(e) => setResponseType(e.target.value)}
                            style={{ marginRight: '8px' }}
                          />
                          Renegotiate
                        </label>
                      </div>
                      {responseType !== 'accept' && (
                        <textarea
                          placeholder="Enter your counter note..."
                          value={counterNote}
                          onChange={(e) => setCounterNote(e.target.value)}
                          rows="3"
                          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '10px' }}
                        />
                      )}
                      <button
                        onClick={() => handleQuoteResponse(quote.id)}
                        disabled={responding}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: responding ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {responding ? 'Submitting...' : 'Submit Response'}
                      </button>
                    </div>
                  ) : quote.status === 'accepted' && (
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                      <p style={{ margin: 0, color: '#155724' }}>✓ Quote accepted! Order has been created.</p>
                      <Link
                        to="/my-orders"
                        style={{ color: '#007bff', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}
                      >
                        View Orders →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestDetail;

