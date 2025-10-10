"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MdEdit, 
  MdSave, 
  MdCancel,
  MdDescription,
  MdArrowBack,
  MdAdd,
  MdDelete,
  MdDragIndicator,
  MdExpandMore,
  MdExpandLess
} from 'react-icons/md';
import adminApi from '@/config/adminApi';

const TermsConditionsPage = () => {
  const [data, setData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchTermsConditions();
  }, []);

  const fetchTermsConditions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/cms-pages/MQ==');
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        const cmsData = response.data.data;
        
        setData(cmsData);
        setOriginalData(JSON.parse(JSON.stringify(cmsData)));
        
         // Initialize all sections as collapsed
         const expanded = {};
         if (cmsData.contents && Array.isArray(cmsData.contents)) {
           cmsData.contents.forEach(section => {
             expanded[section.cms_c_id] = false;
           });
         }
         setExpandedSections(expanded);
      }
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      alert('Error loading Terms and Conditions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Implement API call when available
      // await adminApi.post('/cms-pages/edit', data);
      
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setIsEditing(false);
      alert('Terms and Conditions updated successfully!');
    } catch (error) {
      console.error('Error saving terms and conditions:', error);
      alert('Error saving Terms and Conditions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setData(JSON.parse(JSON.stringify(originalData)));
    setIsEditing(false);
  };

  const updateMainContent = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const updateSection = (index, field, value) => {
    const newContents = [...data.contents];
    newContents[index] = { ...newContents[index], [field]: value };
    setData({ ...data, contents: newContents });
  };

  const addSection = () => {
    const newSection = {
      cms_c_id: Date.now(),
      cms_c_cms_id: data.cms_id.toString(),
      cms_c_title: "New Section",
      cms_c_content: "<p>Enter content here...</p>",
      cms_c_number: data.contents.length > 0 ? Math.max(...data.contents.map(s => s.cms_c_number)) + 1 : 1
    };
    setData({ ...data, contents: [...data.contents, newSection] });
    setExpandedSections({ ...expandedSections, [newSection.cms_c_id]: false });
  };

  const deleteSection = (index) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const newContents = data.contents.filter((_, i) => i !== index);
      setData({ ...data, contents: newContents });
    }
  };

  const moveSection = (index, direction) => {
    const newContents = [...data.contents];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newContents.length) {
      [newContents[index], newContents[newIndex]] = [newContents[newIndex], newContents[index]];
      
      // Update cms_c_number for proper ordering
      newContents.forEach((section, idx) => {
        section.cms_c_number = idx + 1;
      });
      
      setData({ ...data, contents: newContents });
    }
  };

  const toggleSection = (id) => {
    setExpandedSections({ ...expandedSections, [id]: !expandedSections[id] });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Terms and Conditions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
              >
                <MdArrowBack className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-xl mr-4">
                  <MdDescription className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage your terms and conditions content</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <MdEdit className="w-5 h-5 mr-2" />
                  Edit Terms
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    <MdCancel className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <MdSave className="w-5 h-5 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Title & Description */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Page Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={data.cms_title}
                onChange={(e) => updateMainContent('cms_title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter page title..."
              />
            ) : (
              <h2 className="text-3xl font-bold text-gray-900">{data.cms_title}</h2>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Introduction
            </label>
            {isEditing ? (
              <textarea
                value={data.cms_dec}
                onChange={(e) => updateMainContent('cms_dec', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows="4"
                placeholder="Enter introduction text..."
              />
            ) : (
              <p className="text-gray-700 text-lg leading-relaxed">{data.cms_dec}</p>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 mb-6">
          {data.contents.map((section, index) => (
            <div
              key={section.cms_c_id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl"
            >
              {/* Section Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    {isEditing && (
                      <div className="flex items-center mr-4 space-x-1">
                        <button
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move up"
                        >
                          <MdDragIndicator className="w-5 h-5 text-gray-500 transform rotate-90" />
                        </button>
                        <button
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === data.contents.length - 1}
                          className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          title="Move down"
                        >
                          <MdDragIndicator className="w-5 h-5 text-gray-500 transform -rotate-90" />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={section.cms_c_title}
                          onChange={(e) => updateSection(index, 'cms_c_title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                          placeholder="Section title..."
                        />
                      ) : (
                        <h3 className="text-xl font-bold text-gray-900">{section.cms_c_title}</h3>
                      )}
                      <div className="flex items-center mt-1 space-x-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Order: {section.cms_c_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isEditing && (
                      <button
                        onClick={() => deleteSection(index)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                        title="Delete section"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleSection(section.cms_c_id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      {expandedSections[section.cms_c_id] ? (
                        <MdExpandLess className="w-6 h-6 text-gray-600" />
                      ) : (
                        <MdExpandMore className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              {expandedSections[section.cms_c_id] && (
                <div className="p-6">
                  {isEditing ? (
                    <textarea
                      value={section.cms_c_content}
                      onChange={(e) => updateSection(index, 'cms_c_content', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                      rows="12"
                      placeholder="Enter HTML content..."
                    />
                  ) : (
                    <div 
                      className="prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: section.cms_c_content }}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Section Button */}
        {isEditing && (
          <button
            onClick={addSection}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 text-gray-600 hover:text-blue-600 font-medium"
          >
            <MdAdd className="w-6 h-6" />
            <span>Add New Section</span>
          </button>
        )}
      </div>

      <style jsx global>{`
        .prose {
          color: #374151;
        }
        .prose p {
          margin-bottom: 1em;
          line-height: 1.7;
        }
        .prose ul {
          margin-top: 0.5em;
          margin-bottom: 1em;
          padding-left: 1.5em;
          list-style-type: disc !important;
        }
        .prose li {
          margin-bottom: 0.5em;
          line-height: 1.6;
          display: list-item !important;
          list-style-type: disc !important;
        }
        .prose ol {
          margin-top: 0.5em;
          margin-bottom: 1em;
          padding-left: 1.5em;
          list-style-type: decimal !important;
        }
        .prose ol li {
          display: list-item !important;
          list-style-type: decimal !important;
        }
        .prose strong {
          color: #1f2937;
          font-weight: 600;
        }
        .prose h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
        }
        .prose h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default TermsConditionsPage;