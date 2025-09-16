"use client";
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function EditAlertsModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    alertName: 'Website design',
    keyword: '',
    jobRegion: 'United States',
    categories: 'UX/UI design',
    tags: 'Landing',
    jobType: 'Fulltime',
    emailFrequency: 'Weekly'
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const tagOptions = ['Landing', 'Featured', 'Remote', 'Contract', 'Internship'];
  const jobTypeOptions = ['Fulltime', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  const frequencyOptions = ['Daily', 'Weekly', 'Monthly'];

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideAnyDropdown = Object.values(dropdownRefs.current).some(ref =>
        ref && ref.contains(event.target)
      );
      if (!clickedInsideAnyDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const selectOption = (field, value) => {
    handleInputChange(field, value);
    setOpenDropdown(null);
  };

  const handleSave = () => {
    console.log('Saving alerts:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-4 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Alerts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Alert Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Alert Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.alertName}
                onChange={(e) => handleInputChange('alertName', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              />
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Keyword <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Keyword..."
                value={formData.keyword}
                onChange={(e) => handleInputChange('keyword', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm sm:text-base"
              />
            </div>

            {/* Job Region */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Job Region <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jobRegion}
                onChange={(e) => handleInputChange('jobRegion', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Categories <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.categories}
                onChange={(e) => handleInputChange('categories', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              />
            </div>

            {/* Tags Dropdown */}
            <div className="relative" ref={el => dropdownRefs.current['tags'] = el}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tags <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown('tags')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-white text-left flex justify-between items-center hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              >
                <span className="text-gray-900 truncate">{formData.tags}</span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
              </button>
              {openDropdown === 'tags' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {tagOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectOption('tags', option)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-sm sm:text-base"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Job Type Dropdown */}
            <div className="relative" ref={el => dropdownRefs.current['jobType'] = el}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown('jobType')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-white text-left flex justify-between items-center hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              >
                <span className="text-gray-900 truncate">{formData.jobType}</span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
              </button>
              {openDropdown === 'jobType' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {jobTypeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectOption('jobType', option)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-sm sm:text-base"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email Frequency Dropdown */}
            <div className="relative md:col-start-1" ref={el => dropdownRefs.current['emailFrequency'] = el}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Frequency <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => toggleDropdown('emailFrequency')}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-white text-left flex justify-between items-center hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base"
              >
                <span className="text-gray-900 truncate">{formData.emailFrequency}</span>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
              </button>
              {openDropdown === 'emailFrequency' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                  {frequencyOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectOption('emailFrequency', option)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors text-sm sm:text-base"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base order-1 sm:order-2"
          >
            Save Alerts
          </button>
        </div>
      </div>
    </div>
  );
}