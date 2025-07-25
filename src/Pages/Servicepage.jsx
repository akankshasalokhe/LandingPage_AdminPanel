import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Displayinfo.css';

const initialDesc = { title: '', description: '' };
const initialCategory = { title: '', description: '', image: [] };

const Servicepage = () => {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://landingpagebackend-nine.vercel.app/api/servicepage/get');
      if (!res.ok) throw new Error('Cannot fetch services');
      const { data = [] } = await res.json();
      setServices(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setError(null);
    setSelected({
      servicetitle: '',
      serviceImage: null,
      titleDescArray: [{ ...initialDesc }],
      categoryname: [{ ...initialCategory }],
    });
  };

  const startEdit = (service) => {
    setError(null);
    setSelected({
      ...service,
      serviceImage: service.serviceImage || null,
      titleDescArray: service.titleDescArray || [initialDesc],
      categoryname: (service.categoryname || []).map(c => ({
        title: c.title,
        description: c.description,
        image: Array.isArray(c.image) ? c.image : [c.image],
      })),
    });
  };

  const handleChange = (e, field, i = null, sub = null) => {
    const val = e.target.value;
    setSelected(prev => {
      const updated = { ...prev };
      if (i !== null && sub) updated[field][i][sub] = val;
      else updated[field] = val;
      return updated;
    });
  };

  const handleImage = (e, field, i = null) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelected(prev => {
      const updated = { ...prev };
      if (i !== null) updated[field][i].image = [...(updated[field][i].image || []), ...files];
      else updated[field] = files[0];
      return updated;
    });
  };

  const handleRemoveImage = (catIndex, imgIndex) => {
    setSelected(prev => {
      const updated = { ...prev };
      updated.categoryname[catIndex].image.splice(imgIndex, 1);
      return updated;
    });
  };

  const addArr = field => {
    setSelected(prev => ({
      ...prev,
      [field]: [...prev[field], field === 'titleDescArray' ? { ...initialDesc } : { ...initialCategory }],
    }));
  };

  const remArr = (field, i) => {
    setSelected(prev => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== i),
    }));
  };

  const submit = async () => {
    if (!selected?.servicetitle?.trim()) {
      return setError('Service title is required.');
    }

    setSubmitting(true);
    const isEditMode = !!selected?._id;
    const endpoint = isEditMode
      ? `https://landingpagebackend-nine.vercel.app/api/servicepage/update/${selected._id}`
      : `https://landingpagebackend-nine.vercel.app/api/servicepage/create`;

    const fd = new FormData();
    fd.append('servicetitle', selected.servicetitle);

    // Service image
    if (selected.serviceImage instanceof File) {
      fd.append('serviceImage', selected.serviceImage);
    }

    // Title-description points
    fd.append('titleDescArray', JSON.stringify(selected.titleDescArray || []));

    // Category images + meta
    const finalCategoryList = [];
    const categoryImageCounts = [];

    selected.categoryname.forEach((cat) => {
      const retainedUrls = [];
      const newFiles = [];

      (cat.image || []).forEach(img => {
        if (img instanceof File) {
          fd.append('categoryImages', img);
          newFiles.push(img);
        } else if (typeof img === 'string') {
          retainedUrls.push(img);
        }
      });

      finalCategoryList.push({
        title: cat.title,
        description: cat.description,
        image: retainedUrls,
      });

      categoryImageCounts.push(newFiles.length);
    });

    fd.append('categoryname', JSON.stringify(finalCategoryList));
    fd.append('categoryImageCounts', JSON.stringify(categoryImageCounts));

    try {
      const res = await fetch(endpoint, {
        method: isEditMode ? 'PUT' : 'POST',
        body: fd,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Save failed');

      await fetchServices();
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const del = async id => {
    if (!window.confirm('Really delete this item?')) return;
    try {
      const res = await fetch(`https://landingpagebackend-nine.vercel.app/api/servicepage/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchServices();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="container py-5">
      <h1 className="text-center fw-bold fs-2 text-gradient mb-4">Services Dashboard</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-primary" onClick={startCreate}>New Service</button>
      </div>

      <div className="row">
        {services.map(s => (
          <div key={s._id} className="col-sm-6 col-md-4 col-lg-3 mb-4">
            <div className="card square-card hover-card">
              <div className="card-body text-center">
                <h5 className="card-title">{s.servicetitle}</h5>
                {s.serviceImage && (
                  <img
                    src={s.serviceImage}
                    alt="Service"
                    className="img-fluid my-3 mt-4"
                    style={{ maxHeight: 120 }}
                  />
                )}
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(s)}>Update</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => del(s._id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal d-block bg-dark bg-opacity-50 animate-modal">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">

              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{selected._id ? `Edit: ${selected.servicetitle}` : 'Create Service'}</h5>
                <button className="btn-close btn-close-white" onClick={() => setSelected(null)} />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label>Service Title *</label>
                  <input className="form-control" value={selected.servicetitle} onChange={e => handleChange(e, 'servicetitle')} />
                </div>

                <div className="mb-4">
                  <label>Service Image</label>
                  {typeof selected.serviceImage === 'string' && (
                    <img src={selected.serviceImage} alt="" className="img-thumbnail mb-2" style={{ maxWidth: 150 }} />
                  )}
                  <input type="file" className="form-control" onChange={e => handleImage(e, 'serviceImage')} />
                </div>

                <h6>Title & Description Points</h6>
                {selected.titleDescArray.map((td, i) => (
                  <div key={i} className="mb-3 p-3 bg-light rounded">
                    <input
                      className="form-control mb-2"
                      placeholder="Title"
                      value={td.title}
                      onChange={e => handleChange(e, 'titleDescArray', i, 'title')}
                    />
                    <textarea
                      className="form-control mb-2"
                      placeholder="Description"
                      value={td.description}
                      onChange={e => handleChange(e, 'titleDescArray', i, 'description')}
                    />
                    <button className="btn btn-sm btn-danger" onClick={() => remArr('titleDescArray', i)}>Remove</button>
                  </div>
                ))}
                <button className="btn btn-sm btn-success mb-4" onClick={() => addArr('titleDescArray')}>Add Point</button>

                <h6>Categories</h6>
                {selected.categoryname.map((cat, i) => (
                  <div key={i} className="mb-3 p-3 bg-light rounded">

                    <div className="mb-2 d-flex flex-wrap gap-2">
                      {Array.isArray(cat.image) && cat.image.map((img, idx) =>
                        typeof img === 'string' ? (
                          <div key={idx} className="position-relative">
                            <img src={img} className="img-thumbnail" style={{ maxWidth: 120 }} />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              onClick={() => handleRemoveImage(i, idx)}
                            >×</button>
                          </div>
                        ) : null
                      )}
                    </div>

                    <input
                      type="file"
                      name="categoryImages"
                      multiple
                      className="form-control mb-2"
                      onChange={(e) => handleImage(e, 'categoryname', i)}
                    />

                    <input
                      className="form-control mb-2"
                      placeholder="Category Title"
                      value={cat.title}
                      onChange={e => handleChange(e, 'categoryname', i, 'title')}
                    />

                    <textarea
                      className="form-control mb-2"
                      placeholder="Category Description"
                      value={cat.description}
                      onChange={e => handleChange(e, 'categoryname', i, 'description')}
                    />

                    <button className="btn btn-sm btn-danger" onClick={() => remArr('categoryname', i)}>Remove</button>
                  </div>
                ))}
                <button className="btn btn-sm btn-success" onClick={() => addArr('categoryname')}>Add Category</button>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                  {submitting ? 'Saving...' : (selected._id ? 'Update' : 'Create')}
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
