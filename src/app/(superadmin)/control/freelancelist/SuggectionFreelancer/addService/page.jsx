'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Loader2
} from 'lucide-react';
import { message } from 'antd'; // Import for toast notifications

// API configuration
const API_BASE_URL = 'https://backend.hyrelancer.in/api/admin';

// Token management (local state)
const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  }
};

// Reusable Toolbar Button component
const ToolbarButton = ({ onClick, isActive, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-1 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
  >
    {children}
  </button>
);

const AddService = ({ record, suggestionDetails }) => {
  const router = useRouter();
  
  // State for form data and UI
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  
  // State for API call status
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[150px] p-4 focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (suggestionDetails) {
      setServiceName(suggestionDetails.fsu_suggestion || '');
      // You can set other fields based on the suggestion details if needed
    }
  }, [suggestionDetails]);
  
  // Fetch categories on component mount
  const fetchCategories = useCallback(async () => {
    setFetchingCategories(true);
    setError(null);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        TokenManager.removeToken();
        router.push('/gateway');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/category`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        TokenManager.removeToken();
        router.push('/gateway');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to fetch categories.');
      }
      
      const result = await response.json();
      setCategories(result.data.data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingCategories(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle file changes
  const handleIconChange = (e) => {
    setIconFile(e.target.files[0]);
  };

  const handleBannerChange = (e) => {
    setBannerFile(e.target.files[0]);
  };
  
  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Form Validation
    if (!serviceName || !selectedCategory) {
      const msg = 'Service name and category are required.';
      setError(msg);
      message.error(msg);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('se_name', serviceName);
    formData.append('se_sc_id', selectedCategory);
    formData.append('se_desc', editor?.getHTML() || 'No description provided.');
    
    if (iconFile) {
      formData.append('se_icon_file', iconFile);
    }
    if (bannerFile) {
      formData.append('se_img_file', bannerFile);
    }

    try {
      const token = TokenManager.getToken();
      if (!token) {
        TokenManager.removeToken();
        router.push('/gateway');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/storeServices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const result = await response.json();

      if (response.status === 401) {
        TokenManager.removeToken();
        router.push('/gateway');
        return;
      }
      
      if (!response.ok) {
        const errorMessages = Object.values(result.errors || {}).flat();
        const msg = errorMessages.join(' ') || result.message || 'Failed to create service.';
        setError(msg);
        message.error(msg);
        return;
      }

      setSuccess('Service created successfully!');
      message.success('Service created successfully!');
      setTimeout(() => {
        router.push('/control/ServicesList');
      }, 1000);

    } catch (err) {
      console.error('API Error:', err);
      const msg = err.message || 'An unexpected error occurred.';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">ADD SERVICE</h2>
        </div>

        <form onSubmit={handleSave}>
          <div className="p-6">
            {/* Status Messages */}
            {success && (
              <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Category, Service, Icon, Banner */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
              {/* Category */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
                {fetchingCategories ? (
                  <div className="flex items-center justify-center h-10 border border-gray-300 rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.sc_id} value={cat.sc_id}>
                        {cat.sc_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Service */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Service</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service name"
                  required
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Icon</label>
                <div className="relative">
                  <input
                    type="file"
                    id="icon-upload"
                    onChange={handleIconChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="icon-upload"
                    className="flex justify-between items-center px-3 py-2 w-full rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50"
                  >
                    <span className="text-gray-500">Choose file</span>
                    <span className="text-sm text-gray-400">
                      {iconFile ? iconFile.name : 'No file chosen'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Banner */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Banner</label>
                <div className="relative">
                  <input
                    type="file"
                    id="banner-upload"
                    onChange={handleBannerChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="flex justify-between items-center px-3 py-2 w-full rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50"
                  >
                    <span className="text-gray-500">Choose file</span>
                    <span className="text-sm text-gray-400">
                      {bannerFile ? bannerFile.name : 'No file chosen'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
              <div className="overflow-hidden rounded-md border border-gray-300">
                {/* Simple Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    isActive={editor?.isActive('bold')}
                  >
                    <Bold size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    isActive={editor?.isActive('italic')}
                  >
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    isActive={editor?.isActive('underline')}
                  >
                    <UnderlineIcon size={16} />
                  </ToolbarButton>

                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    isActive={editor?.isActive('bulletList')}
                  >
                    <List size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    isActive={editor?.isActive('orderedList')}
                  >
                    <ListOrdered size={16} />
                  </ToolbarButton>

                  <ToolbarButton
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    isActive={editor?.isActive({ textAlign: 'left' })}
                  >
                    <AlignLeft size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    isActive={editor?.isActive({ textAlign: 'center' })}
                  >
                    <AlignCenter size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    isActive={editor?.isActive({ textAlign: 'right' })}
                  >
                    <AlignRight size={16} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                    isActive={editor?.isActive({ textAlign: 'justify' })}
                  >
                    <AlignJustify size={16} />
                  </ToolbarButton>
                </div>

                {/* Editor Content */}
                <EditorContent 
                  editor={editor} 
                  className="bg-white min-h-[150px] p-4"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className={`px-6 py-2 font-medium text-white bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                disabled={loading}
              >
                {loading ? <div className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Saving...</div> : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddService;