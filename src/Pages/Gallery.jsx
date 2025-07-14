// src/pages/AdminGalleryPage.jsx
import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Table, Spinner } from 'react-bootstrap';
import './css/Gallery.css';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Awards',
    year: '',
    image: null,
  });
  const [editId, setEditId] = useState(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://landing-page-backend-alpha.vercel.app/api/gallery/get');
      const data = await res.json();
      console.log('Gallery response:', data); // Debugging
      if (data && Array.isArray(data.data)) {
        setGalleryItems(data.data);
      } else {
        setGalleryItems([]); // fallback
        console.error('Unexpected gallery response structure:', data);
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleImageUpload = async () => {
    const form = new FormData();
    form.append('image', formData.image);
    const res = await fetch('https://landing-page-backend-alpha.vercel.app/api/gallery/upload', {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let src = formData.image;
      if (formData.image instanceof File) {
        src = await handleImageUpload();
      }
      const payload = { ...formData, src };
      const options = {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      };
      const endpoint = editId
        ? `https://landing-page-backend-alpha.vercel.app/api/gallery/update/${editId}`
        : 'https://landing-page-backend-alpha.vercel.app/api/gallery/create';
      await fetch(endpoint, options);
      setShowModal(false);
      setFormData({ title: '', category: 'Awards', year: '', image: null });
      setEditId(null);
      fetchGallery();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      category: item.category,
      year: item.year || '',
      image: item.src,
    });
    setEditId(item._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this item?')) {
      await fetch(`https://landing-page-backend-alpha.vercel.app/api/gallery/delete/${id}`, {
        method: 'DELETE',
      });
      fetchGallery();
    }
  };

  return (
    <div className="admin-gallery-container">
      <h2>Gallery Management</h2>
      <Button onClick={() => setShowModal(true)} className="mb-3">
        Add Gallery Item
      </Button>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleryItems.map(item => (
              <tr key={item._id}>
                <td><img src={item.src} alt={item.title} className="thumb-img" /></td>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>{item.year}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit' : 'Add'} Gallery Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Awards</option>
                <option>Certifications</option>
                <option>Ceremony</option>
                <option>Events</option>
              </Form.Select>
            </Form.Group>
            {formData.category === 'Events' && (
              <Form.Group className="mb-2">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-2">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
              />
              {formData.image && typeof formData.image === 'string' && (
                <img src={formData.image} alt="preview" className="thumb-img mt-2" />
              )}
            </Form.Group>
            <Button type="submit" variant="primary">
              {editId ? 'Update' : 'Add'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Gallery;
