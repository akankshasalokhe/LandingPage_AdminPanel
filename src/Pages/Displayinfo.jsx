// Make sure you have: bootstrap and './css/Displayinfo.css' already present
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Displayinfo.css';


const DisplayInfo = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('https://landingpagebackend-nine.vercel.app/api/item/get');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch items');
      setLoading(false);
    }
  };

const submitItem = async () => {
  const formData = new FormData();
  const data = selectedItem;

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'image') {
      if (value instanceof File) {
        formData.append('image', value);
      } else if (typeof value === 'string') {
        formData.append('image', value);
      }
    } else if (key === 'arrayofimage' && Array.isArray(value)) {
      const indexMap = [];

      value.forEach((item, index) => {
        if (typeof item === 'string') {
          indexMap.push({ type: 'url', index, value: item });
        } else if (item instanceof File) {
          indexMap.push({ type: 'file', index });
          formData.append(`arrayofimage_${index}`, item); // Dynamic field names
        }
      });

      formData.append('arrayofimageIndexMap', JSON.stringify(indexMap));
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (key !== '_id' && key !== '__v' && value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  try {
    const url = isCreating
      ? 'https://landingpagebackend-nine.vercel.app/api/item/add'
      : `https://landingpagebackend-nine.vercel.app/api/item/update/${data._id}`;
    const method = isCreating ? 'POST' : 'PUT';

    const response = await fetch(url, { method, body: formData });
    if (!response.ok) throw new Error(await response.text());

    fetchItems();
    setSelectedItem(null);
    setIsCreating(false);
  } catch (err) {
    setError(err.message || 'Failed to submit item');
  }
};




  const deleteItem = async (id) => {
    try {
      const response = await fetch(`https://landingpagebackend-nine.vercel.app/api/item/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  const handleUpdateChange = (e, field, index = null) => {
    const value = e.target.value;
    setSelectedItem(prev => {
      if (index !== null && Array.isArray(prev[field])) {
        const updatedArray = [...prev[field]];
        updatedArray[index] = value;
        return { ...prev, [field]: updatedArray };
      }
      return { ...prev, [field]: value };
    });
  };

  const addArrayItem = (field) => {
    setSelectedItem(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  };

  const removeArrayItem = (field, index) => {
    setSelectedItem(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = (e, field, index = null) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedItem(prev => {
        if (index !== null && Array.isArray(prev[field])) {
          const updatedArray = [...prev[field]];
          updatedArray[index] = file;
          return { ...prev, [field]: updatedArray };
        }
        return { ...prev, [field]: file };
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setSelectedItem({
      heading: '',
      image: '',
      features: [],
      category: '',
      description: '',
      earning: '',
      requirements: [],
      feature2: [],
      arrayofimage: [],
      subheading: '',
    });
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsCreating(false);
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="text-danger text-center py-5">{error}</div>;

  return (
    <div className="container py-5">
        <h1 className="text-center fw-bold fs-2 text-gradient mb-3">Dynamic Components</h1>
       <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-primary" onClick={openCreateModal}>Create New Component</button>
      </div>

      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-3">
        {items.map(item => (
          <div key={item._id} className="col">
            <div className="card square-card shadow-sm border-0 hover-card">
              <div className="card-body d-flex flex-column justify-content-between p-3">
                <h6 className="card-title mb-1 text-center text-truncate fw-semibold">{item.heading}</h6>
                {item.subheading && <p className="text-center text-muted small">{item.subheading}</p>}
                {item.category && <p className="text-center fw-medium text-primary small">{item.category}</p>}
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => { setSelectedItem(item); setIsCreating(false); }}>
                    Update
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-semibold">
                  {isCreating ? 'Create New Component' : `Edit: ${selectedItem.heading}`}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body bg-light p-4">
                <form onKeyPress={handleKeyPress}>
                  <div className="row g-4">
                    {Object.entries(selectedItem).map(([key, value]) =>
                      key !== '_id' && key !== '__v' && (
                        <div className="col-md-6" key={key}>
                          <label className="form-label text-muted fw-semibold text-capitalize">{key}</label>
                          {Array.isArray(value) && key === 'arrayofimage' ? (
                            <>
                              {value.map((img, i) => (
                                <div key={i} className="d-flex align-items-center mb-2">
                                  {typeof img === 'string' ? (
                                    <img src={img} alt="" style={{ maxWidth: 50, maxHeight: 50 }} className="me-2" />
                                  ) : (
                                    <span className="me-2">New: {img.name}</span>
                                  )}
                                  <input type="file" className="form-control me-2" onChange={e => handleImageUpload(e, key, i)} />
                                  {typeof img === 'string' && (
                                    <input
                                      type="text"
                                      className="form-control me-2"
                                      value={img}
                                      onChange={e => handleUpdateChange(e, key, i)}
                                    />
                                  )}
                                  <button className="btn btn-danger btn-sm" onClick={() => removeArrayItem(key, i)} type="button">×</button>
                                </div>
                              ))}
                              <button className="btn btn-outline-success btn-sm mt-2" type="button" onClick={() => addArrayItem(key)}>
                                Add Image
                              </button>
                            </>
                          ) : Array.isArray(value) ? (
                            <>
                              {value.map((item, i) => (
                                <div key={i} className="d-flex align-items-center mb-2">
                                  <input
                                    type="text"
                                    className="form-control me-2"
                                    value={item}
                                    onChange={e => handleUpdateChange(e, key, i)}
                                  />
                                  <button className="btn btn-danger btn-sm" onClick={() => removeArrayItem(key, i)} type="button">×</button>
                                </div>
                              ))}
                              <button className="btn btn-outline-success btn-sm mt-2" type="button" onClick={() => addArrayItem(key)}>
                                Add Item
                              </button>
                            </>
                          ) : key === 'image' ? (
                            <>
                              {typeof value === 'string' && value && (
                                <img src={value} alt="Preview" className="img-thumbnail mb-2" style={{ maxWidth: 100 }} />
                              )}
                              {value instanceof File && <p className="mb-2">New File: {value.name}</p>}
                              <input type="file" className="form-control" onChange={e => handleImageUpload(e, key)} />
                              {typeof value === 'string' && (
                                <input
                                  type="text"
                                  className="form-control mt-2"
                                  value={value}
                                  onChange={e => handleUpdateChange(e, key)}
                                />
                              )}
                            </>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              value={value}
                              onChange={e => handleUpdateChange(e, key)}
                            />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer bg-light">
                <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button className="btn btn-primary" onClick={submitItem}>
                  {isCreating  ?  'Create Component' : 'Update Component'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayInfo;
