"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const EditBidModal = ({ isOpen, onClose, proposalData, onUpdate }) => {
  const [formData, setFormData] = useState({
    bidAmount: '300',
    deliveryTime: '30',
    coverLetter: 'Dear Tony, I am thrilled to apply for the Freelance UX/UI Designer position at Avitex. With my experience in this field and a profound passion for user experience design, I believe I can make a meaningful contribution to you.',
    attachedFile: null
  });

  // Update form data when proposal data changes
  useEffect(() => {
    if (proposalData && isOpen) {
      setFormData({
        bidAmount: proposalData.cost?.replace(/[^\d]/g, '') || '300',
        deliveryTime: '30',
        coverLetter: proposalData.coverLetter || 'Dear Tony, I am thrilled to apply for the Freelance UX/UI Designer position at Avitex. With my experience in this field and a profound passion for user experience design, I believe I can make a meaningful contribution to you.',
        attachedFile: null
      });
    }
  }, [proposalData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryTimeChange = (increment) => {
    const currentTime = parseInt(formData.deliveryTime);
    const newTime = increment ? currentTime + 1 : Math.max(1, currentTime - 1);
    handleInputChange('deliveryTime', newTime.toString());
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 200 * 1024 * 1024) { // 200MB limit
      handleInputChange('attachedFile', file);
    } else {
      alert('File size should not exceed 200MB');
    }
  };

  const handleSubmit = () => {
    const updatedData = {
      ...proposalData,
      cost: `$${formData.bidAmount}`,
      deliveryTime: `${formData.deliveryTime} day${formData.deliveryTime !== '1' ? 's' : ''}`,
      coverLetter: formData.coverLetter,
      attachedFile: formData.attachedFile
    };
    
    onUpdate(updatedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Bid</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set your bid amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={formData.bidAmount}
                onChange={(e) => handleInputChange('bidAmount', e.target.value)}
                className="w-full pl-8 pr-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="300"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                Max: $500
              </span>
            </div>
          </div>

          {/* Delivery Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set your delivery time <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleDeliveryTimeChange(false)}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-lg font-medium">{formData.deliveryTime} day</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeliveryTimeChange(true)}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover letter <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write your cover letter..."
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach file: <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 transition-colors">
                <span className="text-sm text-gray-700">Choose File</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                />
              </label>
              <span className="text-sm text-gray-500">
                {formData.attachedFile ? formData.attachedFile.name : 'No file chosen'}
              </span>
              <span className="text-xs text-gray-400">Up to 200 MB</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBidModal;