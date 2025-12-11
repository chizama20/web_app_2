import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhotoUploader from '../common/PhotoUploader';

const ServiceRequestForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service_address: '',
    cleaning_type: 'basic',
    num_rooms: '',
    preferred_date: '',
    preferred_time: '',
    proposed_budget: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/service-requests',
        formData,
        {
          headers: {
            'Authorization': token
          }
        }
      );

      setRequestId(res.data.requestId);
      alert('Service request created successfully! You can now upload photos.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create service request');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotosUploaded = () => {
    navigate('/my-requests');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '20px' }}>
        Submit Service Request
      </h2>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Service Address *
          </label>
          <input
            type="text"
            name="service_address"
            value={formData.service_address}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Cleaning Type *
          </label>
          <select
            name="cleaning_type"
            value={formData.cleaning_type}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="basic">Basic</option>
            <option value="deep cleaning">Deep Cleaning</option>
            <option value="move-out">Move-Out</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Number of Rooms *
          </label>
          <input
            type="number"
            name="num_rooms"
            value={formData.num_rooms}
            onChange={handleChange}
            required
            min="1"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Preferred Date *
          </label>
          <input
            type="date"
            name="preferred_date"
            value={formData.preferred_date}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Preferred Time *
          </label>
          <input
            type="time"
            name="preferred_time"
            value={formData.preferred_time}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Proposed Budget ($) *
          </label>
          <input
            type="number"
            name="proposed_budget"
            value={formData.proposed_budget}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Notes (Special Instructions)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {requestId && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px' }}>
          <h3 style={{ color: '#155724', marginBottom: '15px' }}>Upload Photos (Optional)</h3>
          <PhotoUploader
            requestId={requestId}
            onUploadSuccess={handlePhotosUploaded}
          />
          <button
            onClick={() => navigate('/my-requests')}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Skip Photos & View Requests
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestForm;

