import React, { useState, useEffect } from 'react';
import { useStateContext } from '../Contexts/ContextProvider';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const Serviceproviders = () => {
  const { currentColor, currentMode } = useStateContext();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(lowerSearch) ||
          s.email?.toLowerCase().includes(lowerSearch)
      );
    }

    if (moduleFilter !== 'All') {
      filtered = filtered.filter((s) => s.module === moduleFilter);
    }

    setFilteredServices(filtered);
    setCurrentPage(1); // Reset to first page on filter
  }, [services, search, moduleFilter]);

  const fetchServices = async () => {
    try {
      const res = await fetch('https://biz-booster-landingpage-backend.vercel.app/api/service/get-services');
      const data = await res.json();
      setServices(data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`https://biz-booster-landingpage-backend.vercel.app/api/service/delete/${selectedServiceId}`, {
        method: 'DELETE',
      });
      setServices((prev) => prev.filter((s) => s._id !== selectedServiceId));
      setSelectedServiceId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredServices.map((service) => ({
      Name: `${service.firstName || ''} ${service.middleName || ''} ${service.lastName || ''}`.trim(),
      Address: service.address || '',
      Phone: service.phoneNumber || '',
      Email: service.email || '',
      Module: service.module || '',
      Message: service.message || '',
      DocumentURL: service.fileUrl || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ServiceProviders');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'ServiceProviders.xlsx');
  };

  // Pagination logic
  const indexOfLast = currentPage * servicesPerPage;
  const indexOfFirst = indexOfLast - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

  return (
    <div className={`m-2 md:m-10 mt-24 p-2 md:p-10 ${currentMode === 'Dark' ? 'dark:bg-secondary-dark-bg' : 'bg-white'} rounded-3xl`}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="fw-bold" style={{ color: currentMode === 'Dark' ? 'white' : 'black' }}>Service Providers</h2>
        <div className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-select" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
            <option value="All">All Modules</option>
            {[...new Set(services.map((s) => s.module))].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button className="btn btn-success" onClick={handleExportExcel}>Export Excel</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className={`${currentMode === 'Dark' ? 'table-dark' : ''}`}>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Module</th>
              <th>Message</th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentServices.map((service) => (
              <tr key={service._id}>
                <td>
                  <strong>{service.firstName} {service.middleName} {service.lastName}</strong>
                  <br />
                  <small>{service.address}</small>
                </td>
                <td>
                  <div>{service.phoneNumber}</div>
                  <div>{service.email}</div>
                </td>
                <td>
                  <span className="badge bg-info text-dark">{service.module}</span>
                </td>
                <td>{service.message}</td>
                <td>
                  {service.fileUrl && (
                    <a href={service.fileUrl} target="_blank" rel="noreferrer" className="text-decoration-none text-primary">
                      <FiDownload /> Download
                    </a>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteModal"
                    onClick={() => setSelectedServiceId(service._id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredServices.length === 0 && (
          <div className="text-center py-4">No service providers found.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center">
          <ul className="pagination">
            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="deleteModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className={`modal-content ${currentMode === 'Dark' ? 'bg-dark text-white' : ''}`}>
            <div className="modal-header">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              Are you sure you want to delete this service provider?
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleDelete();
                  document.querySelector('#deleteModal .btn-close').click();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Serviceproviders;
