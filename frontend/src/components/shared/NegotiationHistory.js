import React from 'react';

const NegotiationHistory = ({ responses, type = 'quote' }) => {
  if (!responses || responses.length === 0) {
    return <p style={{ color: '#666', fontStyle: 'italic' }}>No responses yet</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getResponseColor = (responseType) => {
    const colors = {
      'accept': '#28a745',
      'renegotiate': '#ffc107',
      'counter': '#17a2b8',
      'pay': '#28a745',
      'dispute': '#dc3545',
      'revise': '#007bff'
    };
    return colors[responseType] || '#6c757d';
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ marginBottom: '15px', color: '#333' }}>History</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {responses.map((response, index) => (
          <div
            key={response.id}
            style={{
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: `4px solid ${getResponseColor(response.response_type)}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: getResponseColor(response.response_type),
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}
                >
                  {response.response_type.replace('_', ' ')}
                </span>
                <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666' }}>
                  by {response.firstName} {response.lastName} ({response.role})
                </span>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>
                {formatDate(response.created_at)}
              </span>
            </div>
            
            {type === 'quote' && response.counter_note && (
              <p style={{ marginTop: '8px', color: '#333' }}>
                <strong>Note:</strong> {response.counter_note}
              </p>
            )}
            
            {type === 'bill' && response.dispute_note && (
              <p style={{ marginTop: '8px', color: '#333' }}>
                <strong>Dispute:</strong> {response.dispute_note}
              </p>
            )}
            
            {type === 'bill' && response.revised_amount && (
              <p style={{ marginTop: '8px', color: '#333' }}>
                <strong>Revised Amount:</strong> ${parseFloat(response.revised_amount).toFixed(2)}
              </p>
            )}
            
            {type === 'bill' && response.revision_note && (
              <p style={{ marginTop: '8px', color: '#333' }}>
                <strong>Note:</strong> {response.revision_note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NegotiationHistory;

