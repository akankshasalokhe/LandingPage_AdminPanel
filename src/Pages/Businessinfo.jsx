import React, { useState, useEffect } from 'react';
import { useStateContext } from '../Contexts/ContextProvider';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Businessinfo = () => {
  const { currentColor, currentMode } = useStateContext();
  const [businessData, setBusinessData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessModelFilter, setBusinessModelFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await fetch('https://landingpagebackend-nine.vercel.app/api/earning/get');
        if (!response.ok) throw new Error('Failed to fetch business data');
        const data = await response.json();
        setBusinessData(data);
        setFilteredData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinessData();
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    let filtered = businessData.filter((item) =>
      `${item.firstName} ${item.middleName} ${item.lastName}`.toLowerCase().includes(lower) ||
      item.phoneNumber?.toLowerCase().includes(lower) ||
      item.city?.toLowerCase().includes(lower) ||
      item.stateProvince?.toLowerCase().includes(lower)
    );
    if (businessModelFilter) {
      filtered = filtered.filter(item => item.businessModel === businessModelFilter);
    }
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchQuery, businessModelFilter, businessData]);

  const exportToExcel = () => {
    const excelData = filteredData.map((item) => ({
      Name: `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim(),
      Phone: item.phoneNumber || '',
      City: item.city || '',
      State: item.stateProvince || '',
      Zipcode: item.pincodeZipcode || '',
      BusinessModel: item.businessModel || '',
      Remark: item.remark || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BusinessInfo');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'BusinessInfo.xlsx');
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this record?');
    if (!confirm) return;
    try {
      const res = await fetch(`https://landingpagebackend-nine.vercel.app/api/earning/delete/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const updated = businessData.filter((item) => item._id !== id);
        setBusinessData(updated);
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const uniqueModels = [...new Set(businessData.map(item => item.businessModel).filter(Boolean))];

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${currentMode === 'Dark' ? 'dark:bg-main-dark-bg' : 'bg-main-bg'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: currentColor }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center h-screen ${currentMode === 'Dark' ? 'dark:bg-main-dark-bg' : 'bg-main-bg'}`}>
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className={`m-2 md:m-10 mt-24 p-2 md:p-10 ${currentMode === 'Dark' ? 'dark:bg-secondary-dark-bg' : 'bg-white'} rounded-3xl`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: currentMode === 'Dark' ? 'white' : 'black' }}>
          Business Information
        </h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border rounded-md w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={businessModelFilter}
            onChange={(e) => setBusinessModelFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All Models</option>
            {uniqueModels.map((model, idx) => (
              <option key={idx} value={model}>{model}</option>
            ))}
          </select>
          <button
            onClick={exportToExcel}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded"
          >
            Export to Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={`${currentMode === 'Dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <tr>
              {['Name', 'Phone', 'Location', 'Business Model', 'Remarks', 'Actions'].map((col) => (
                <th key={col} className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider" style={{ color: currentMode === 'Dark' ? 'white' : 'gray' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${currentMode === 'Dark' ? 'bg-secondary-dark-bg' : 'bg-white'}`}>
            {paginatedData.map((business) => (
              <tr key={business._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="px-6 py-5 text-sm">{business.firstName} {business.middleName} {business.lastName}</td>
                <td className="px-6 py-5 text-sm">{business.phoneNumber}</td>
                <td className="px-6 py-5 text-sm">{business.city}, {business.stateProvince}, {business.pincodeZipcode}</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full" style={{ backgroundColor: currentColor + '20', color: currentColor }}>
                    {business.businessModel}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm">{business.remark}</td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => handleDelete(business._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-5 text-gray-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Businessinfo;
