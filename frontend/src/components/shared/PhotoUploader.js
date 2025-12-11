import React, { useState } from 'react';
import axios from 'axios';

const PhotoUploader = ({ requestId, onUploadSuccess, existingPhotos = [] }) => {
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState(existingPhotos.map(p => p.photo_path));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (existingPhotos.length + photos.length + files.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }

    setError('');
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => {
      if (i < existingPhotos.length) return true; // Keep existing photos
      return i !== index + existingPhotos.length;
    });
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (photos.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/service-requests/${requestId}/photos`,
        formData,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setPhotos([]);
      if (onUploadSuccess) {
        onUploadSuccess(res.data.photos);
      }
      alert('Photos uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
        Photos (up to 5 total): {existingPhotos.length + photos.length} / 5
      </label>
      
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={existingPhotos.length + photos.length >= 5 || uploading}
        style={{ marginBottom: '10px' }}
      />

      {previews.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ position: 'relative', width: '150px', height: '150px' }}>
              <img
                src={preview.startsWith('http') ? `http://localhost:5000${preview}` : preview}
                alt={`Preview ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
              {index >= existingPhotos.length && (
                <button
                  onClick={() => removePhoto(index - existingPhotos.length)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </button>
      )}
    </div>
  );
};

export default PhotoUploader;

