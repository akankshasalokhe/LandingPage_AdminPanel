import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';

const ContentSectionPage = () => {
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    Heading: '',
    Subheading: '',
    content: [{ title: '', description: '' }],
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSections = async () => {
    try {
      const res = await fetch("https://landingpagebackend-nine.vercel.app/api/contentsection/get");
      const data = await res.json();
      setSections(data);
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleChange = (idx, field, value) => {
    const updated = [...formData.content];
    updated[idx][field] = value;
    setFormData({ ...formData, content: updated });
  };

  const addContentItem = () => {
    setFormData({
      ...formData,
      content: [...formData.content, { title: '', description: '' }],
    });
  };

  const handleFileChange = e => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('Heading', formData.Heading);
    form.append('Subheading', formData.Subheading);
    form.append('content', JSON.stringify(formData.content));
    if (formData.image) form.append('image', formData.image);

    const method = editId ? 'PUT' : 'POST';
    const endpoint = editId
      ? `https://landing-page-backend-alpha.vercel.app/api/contentsection/update/${editId}`
      : `https://landing-page-backend-alpha.vercel.app/api/contentsection/create`;

    try {
      const res = await fetch(endpoint, { method, body: form });
      if (!res.ok) throw new Error(await res.text());
      await fetchSections();
      setFormData({
        Heading: '',
        Subheading: '',
        content: [{ title: '', description: '' }],
        image: null,
      });
      setEditId(null);
      setShowModal(false);
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleEdit = section => {
    setEditId(section._id);
    setFormData({
      Heading: section.Heading,
      Subheading: section.Subheading,
      content: section.content,
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`https://landing-page-backend-alpha.vercel.app/api/contentsection/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      await fetchSections();
    } catch (err) {
      console.error('Error deleting section:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Content Sections</h2>
      <div className="d-flex justify-content-end mb-3">
        <Button onClick={() => {
          setEditId(null);
          setFormData({ Heading: '', Subheading: '', content: [{ title: '', description: '' }], image: null });
          setShowModal(true);
        }}>
          Add New Section
        </Button>
      </div>

      <Row>
        {sections.map(sec => (
          <Col xs={12} sm={6} md={4} key={sec._id} className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-100 border-0 shadow-sm">
                {sec.image && <Card.Img variant="top" src={sec.image} style={{ height: '160px', objectFit: 'cover' }} />}
                <Card.Body>
                  <Card.Title className="fs-5">{sec.Heading}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{sec.Subheading}</Card.Subtitle>
                  {sec.content.map((item, idx) => (
                    <div key={idx} className="mb-1">
                      <strong>{item.title}</strong>: {item.description}
                    </div>
                  ))}
                  <div className="d-flex gap-2 mt-3">
                    <Button variant="outline-warning" size="sm" onClick={() => handleEdit(sec)}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(sec._id)}>Delete</Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit' : 'Add'} Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Heading</Form.Label>
              <Form.Control
                value={formData.Heading}
                onChange={e => setFormData({ ...formData, Heading: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subheading</Form.Label>
              <Form.Control
                value={formData.Subheading}
                onChange={e => setFormData({ ...formData, Subheading: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image {editId ? '(optional)' : '(required)'}</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                required={!editId}
              />
            </Form.Group>

            <h5>Content Items</h5>
            {formData.content.map((item, idx) => (
              <Row key={idx} className="mb-2">
                <Col>
                  <Form.Control
                    placeholder="Title"
                    value={item.title}
                    onChange={e => handleChange(idx, 'title', e.target.value)}
                    required
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Description"
                    value={item.description}
                    onChange={e => handleChange(idx, 'description', e.target.value)}
                    required
                  />
                </Col>
              </Row>
            ))}
            <Button onClick={addContentItem} variant="secondary" className="mb-3">Add Item</Button>
            <div>
              <Button type="submit">{editId ? 'Update' : 'Create'}Section</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ContentSectionPage;
