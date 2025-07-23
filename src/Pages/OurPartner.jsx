import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const OurPartner = () => {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({ name: "", file: null });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = "https://landingpagebackend-nine.vercel.app/api/partners";

  const fetchPartners = async (page = 1) => {
    try {
      const res = await fetch(`${API_URL}/get?page=${page}&limit=5`);
      if (!res.ok) {
        const errText = await res.text();
        console.error("Fetch failed:", errText);
        return;
      }

      const result = await res.json();

      if (!Array.isArray(result.data)) {
        console.error("Invalid API response:", result);
        return;
      }

      setPartners(result.data);
      setCurrentPage(result.currentPage || 1);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  useEffect(() => {
    fetchPartners(currentPage);
  }, [currentPage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    if (form.file) formData.append("file", form.file);

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_URL}/update/${editingId}`
      : `${API_URL}/create`;

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response:", text);
        alert("Error submitting form");
        return;
      }

      await res.json();
      setForm({ name: "", file: null });
      setEditingId(null);
      setShowModal(false);
      setCurrentPage(1);
      fetchPartners(1);
    } catch (err) {
      console.error("Submit failed:", err);
      alert("An error occurred while submitting.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this partner?")) return;

    try {
      const res = await fetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCurrentPage(1);
        fetchPartners(1);
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (partner) => {
    setForm({ name: partner.name, file: null });
    setEditingId(partner._id);
    setShowModal(true);
  };

  const openModal = () => {
    setForm({ name: "", file: null });
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Our Partners</h3>
        <Button variant="primary" onClick={openModal}>
          + Add Partner
        </Button>
      </div>

      {/* Partner Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Media</th>
            <th style={{ width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(partners) && partners.length > 0 ? (
            partners.map((partner) => (
              <tr key={partner._id}>
                <td>{partner.name}</td>
                <td>
                  {partner.fileUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={partner.fileUrl}
                      width="120"
                      height="80"
                      controls
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={partner.fileUrl}
                      alt={partner.name}
                      width="120"
                      height="80"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(partner)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(partner._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No partners found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="secondary"
          className="me-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </Button>
        <span className="align-self-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          className="ms-2"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>

      {/* Modal for Add/Edit Partner */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? "Edit Partner" : "Add Partner"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Partner Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                {editingId ? "Replace Media (optional)" : "Upload Media"}
              </Form.Label>
              <Form.Control
                type="file"
                name="file"
                accept="image/*,video/*"
                onChange={handleChange}
                required={!editingId}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default OurPartner;
