import React, { useEffect, useState } from 'react';
import {
  Button, Modal, Form, Table, Spinner, Container, Row, Col, Pagination,
} from 'react-bootstrap';
import './css/Gallery.css';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    year: '',
    src: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('https://landing-page-backend-alpha.vercel.app/api/categories/get');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
      items = items.filter(item => item.category === selectedCategory || item.category?.name === selectedCategory);
    }
    setFilteredItems(items);
  };

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

      const payload = { ...formData, src: imageUrl };

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

      setFormData({ title: '', category: '', year: '', src: '' });
      setImageFile(null);
      setEditingId(null);
      setShowGalleryModal(false);
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
      category: item.category?._id || item.category,
      year: item.year || '',
      src: item.src,
    });
    setEditingId(item._id);
    setShowGalleryModal(true);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const res = await fetch('https://landing-page-backend-alpha.vercel.app/api/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        fetchCategories();
        setFormData(prev => ({ ...prev, category: newCategory.trim() }));
        setNewCategory('');
        setShowCategoryModal(false);
      } else {
        alert('Category creation failed.');
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container className="gallery-container mt-4">
      <Row className="mb-3">
        <Col><h3>Gallery Management</h3></Col>
        <Col className="text-end">
          <Button className="add-button" onClick={() => {
            setFormData({ title: '', category: '', year: '', src: '' });
            setImageFile(null);
            setEditingId(null);
            setShowGalleryModal(true);
          }}>
            Add New
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Select
  value={formData.category}
  required
  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
>
  <option value="">Select a category</option>
  {categories.map((cat) => (
    <option key={cat._id} value={cat._id}>
      {cat.name}
    </option>
  ))}
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
                <td><img src={item.src} alt={item.title} width="100" /></td>
                <td>{item.title}</td>
                <td>{item.category?.name || item.category || 'Unknown'}</td>
                <td>{item.year || '-'}</td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEdit(item)}>Edit</Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
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

      {/* Gallery Modal */}
      <Modal show={showGalleryModal} onHide={() => setShowGalleryModal(false)} centered>
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
              <div className="d-flex">
                <Form.Select
                  value={formData.category}
                  required
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="info" className="ms-2" onClick={() => setShowCategoryModal(true)}>
                  +
                </Button>
              </div>
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
              <Button variant="secondary" onClick={() => setShowGalleryModal(false)}>
                Cancel
              </Button>{' '}
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Category Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            handleAddCategory();
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </Button>{' '}
              <Button type="submit">Create</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Gallery;
