import React, { useState, useEffect } from 'react';
import { useStateContext } from '../Contexts/ContextProvider';
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck } from 'react-icons/fi';

const Count = () => {
  const { currentColor, currentMode } = useStateContext();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBox, setCurrentBox] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newBox, setNewBox] = useState({
    boxNo: '',
    count: '',
    title: '',
    description: ''
  });

  // const API_URL = 'https://landingpagebackend-nine.vercel.app/api/counts';

  // Fetch all count boxes
  const fetchBoxes = async () => {
  try {
    const response = await fetch("https://landingpagebackend-nine.vercel.app/api/counts/get");
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Fetch error: ${response.status} - ${errText}`);
    }
    const data = await response.json();
    setBoxes(data || []);
  } catch (err) {
    console.error('Fetch Boxes Error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchBoxes();
  }, []);

  // Add new count box
  const handleAdd = async () => {
    try {
      const response = await fetch(`https://landingpagebackend-nine.vercel.app/api/counts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBox),
      });

      if (!response.ok) throw new Error('Failed to add box');

      await fetchBoxes();
      setIsAdding(false);
      setNewBox({ boxNo: '', count: '', title: '', description: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Update count box
  const handleUpdate = async () => {
    try {
      const response = await fetch(`https://landingpagebackend-nine.vercel.app/api/counts/update/${currentBox._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentBox),
      });

      if (!response.ok) throw new Error('Failed to update box');

      await fetchBoxes();
      setIsEditing(false);
      setCurrentBox(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete count box
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://landingpagebackend-nine.vercel.app/api/counts/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete box');

      await fetchBoxes();
    } catch (err) {
      setError(err.message);
    }
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: currentMode === 'Dark' ? 'white' : 'black' }}>
          Box Count Management
        </h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ backgroundColor: currentColor, color: 'white' }}
        >
          <FiPlus /> Add New Box
        </button>
      </div>

      {/* Add New Box Form */}
      {isAdding && (
        <div className={`mb-6 p-4 rounded-lg ${currentMode === 'Dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {['boxNo', 'count', 'title', 'description'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1" style={{ color: currentMode === 'Dark' ? 'white' : 'gray' }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  value={newBox[field]}
                  onChange={(e) => setNewBox({ ...newBox, [field]: e.target.value })}
                  className="w-full p-2 border rounded"
                  style={{ backgroundColor: currentMode === 'Dark' ? 'rgb(31, 41, 55)' : 'white' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-500 text-white">
              <FiX /> Cancel
            </button>
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: currentColor, color: 'white' }}>
              <FiCheck /> Add Box
            </button>
          </div>
        </div>
      )}

      {/* Edit Box Form */}
      {isEditing && currentBox && (
        <div className={`mb-6 p-4 rounded-lg ${currentMode === 'Dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {['boxNo', 'count', 'title', 'description'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1" style={{ color: currentMode === 'Dark' ? 'white' : 'gray' }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  value={currentBox[field]}
                  onChange={(e) => setCurrentBox({ ...currentBox, [field]: e.target.value })}
                  className="w-full p-2 border rounded"
                  style={{ backgroundColor: currentMode === 'Dark' ? 'rgb(31, 41, 55)' : 'white' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-500 text-white">
              <FiX /> Cancel
            </button>
            <button onClick={handleUpdate} className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: currentColor, color: 'white' }}>
              <FiCheck /> Update Box
            </button>
          </div>
        </div>
      )}

      {/* Boxes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boxes.map((box) => (
          <div key={box._id} className={`p-6 rounded-lg shadow-md ${currentMode === 'Dark' ? 'bg-gray-800' : 'bg-white'}`} style={{ borderTop: `4px solid ${currentColor}` }}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold" style={{ color: currentMode === 'Dark' ? 'white' : 'black' }}>{box.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCurrentBox(box);
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  style={{ color: currentColor }}
                >
                  <FiEdit />
                </button>
                <button
                  onClick={() => handleDelete(box._id)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold" style={{ color: currentColor }}>{box.count}</span>
            </div>
            <p className="text-sm" style={{ color: currentMode === 'Dark' ? 'rgb(156, 163, 175)' : 'rgb(75, 85, 99)' }}>
              {box.description}
            </p>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: currentMode === 'Dark' ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)' }}>
              <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: `${currentColor}20`, color: currentColor }}>
                Box #{box.boxNo}
              </span>
            </div>
          </div>
        ))}
      </div>

      {boxes.length === 0 && (
        <div className="text-center py-10">
          <p style={{ color: currentMode === 'Dark' ? 'white' : 'black' }}>No boxes found. Add a new box to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Count;
