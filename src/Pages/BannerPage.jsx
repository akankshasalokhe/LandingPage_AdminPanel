import React, { useEffect, useState } from 'react';
import './css/Banner.css';

const AdminBannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [selectedPage, setSelectedPage] = useState('Home');
  const [newImage, setNewImage] = useState(null);
  const [pages, setPages] = useState([]);
  const [editBannerId, setEditBannerId] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editPage, setEditPage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = 'https://landingpagebackend-nine.vercel.app/api/banner';

  useEffect(() => {
    fetchBanners();
    fetchPages();
  }, []);

  const fetchBanners = async () => {
    const res = await fetch(`${API_BASE}/get`);
    const data = await res.json();
    setBanners(data);
  };

  const fetchPages = async () => {
    const res = await fetch(`${API_BASE}/pages`);
    const data = await res.json();
    setPages(data);
  };

  const handleAddBanner = async () => {
    if (!newImage || !selectedPage) return alert('Select page and image/video.');
    const formData = new FormData();
    formData.append('page', selectedPage);
    formData.append('file', newImage);

    setLoading(true);
    const res = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      body: formData
    });
    setLoading(false);

    if (res.ok) {
      alert('Banner added.');
      setNewImage(null);
      fetchBanners();
      fetchPages();
    } else {
      alert('Failed to add banner.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    const res = await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Deleted.');
      fetchBanners();
      fetchPages();
    }
  };

  const handleEditBanner = (banner) => {
    setEditBannerId(banner._id);
    setEditPage(banner.page);
    setEditImage(null);
  };

  const handleUpdateBanner = async () => {
  if (!editBannerId || !editPage) return alert('Missing data.');

  try {
    const formData = new FormData();
    formData.append('page', editPage);
    if (editImage) formData.append('file', editImage);

    const res = await fetch(`${API_BASE}/update/${editBannerId}`, {
      method: 'PUT',
      body: formData
    });

    if (res.ok) {
      alert('Updated.');
      setEditBannerId(null);
      setEditPage('');
      setEditImage(null);
      fetchBanners();
      fetchPages();
    } else {
      const errData = await res.json();
      console.error('Update failed:', errData);
      alert('Failed to update.');
    }
  } catch (error) {
    console.error('Network or server error:', error);
    alert('Network or server error occurred.');
  }
};


  const filteredBanners = banners.filter(b => b.page === selectedPage);

  return (
    <div className="admin-banner-container">
      <h3>Admin Banner Management</h3>

      <div className="page-selector">
        <label>Select Page:</label>
        <select
          value={selectedPage}
          className="form-select"
          onChange={(e) => setSelectedPage(e.target.value)}
        >
          <option value="">-- Select Page --</option>
          {pages.map((page, i) => <option key={i} value={page}>{page}</option>)}
        </select>

        <input
          className="form-control mt-2"
          placeholder="Add new page"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newPageRaw = e.target.value.trim().toLowerCase();
              if (newPageRaw && !pages.map(p => p.toLowerCase()).includes(newPageRaw)) {
                const newPage = newPageRaw.charAt(0).toUpperCase() + newPageRaw.slice(1);
                setPages([...pages, newPage]);
                setSelectedPage(newPage);
                e.target.value = '';
              }
            }
          }}
        />
      </div>

      <div className="upload-section mt-3">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={e => setNewImage(e.target.files[0])}
        />
        <button className="btn btn-primary ms-2" onClick={handleAddBanner} disabled={loading}>
          {loading ? 'Uploading...' : 'Add Banner'}
        </button>
      </div>

      <div className="row mt-4">
        {filteredBanners.length === 0 && selectedPage && (
          <p>No banners found for this page.</p>
        )}

        {filteredBanners.map(banner => (
          <div key={banner._id} className="col-md-4 mb-4">
            <div className="card shadow-sm">
              {banner.fileType === 'video' ? (
                <video
                  controls
                  className="card-img-top"
                  style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                >
                  <source src={banner.imageUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={banner.imageUrl}
                  alt="Banner"
                  className="card-img-top"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <strong>Page:</strong> {banner.page} <br />
                <strong>Type:</strong> {banner.fileType}
                <div className="d-flex justify-content-between mt-2">
                  <button className="btn btn-warning btn-sm" onClick={() => handleEditBanner(banner)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(banner._id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editBannerId && (
        <div className="edit-section mt-5">
          <h5>Edit Banner</h5>
          <input
            type="text"
            className="form-control mb-2"
            value={editPage}
            onChange={(e) => setEditPage(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*"
            className="form-control mb-3"
            onChange={(e) => setEditImage(e.target.files[0])}
          />
          <button className="btn btn-success me-2" onClick={handleUpdateBanner}>Save</button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setEditBannerId(null);
              setEditPage('');
              setEditImage(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminBannerPage;
