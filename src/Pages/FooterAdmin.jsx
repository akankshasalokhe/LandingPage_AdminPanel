import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Table,
  Row,
  Col,
  Container,
  Image,
} from 'react-bootstrap';

const FooterAdmin = () => {
  const [footer, setFooter] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    socialLinks: [],
  });

  const fetchFooter = async () => {
    try {
      const res = await fetch('https://landingpagebackend-nine.vercel.app/api/footer/get');
      const data = await res.json();
      setFooter(data);
    } catch (err) {
      console.error('Error fetching footer:', err);
    }
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { type: '', image: '', link: '' }],
    }));
  };

  const handleSocialChange = (index, field, value) => {
    const updated = [...formData.socialLinks];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, socialLinks: updated }));
  };

  const handleDeleteSocialLink = (index) => {
    const updated = [...formData.socialLinks];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, socialLinks: updated }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('https://landingpagebackend-nine.vercel.app/api/footer/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setFooter(data);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving footer:', err);
    }
  };

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Footer Page</h4>
        <Button
          variant="primary"
          onClick={() => {
            setFormData(footer || {
              companyName: '',
              description: '',
              phone: '',
              email: '',
              website: '',
              address: '',
              socialLinks: [],
            });
            setShowModal(true);
          }}
        >
          Add Details
        </Button>
      </div>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Website Name</th>
            <th>Contact</th>
            <th>Website Link</th>
            <th>Address</th>
            <th>Social Media</th>
          </tr>
        </thead>
        <tbody>
          {footer ? (
            <tr>
              <td>
                <strong>{footer.companyName}</strong><br />
                {footer.description}
              </td>
              <td>
                <div><b>Email:</b> {footer.email}</div>
                <div><b>Phone:</b> {footer.phone}</div>
              </td>
              <td>{footer.website}</td>
              <td>{footer.address}</td>
              <td>
                {footer.socialLinks && footer.socialLinks.map((item, idx) => (
                  <div key={idx} className="mb-2">
                    <a href={item.link} target="_blank" rel="noreferrer">
                      <Image
                        src={item.image}
                        alt={item.type}
                        width="30"
                        height="30"
                        title={item.type}
                        className="me-2"
                        rounded
                      />
                      {item.type}
                    </a>
                  </div>
                ))}
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No footer data found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Footer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <h6>Website Info</h6>
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control name="companyName" value={formData.companyName} onChange={handleInput} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleInput} />
            </Form.Group>

            <h6>Contact Info</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone" value={formData.phone} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control name="email" value={formData.email} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control name="website" value={formData.website} onChange={handleInput} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control name="address" value={formData.address} onChange={handleInput} />
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mt-3">Social Media</h6>
            <Button variant="info" className="mb-3" onClick={handleAddSocialLink}>+ Add Link</Button>

            {formData.socialLinks.map((item, index) => (
              <Row key={index} className="align-items-center mb-3">
                <Col md={2}>
                  <Form.Control
                    type="text"
                    placeholder="Type (e.g. Facebook)"
                    value={item.type}
                    onChange={(e) => handleSocialChange(index, 'type', e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="text"
                    placeholder="Image URL"
                    value={item.image}
                    onChange={(e) => handleSocialChange(index, 'image', e.target.value)}
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Link"
                    value={item.link}
                    onChange={(e) => handleSocialChange(index, 'link', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Button variant="danger" onClick={() => handleDeleteSocialLink(index)}>Delete</Button>
                </Col>
              </Row>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FooterAdmin;
