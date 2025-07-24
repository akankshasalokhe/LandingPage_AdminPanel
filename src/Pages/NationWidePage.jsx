import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Row, Col, Image, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';

const NationWidePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [form, setForm] = useState({
    heading: '',
    subheading: '',
    image: null,
    features: []
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://landingpagebackend-nine.vercel.app/api/nationwide/get`);
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setItems(data.data || []);
      } catch {
        toast.error('Invalid server response');
      }
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleFeatureTextChange = (index, value) => {
    const updated = [...form.features];
    updated[index].text = value;
    setForm({ ...form, features: updated });
  };

  const handleFeatureImageChange = (index, file) => {
    const updated = [...form.features];
    updated[index].image = file;
    setForm({ ...form, features: updated });
  };

  const addFeatureField = () => {
    setForm({ ...form, features: [...form.features, { text: '', image: null }] });
  };

  const removeFeatureField = (index) => {
    const updated = [...form.features];
    updated.splice(index, 1);
    setForm({ ...form, features: updated });
  };

  const handleEdit = (item) => {
    const mappedFeatures = item.features.map((f) => ({ text: f, image: null }));
    setEditItem(item);
    setForm({
      heading: item.heading,
      subheading: item.subheading,
      image: null,
      features: mappedFeatures
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`https://landingpagebackend-nine.vercel.app/api/nationwide/delete/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error();
      toast.success('Item deleted');
      fetchItems();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('heading', form.heading);
    formData.append('subheading', form.subheading);

    const featureTexts = form.features.map((f) => f.text);
    formData.append('features', JSON.stringify(featureTexts));

    if (form.image) {
      formData.append('image', form.image);
    }

    form.features.forEach((f) => {
      if (f.image) {
        formData.append('arrayofimage', f.image);
      }
    });

    const method = editItem ? 'PUT' : 'POST';
    const url = editItem
      ? `https://landingpagebackend-nine.vercel.app/api/nationwide/update/${editItem._id}`
      : 'https://landingpagebackend-nine.vercel.app/api/nationwide/create';

    try {
      const res = await fetch(url, {
        method,
        body: formData
      });

      const text = await res.text();
      const result = JSON.parse(text);

      if (res.ok) {
        toast.success(editItem ? 'Item updated' : 'Item created');
        fetchItems();
        handleCloseModal();
      } else {
        throw new Error(result.error || 'Submit failed');
      }
    } catch (error) {
      toast.error('Submit failed');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({
      heading: '',
      subheading: '',
      image: null,
      features: []
    });
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Nationwide Items</h3>
        <Button onClick={() => setShowModal(true)}>Add New</Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Heading</th>
              <th>Subheading</th>
              <th>Image</th>
              <th>Features</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item._id}>
                <td>{i + 1}</td>
                <td>{item.heading}</td>
                <td>{item.subheading}</td>
                <td>
                  <Image src={item.image} thumbnail width={80} alt="Main" />
                </td>
                <td>
                  <ul>
                    {item.features.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <Button variant="warning" size="sm" onClick={() => handleEdit(item)}>Edit</Button>{' '}
                  <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editItem ? 'Edit' : 'Create'} Nationwide Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Heading</Form.Label>
                  <Form.Control
                    name="heading"
                    value={form.heading}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Subheading</Form.Label>
                  <Form.Control
                    name="subheading"
                    value={form.subheading}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label>Features</Form.Label>
              {form.features.map((feature, index) => (
                <Row key={index} className="mb-3 align-items-center">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Feature text"
                      value={feature.text}
                      onChange={(e) => handleFeatureTextChange(index, e.target.value)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="file"
                      onChange={(e) => handleFeatureImageChange(index, e.target.files[0])}
                    />
                  </Col>
                  <Col md={2}>
                    <Button variant="danger" onClick={() => removeFeatureField(index)}>Remove</Button>
                  </Col>
                </Row>
              ))}
              <Button variant="secondary" onClick={addFeatureField}>Add Feature</Button>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Main Image</Form.Label>
              <Form.Control type="file" name="image" onChange={handleMainImageChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!form.heading || !form.subheading}
          >
            {editItem ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NationWidePage;
