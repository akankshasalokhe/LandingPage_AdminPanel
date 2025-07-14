// src/pages/GalleryManager.jsx
import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Modal, Form } from 'react-bootstrap';
import './css/Gallery.css';

// const API_BASE = 'http://localhost:5001/api/gallery';

const Gallery = () => {
  const [galleryData, setGalleryData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Awards',
    year: '',
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadGallery = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/gallery/get`);
      const data = await res.json();
      setGalleryData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load gallery data.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await fetch(`http://localhost:5001/api/gallery/delete/${id}`, { method: 'DELETE' });
        loadGallery();
      } catch (err) {
        console.error(err);
        setError('Failed to delete item.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.image || (form.category === 'Events' && !form.year)) {
      setError('Please fill all required fields.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', form.title);
    data.append('category', form.category);
    if (form.category === 'Events') data.append('year', form.year);
    data.append('image', form.image);

    try {
      const res = await fetch(`http://localhost:5001/api/gallery/upload`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Upload failed');
      }

      await loadGallery();
      setShowForm(false);
      setForm({ title: '', category: 'Awards', year: '', image: null });
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  return (
    <div className="p-4 gallery-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="gallery-title">Gallery</h2>
        <Button onClick={() => setShowForm(true)}> Add Gallery Item</Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {['Awards', 'Certifications', 'Ceremony'].map((category) => (
        <div key={category} className="mb-5">
          <h4 className="text-primary">{category}</h4>
          <Row>
            {galleryData[category]?.map((item) => (
              <Col md={4} key={item._id} className="mb-3">
                <Card className="gallery-card">
                  <Card.Img variant="top" src={item.imageUrl} className="gallery-image" />
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <div>
        <h4 className="text-primary">Events</h4>
        {galleryData.Events &&
          Object.keys(galleryData.Events).map((year) => (
            <div key={year} className="mb-4">
              <h5 className="text-secondary">{year}</h5>
              <Row>
                {galleryData.Events[year].map((item) => (
                  <Col md={4} key={item._id} className="mb-3">
                    <Card className="gallery-card">
                      <Card.Img variant="top" src={item.imageUrl} className="gallery-image" />
                      <Card.Body>
                        <Card.Title>{item.title}</Card.Title>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
      </div>

      {/* Modal Form */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Gallery Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={form.category} onChange={handleChange}>
                <option value="Awards">Awards</option>
                <option value="Certifications">Certifications</option>
                <option value="Ceremony">Ceremony</option>
                <option value="Events">Events</option>
              </Form.Select>
            </Form.Group>

            {form.category === 'Events' && (
              <Form.Group className="mb-3">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="text"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="e.g. 2025"
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Gallery;
