import React, { useEffect, useState } from 'react';
import {
  Button, Modal, Form, Table, Spinner, Container, Row, Col, Pagination,
} from 'react-bootstrap';
import './css/Gallery.css';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Awards',
    year: '',
    src: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch gallery items
  const fetchItems = async () => {
    try {
      const res = await fetch('https://landing-page-backend-alpha.vercel.app/api/gallery/get');
      const data = await res.json();
      setGalleryItems(data.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterAndPaginate();
  }, [galleryItems, selectedCategory, currentPage]);

  const filterAndPaginate = () => {
    let items = [...galleryItems];
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }
    setFilteredItems(items);
  };

  // Handle form submit (already correct)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.src;

      if (imageFile) {
        const form = new FormData();
        form.append('image', imageFile);

        const resUpload = await fetch('https://landing-page-backend-alpha.vercel.app/api/gallery/upload', {
          method: 'POST',
          body: form,
        });

        const uploadData = await resUpload.json();
        if (!uploadData.url) throw new Error('Image upload failed');
        imageUrl = uploadData.url;
      }

      const payload = {
        ...formData,
        src: imageUrl,
      };

      const response = await fetch(
        editingId
          ? `https://landing-page-backend-alpha.vercel.app/api/gallery/update/${editingId}`
          : 'https://landing-page-backend-alpha.vercel.app/api/gallery/create',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error('Submit failed');

      setFormData({ title: '', category: 'Awards', year: '', src: '' });
      setImageFile(null);
      setEditingId(null);
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error('Error submitting:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      await fetch(`https://landing-page-backend-alpha.vercel.app/api/gallery/delete/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      category: item.category,
      year: item.year || '',
      src: item.src,
    });
    setEditingId(item._id);
    setShowModal(true);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <Container className="gallery-container mt-4">
      <Row className="mb-3">
        <Col><h3>Gallery Management</h3></Col>
        <Col className="text-end">
          <Button className="add-button" onClick={() => setShowModal(true)}>
            Add New
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Select value={selectedCategory} onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}>
            <option value="All">All Categories</option>
            <option value="Awards">Awards</option>
            <option value="Certifications">Certifications</option>
            <option value="Ceremony">Ceremony</option>
            <option value="Events">Events</option>
          </Form.Select>
        </Col>
      </Row>

      <Table responsive bordered hover className="gallery-table">
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
          {paginatedItems.length === 0 ? (
            <tr><td colSpan="5">No gallery items found.</td></tr>
          ) : (
            paginatedItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <img src={item.src} alt={item.title} width="100" />
                </td>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>{item.year || '-'}</td>
                <td>
                  <Button variant="warning" size="sm" className="action-button" onClick={() => handleEdit(item)}>Edit</Button>{' '}
                  <Button variant="danger" size="sm" className="action-button" onClick={() => handleDelete(item._id)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          {[...Array(totalPages).keys()].map((page) => (
            <Pagination.Item
              key={page + 1}
              active={page + 1 === currentPage}
              onClick={() => handlePageChange(page + 1)}
            >
              {page + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="modal-form" onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Awards</option>
                <option>Certifications</option>
                <option>Ceremony</option>
                <option>Events</option>
              </Form.Select>
            </Form.Group>

            {formData.category === 'Events' && (
              <Form.Group className="mb-3">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
              {formData.src && !imageFile && (
                <img src={formData.src} alt="Preview" className="img-fluid mt-2" />
              )}
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>{' '}
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Gallery;
