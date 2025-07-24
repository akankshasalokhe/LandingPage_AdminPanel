import React, { useEffect, useState } from 'react';
import { Button, Container, Form, Modal, Table, Image } from 'react-bootstrap';

// const API_URL = 'https://landingpagebackend-nine.vercel.app/api/partner-section'; 

function BecomePartner() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ heading: '', features: '', fileName: '' });
  const [imageBase64, setImageBase64] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    const res = await fetch('https://landingpagebackend-nine.vercel.app/api/partner-section/get');
    const result = await res.json();
    setData(result.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Convert image to base64
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setForm(prev => ({ ...prev, fileName: file.name }));
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      heading: form.heading,
      features: form.features.split(',').map(f => f.trim()),
      fileName: form.fileName,
      imageBase64
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `https://landingpagebackend-nine.vercel.app/api/partner-section/update/${editingId}` : 
    'https://landingpagebackend-nine.vercel.app/api/partner-section/upload';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    resetForm();
    fetchData();
  };

  // Edit handler
  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      heading: entry.heading,
      features: entry.features.join(', '),
      fileName: ''
    });
    setImageBase64('');
    setShowModal(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await fetch(`https://landingpagebackend-nine.vercel.app/api/partner-section/delete/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const resetForm = () => {
    setForm({ heading: '', features: '', fileName: '' });
    setImageBase64('');
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between mb-4">
        <h3>Partner Section Management</h3>
        <Button onClick={() => setShowModal(true)}>+ Add New</Button>
      </div>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Heading</th>
            <th>Features</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, idx) => (
            <tr key={entry._id}>
              <td>{idx + 1}</td>
              <td><Image src={entry.image} thumbnail width={100} /></td>
              <td>{entry.heading}</td>
              <td>
                <ul>{entry.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
              </td>
              <td>
                <Button size="sm" variant="primary" onClick={() => handleEdit(entry)}>Edit</Button>{' '}
                <Button size="sm" variant="danger" onClick={() => handleDelete(entry._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={resetForm}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit Entry' : 'Add New Entry'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Heading</Form.Label>
              <Form.Control
                type="text"
                value={form.heading}
                onChange={(e) => setForm(prev => ({ ...prev, heading: e.target.value }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Features (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                value={form.features}
                onChange={(e) => setForm(prev => ({ ...prev, features: e.target.value }))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{editingId ? 'Change Image (optional)' : 'Upload Image'}</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editingId}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button variant="success" type="submit">{editingId ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default BecomePartner;
