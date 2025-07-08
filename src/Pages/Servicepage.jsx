import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Displayinfo.css';

const Servicepage = () => {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/page/get');
      if (!res.ok) throw new Error('Cannot fetch services');
      const data = await res.json();
      setServices(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setIsCreating(true);
    setSelected({
      servicetitle: '',
      serviceImage: null,
      titleDescArray: [{ title: '', description: '' }],
      categoryname: [{ title: '', description: '', image: null }],
    });
  };

  const handleChange = (e, field, i = null, sub = null) => {
    const val = e.target.value;
    setSelected(prev => {
      const copy = { ...prev };
      if (i !== null && sub !== null) copy[field][i][sub] = val;
      else copy[field] = val;
      return copy;
    });
  };

  const handleImage = (e, field, i = null) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelected(prev => {
      const copy = { ...prev };
      if (i !== null) copy[field][i].image = file;
      else copy[field] = file;
      return copy;
    });
  };

  const addArr = field => {
    setSelected(prev => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === 'titleDescArray'
          ? { title: '', description: '' }
          : { title: '', description: '', image: null }
      ]
    }));
  };

  const remArr = (field, i) => {
    setSelected(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== i),
    }));
  };

  const submit = async () => {
    if (!selected?.servicetitle?.trim()) return setError('Title is required');
    setSubmitting(true);
    const method = isCreating ? 'POST' : 'PUT';
    const url = isCreating
      ? 'http://localhost:5000/api/page/add'
      : `http://localhost:5000/api/page/update/${selected._id}`;

    const fd = new FormData();
    fd.append('servicetitle', selected.servicetitle);
    if (selected.serviceImage instanceof File)
      fd.append('serviceImage', selected.serviceImage);
    fd.append('titleDescArray', JSON.stringify(selected.titleDescArray));

   const cats = selected.categoryname.map((c, idx) => ({
  title: c.title,
  description: c.description,
  tempImageName: c.image instanceof File ? c.image.name : '', // This is critical
}));

    fd.append('categoryname', JSON.stringify(cats));

    selected.categoryname.forEach((c) => {
      if (c.image instanceof File) {
        fd.append('categoryImages', c.image);
      }
    });

    try {
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error('Failed to save');
      await fetchServices();
      setSelected(null);
      setIsCreating(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const del = async id => {
    try {
      const res = await fetch(`http://localhost:5000/api/page/delete/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchServices();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="container py-5">
      <h1 className="mb-5 text-center fw-bold fs-2 text-gradient">Services Dashboard</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-primary" onClick={startCreate}>Create New Service</button>
      </div>

      <div className="row">
        {services.map(s => (
          <div key={s._id} className="col-12 col-sm-6 col-lg-3 mb-4">
            <div className="card shadow-sm hover-card square-card text-center">
              <div className="card-body">
                <h6 className="card-title">{s.servicetitle}</h6>
                {s.serviceImage && (
                  <img
                    src={s.serviceImage}
                    className="img-fluid mb-3 mt-3"
                    style={{ maxHeight: '150px' }}
                    alt="service"
                  />
                )}
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setSelected({ ...s });
                      setIsCreating(false);
                    }}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => del(s._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(selected || isCreating) && selected && (
        <div className="modal d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-lg modal-dialog-centered animate-modal">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5>
                  {isCreating ? 'Create Service' : `Edit: ${selected.servicetitle}`}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setSelected(null)}
                />
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div className="mb-3">
                  <label>Service Title</label>
                  <input
                    className="form-control"
                    value={selected.servicetitle}
                    onChange={e => handleChange(e, 'servicetitle')}
                  />
                </div>

                <div className="mb-4">
                  <label>Service Image</label><br />
                  {typeof selected.serviceImage === 'string' && (
                    <img
                      src={selected.serviceImage}
                      className="img-thumbnail my-2"
                      style={{ maxWidth: '150px' }}
                      alt="preview"
                    />
                  )}
                  <input
                    type="file"
                    className="form-control"
                    onChange={e => handleImage(e, 'serviceImage')}
                  />
                </div>

                <h6 className="mb-3">Title & Description Points</h6>
                {selected.titleDescArray.map((it, i) => (
                  <div key={i} className="border rounded p-3 mb-3 bg-light">
                    <input
                      placeholder="Title"
                      value={it.title}
                      className="form-control mb-2"
                      onChange={e => handleChange(e, 'titleDescArray', i, 'title')}
                    />
                    <textarea
                      placeholder="Description"
                      className="form-control mb-2"
                      value={it.description}
                      onChange={e => handleChange(e, 'titleDescArray', i, 'description')}
                    />
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => remArr('titleDescArray', i)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-sm btn-success mb-4"
                  onClick={() => addArr('titleDescArray')}
                >
                  Add Point
                </button>

                <h6 className="mb-3">Categories</h6>
                {selected.categoryname.map((cat, i) => (
                  <div key={i} className="border rounded p-3 mb-3 bg-light">
                    {typeof cat.image === 'string' && (
                      <img
                        src={cat.image}
                        className="img-thumbnail mb-2"
                        style={{ maxWidth: '120px' }}
                        alt="category"
                      />
                    )}
                    <input
                      type="file"
                      className="form-control mb-2"
                      onChange={e => handleImage(e, 'categoryname', i)}
                    />
                    <input
                      placeholder="Title"
                      className="form-control mb-2"
                      value={cat.title}
                      onChange={e => handleChange(e, 'categoryname', i, 'title')}
                    />
                    <textarea
                      placeholder="Description"
                      className="form-control mb-2"
                      value={cat.description}
                      onChange={e => handleChange(e, 'categoryname', i, 'description')}
                    />
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => remArr('categoryname', i)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => addArr('categoryname')}
                >
                  Add Category
                </button>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                  {submitting ? 'Saving...' : isCreating ? 'Create' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Servicepage;
