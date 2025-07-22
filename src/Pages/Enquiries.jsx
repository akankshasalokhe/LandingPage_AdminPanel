import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import './css/Enquiries.css'; // Updated styles

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      });

      const res = await fetch(`https://landingpagebackend-nine.vercel.app/api/contact/get?${params.toString()}`);
      const data = await res.json();
      setEnquiries(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [search, fromDate, toDate, page]);

  const deleteEnquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await fetch(`https://landingpagebackend-nine.vercel.app/api/contact/delete/${id}`, {
          method: 'DELETE',
        });
        fetchEnquiries();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(enquiries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enquiries');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'Enquiries.xlsx');
  };

  return (
    <div className="container mt-4 enquiries-container">
      <div className="header-section d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h4 className="text-primary fw-bold text-center w-100 fs-3 mb-3">
          Contact Enquiries
        </h4>
        <div className="ms-auto">
          <button className="btn btn-success export-btn" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </div>

      <div className="row g-2 mb-3 filter-section">
        <div className="col-md-4 col-sm-12">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="table-responsive table-container w-100">
          <table className="table table-bordered table-hover align-middle table-sm mb-0 w-100">
          <thead className="table-light text-center">
            <tr>
              <th>#</th>
              <th>First</th>
              <th>Last</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Message</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>

            <tbody>
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No records found.
                  </td>
                </tr>
              ) : (
                enquiries.map((item, index) => (
                  <tr key={item._id}>
                    <td className="text-center">{(page - 1) * 10 + index + 1}</td>
                    <td>{item.FirstName}</td>
                    <td>{item.LastName}</td>
                    <td>{item.EmailAddress}</td>
                    <td>{item.PhoneNo}</td>
                    <td>{item.Services}</td>
                    <td>{item.Message}</td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteEnquiry(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex flex-wrap align-items-center mt-3 gap-2 pagination-controls">
        <button
          className="btn btn-outline-primary"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span className="text-nowrap">Page {page} of {totalPages}</span>
        <button
          className="btn btn-outline-primary"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Enquiries;
