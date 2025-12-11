import React from 'react';

const StatusBadge = ({ status, type = 'request' }) => {
  const getStatusColor = () => {
    const statusColors = {
      // Request statuses
      'pending': '#ffc107',
      'quote_sent': '#17a2b8',
      'accepted': '#28a745',
      'rejected': '#dc3545',
      'canceled': '#6c757d',
      
      // Quote/Order statuses
      'scheduled': '#17a2b8',
      'in_progress': '#ffc107',
      'completed': '#28a745',
      'renegotiating': '#ffc107',
      
      // Bill statuses
      'paid': '#28a745',
      'disputed': '#dc3545'
    };
    
    return statusColors[status] || '#6c757d';
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        backgroundColor: getStatusColor(),
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: '500',
        textTransform: 'capitalize'
      }}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;

