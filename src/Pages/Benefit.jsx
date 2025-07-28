import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Benefit = () => {
    const [benefits, setBenefits] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBenefit, setSelectedBenefit] = useState(null);
    const [alert, setAlert] = useState({ show: false, variant: '', message: '' });

    const [formData, setFormData] = useState({
        heading: '',
        description: '',
        imageFile: null,
        imageBase64: '',
    });

    const fetchBenefits = async () => {
        try {
            const res = await fetch('https://landingpagebackend-nine.vercel.app/api/benifits/get');
            const text = await res.text();
            const data = JSON.parse(text);
            setBenefits(data);
        } catch (error) {
            console.error('Error fetching benefits:', error);
            setBenefits([]);
        }
    };

    useEffect(() => {
        fetchBenefits();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFormData({ ...formData, imageFile: file });

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({ ...prev, imageBase64: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            heading: formData.heading,
            description: formData.description,
            imageBase64: formData.imageBase64,
            imageName: formData.imageFile?.name || 'benefit-image',
        };

        const url = editMode
            ? `https://landingpagebackend-nine.vercel.app/api/benifits/update/${selectedBenefit._id}`
            : 'https://landingpagebackend-nine.vercel.app/api/benifits/create';

        const method = editMode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                fetchBenefits();
                showAlert('success', editMode ? 'Benefit updated successfully!' : 'Benefit added successfully!');
                handleClose();
            } else {
                showAlert('danger', 'Failed to save benefit.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            showAlert('danger', 'Something went wrong. Please try again.');
        }
    };

    const handleEdit = (benefit) => {
        setEditMode(true);
        setSelectedBenefit(benefit);
        setFormData({
            heading: benefit.heading,
            description: benefit.description,
            imageFile: null,
            imageBase64: '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit?')) {
            try {
                const res = await fetch(`https://landingpagebackend-nine.vercel.app/api/benifits/delete/${id}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    fetchBenefits();
                    showAlert('success', 'Benefit deleted successfully!');
                } else {
                    showAlert('danger', 'Failed to delete benefit.');
                }
            } catch (err) {
                showAlert('danger', 'Something went wrong during deletion.');
            }
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setEditMode(false);
        setSelectedBenefit(null);
        setFormData({
            heading: '',
            description: '',
            imageFile: null,
            imageBase64: '',
        });
    };

    const showAlert = (variant, message) => {
        setAlert({ show: true, variant, message });
        setTimeout(() => setAlert({ show: false, variant: '', message: '' }), 3000);
    };

    return (
        <Container className="py-4">
            {/* Alert */}
            {alert.show && (
                <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
                    {alert.message}
                </Alert>
            )}

            {/* Title & Button */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <h3 style={{ fontWeight: 600, color: 'blue', margin: 'auto', fontSize:'25px' }}>Benefit Management</h3>
                <Button onClick={() => setShowModal(true)} style={{ position: 'absolute', right: '20px' }}>
                    Add New Benefit
                </Button>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Image</th>
                        <th>Heading</th>
                        <th>Description</th>
                        <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {benefits.map((benefit, index) => (
                        <tr key={benefit._id}>
                            <td>{index + 1}</td>
                            <td>
                                <img
                                    src={benefit.imageUrl || benefit.imageBase64 || ''}
                                    alt={benefit.heading}
                                    width="80"
                                    style={{ objectFit: 'cover' }}
                                />
                            </td>
                            <td>{benefit.heading}</td>
                            <td>{benefit.description}</td>
                            <td className="d-flex justify-content-center align-items-center">
                                <FaEdit
                                    size={20}
                                    style={{ cursor: 'pointer', marginRight: 10 }}
                                    onClick={() => handleEdit(benefit)}
                                />
                                <FaTrash
                                    size={18}
                                    style={{ cursor: 'pointer', color: 'red' }}
                                    onClick={() => handleDelete(benefit._id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal */}
            <Modal show={showModal} onHide={handleClose} centered>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editMode ? 'Edit Benefit' : 'Add Benefit'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Heading</Form.Label>
                            <Form.Control
                                type="text"
                                name="heading"
                                value={formData.heading}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required={!editMode}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editMode ? 'Update' : 'Add'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Benefit;
