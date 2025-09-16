"use client"
import { useState } from 'react';
import { FiEdit2, FiTrash2, FiSave, FiX, FiUpload } from 'react-icons/fi';

const IDProofPage = () => {
  const [idProofs, setIdProofs] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Passport',
    number: '',
    file: null,
    fileName: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const idTypes = ['Passport', 'Driver License', 'National ID', 'Voter ID', 'PAN Card'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        fileName: file.name
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.number) newErrors.number = 'Number is required';
    if (!formData.file && !editingId) newErrors.file = 'File is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId !== null) {
      // Update existing record
      setIdProofs(idProofs.map(item => 
        item.id === editingId ? { ...formData, id: editingId } : item
      ));
      setEditingId(null);
    } else {
      // Add new record
      const newIdProof = {
        ...formData,
        id: Date.now()
      };
      setIdProofs([...idProofs, newIdProof]);
    }

    // Reset form
    setFormData({
      type: 'Passport',
      number: '',
      file: null,
      fileName: ''
    });
  };

  const handleEdit = (id) => {
    const proofToEdit = idProofs.find(item => item.id === id);
    setFormData({
      type: proofToEdit.type,
      number: proofToEdit.number,
      file: proofToEdit.file,
      fileName: proofToEdit.fileName
    });
    setEditingId(id);
  };

  const handleDelete = (id) => {
    setIdProofs(idProofs.filter(item => item.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      type: 'Passport',
      number: '',
      file: null,
      fileName: ''
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">ID Proof Management</h1>
      
      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">
          {editingId !== null ? 'Edit ID Proof' : 'Add New ID Proof'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
              >
                {idTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>
            
            {/* Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="ID Number"
              />
              {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
            </div>
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Document</label>
            <div className="flex items-center">
              <label className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-l-md cursor-pointer hover:bg-gray-200">
                <FiUpload className="mr-2" />
                Choose File
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
              <div className={`flex-1 p-2 border border-l-0 rounded-r-md ${errors.file ? 'border-red-500' : 'border-gray-300'}`}>
                {formData.fileName || 'No file chosen'}
              </div>
            </div>
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
            {editingId && formData.fileName && (
              <p className="text-xs text-gray-500 mt-1">Current file will be kept if no new file is selected</p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center"
              >
                <FiX className="mr-1" /> Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <FiSave className="mr-1" /> {editingId !== null ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {idProofs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No ID Proofs added yet</td>
                </tr>
              ) : (
                idProofs.map((proof) => (
                  <tr key={proof.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proof.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proof.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proof.fileName || 'No file'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(proof.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit2 className="inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(proof.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IDProofPage;