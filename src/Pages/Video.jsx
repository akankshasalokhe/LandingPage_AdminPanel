import React, { useState, useEffect } from 'react';

const API_URL = 'https://landingpagebackend-nine.vercel.app/api/video';

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all videos
  const fetchVideos = async () => {
    try {
      const res = await fetch('https://landingpagebackend-nine.vercel.app/api/video/get');
      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error('Fetch videos error:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'video/mp4') {
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('Only .mp4 video files are allowed.');
    }
  };

  // Upload video
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a valid video file.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);

    setUploading(true);
    try {
      const res = await fetch('https://landingpagebackend-nine.vercel.app/api/video/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        fetchVideos();
        setSelectedFile(null);
      } else {
        setError(result.error || 'Upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // Delete video
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`https://landingpagebackend-nine.vercel.app/api/video/delete/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchVideos();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🎬 Admin Video Manager</h2>

      <div className="card p-4 mb-4">
        <h5>Upload Video (.mp4 only)</h5>
        <input
          type="file"
          accept="video/mp4"
          className="form-control my-2"
          onChange={handleFileChange}
        />
        {error && <div className="text-danger mb-2">{error}</div>}
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      <div className="row">
        {videos.length === 0 ? (
          <p>No videos uploaded yet.</p>
        ) : (
          videos.map((video) => (
            <div key={video._id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <video
                  controls
                  src={video.video}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <p className="card-text">
                    <small>Uploaded: {new Date(video.createdAt).toLocaleString()}</small>
                  </p>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(video._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Video;
