'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Base64 } from 'js-base64';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Loader2, Trash2
} from 'lucide-react';
import { message } from 'antd'; // Import for toast notifications

// API configuration
const API_BASE_URL = 'https://hyre.hyrelancer.com/api/admin';

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

// Helper function to convert technical field names to user-friendly names
const getFieldDisplayName = (fieldName) => {
  const fieldMap = {
    'se_icon_file': 'Service Icon',
    'se_img_file': 'Service Banner', 
    'se_name': 'Service Name',
    'se_sc_id': 'Category',
    'se_desc': 'Description'
  };
  return fieldMap[fieldName] || fieldName;
};

// Helper function to make error messages more user-friendly
const formatErrorMessage = (message, fieldName) => {
  const displayName = getFieldDisplayName(fieldName);
  
  // Replace technical terms with user-friendly ones
  return message
    .replace(/se_icon_file/g, 'service icon')
    .replace(/se_img_file/g, 'service banner')
    .replace(/se_name/g, 'service name')
    .replace(/se_sc_id/g, 'category')
    .replace(/se_desc/g, 'description')
    .replace(/The se /g, 'The ')
    .replace(/file field/g, '')
    .replace(/must be a file of type/g, 'must be')
    .trim();
};

const ToolbarButton = ({ onClick, isActive, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-1 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200' : ''}`}
  >
    {children}
  </button>
);

const EditService = ({ params }) => {
  const { id: encodedId } = params;
  const router = useRouter();
  const decodedId = encodedId ? Base64.decode(encodedId) : null;

  // State for form data and UI
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [existingIconUrl, setExistingIconUrl] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState(null);
  
  // State for API call status
  const [loading, setLoading] = useState(true);
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

  // Clear persisting messages when component mounts
  useEffect(() => {
    // Clear any previous error/success messages when component loads
    setError(null);
    setSuccess(null);
    
    // Clear any persisting antd messages
    message.destroy();
  }, []);

  // Fetch data on component mount
  const fetchData = useCallback(async () => {
    if (!decodedId) {
      setError("Invalid service ID.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        TokenManager.removeToken();
        router.push('/gateway');
        return;
      }
      
      // Fetch both service and categories concurrently
      const [serviceResponse, categoryResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/services/${encodedId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/category`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (serviceResponse.status === 401 || categoryResponse.status === 401) {
        TokenManager.removeToken();
        router.push('/gateway');
        return;
      }

      if (!serviceResponse.ok) throw new Error('Failed to fetch service data.');
      if (!categoryResponse.ok) throw new Error('Failed to fetch categories.');
      
      const serviceData = await serviceResponse.json();
      const categoryData = await categoryResponse.json();
      
      // Populate form fields
      setServiceName(serviceData.se_name || '');
      setSelectedCategory(serviceData.se_sc_id || '');
      if (editor) {
        editor.commands.setContent(serviceData.se_desc || '');
      }
      setExistingIconUrl(serviceData.se_icon);
      setExistingBannerUrl(serviceData.se_img);
      setCategories(categoryData.data.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [decodedId, encodedId, editor, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle file changes with immediate validation
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear any existing errors when a new file is selected
      setError(null);
      message.destroy();
      
      // Validate file type immediately
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        const msg = 'Please select a valid image file (JPEG, PNG, or GIF).';
        setError(msg);
        message.error(msg);
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size
      if (file.size > 2 * 1024 * 1024) {
        const msg = 'Service icon must be smaller than 2MB.';
        setError(msg);
        message.error(msg);
        e.target.value = ''; // Clear the input
        return;
      }
      
      setIconFile(file);
      setExistingIconUrl(null);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear any existing errors when a new file is selected
      setError(null);
      message.destroy();
      
      // Validate file type immediately
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        const msg = 'Please select a valid image file (JPEG, PNG, or GIF).';
        setError(msg);
        message.error(msg);
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        const msg = 'Service banner must be smaller than 5MB.';
        setError(msg);
        message.error(msg);
        e.target.value = ''; // Clear the input
        return;
      }
      
      setBannerFile(file);
      setExistingBannerUrl(null);
    }
  };

  // Handle form submission with improved error handling
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Clear any existing antd messages
    message.destroy();

    // Frontend validation
    if (!serviceName.trim()) {
      const msg = 'Please enter a service name.';
      setError(msg);
      message.error(msg);
      setLoading(false);
      return;
    }

    if (!selectedCategory) {
      const msg = 'Please select a category.';
      setError(msg);
      message.error(msg);
      setLoading(false);
      return;
    }

    // Validate file types on frontend before sending
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    
    if (iconFile && !validImageTypes.includes(iconFile.type)) {
      const msg = 'Service icon must be a JPEG, PNG, or GIF image.';
      setError(msg);
      message.error(msg);
      setLoading(false);
      return;
    }

    if (bannerFile && !validImageTypes.includes(bannerFile.type)) {
      const msg = 'Service banner must be a JPEG, PNG, or GIF image.';
      setError(msg);
      message.error(msg);
      setLoading(false);
      return;
    }

    // Check file sizes (2MB for icon, 5MB for banner)
    if (iconFile && iconFile.size > 2 * 1024 * 1024) {
      const msg = 'Service icon must be smaller than 2MB.';
      setError(msg);
      message.error(msg);
      setLoading(false);
      return;
    }

    if (bannerFile && bannerFile.size > 5 * 1024 * 1024) {
      const msg = 'Service banner must be smaller than 5MB.';
      setError(msg);
      message.error(msg);
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('se_name', serviceName.trim());
    formData.append('se_sc_id', selectedCategory);
    formData.append('se_desc', editor?.getHTML() || '');
    
    // Only append files if they are selected and valid
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
      
      const response = await fetch(`${API_BASE_URL}/updateServices/${encodedId}`, {
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
        let userFriendlyMessage = 'Failed to update service.';
        
        if (result.errors) {
          // Process validation errors and make them user-friendly
          const errorMessages = [];
          
          Object.entries(result.errors).forEach(([fieldName, messages]) => {
            messages.forEach(message => {
              const friendlyMessage = formatErrorMessage(message, fieldName);
              errorMessages.push(friendlyMessage);
            });
          });
          
          if (errorMessages.length > 0) {
            userFriendlyMessage = errorMessages.join(' ');
          }
        } else if (result.message) {
          userFriendlyMessage = result.message;
        }
        
        setError(userFriendlyMessage);
        message.error(userFriendlyMessage);
        return;
      }

      const successMsg = 'Service updated successfully!';
      setSuccess(successMsg);
      message.success(successMsg);
      
      // Clear the form state
      setIconFile(null);
      setBannerFile(null);
      
      // Redirect after a short delay
      setTimeout(() => {
        // Clear messages before navigation
        message.destroy();
        router.push('/control/ServicesList');
      }, 1500);

    } catch (err) {
      console.error('API Error:', err);
      const msg = 'An unexpected error occurred. Please try again.';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!editor || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;
  }
  
  if (error && !loading && !serviceName) {
    return (
      <div className="min-h-screen p-6 text-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">EDIT SERVICE</h2>
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

            {/* Service Name, Category, Icon, Banner */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Service Name */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Service Name</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter service name"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
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
              </div>

              {/* Icon */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Service Icon</label>
                {existingIconUrl && (
                  <div className="relative mb-2 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img src={`https://hyre.hyrelancer.com/${existingIconUrl}`} alt="Current Icon" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingIconUrl(null)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Remove current icon"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
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
                    <span className="text-gray-500">Choose a new icon</span>
                    <span className="text-sm text-gray-400">
                      {iconFile ? iconFile.name : 'No file chosen'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Max 2MB, JPEG/PNG/GIF only</p>
              </div>
              
              {/* Banner */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Service Banner</label>
                {existingBannerUrl && (
                  <div className="relative mb-2 h-24 w-full rounded-lg overflow-hidden border border-gray-200">
                    <img src={`https://hyre.hyrelancer.com/${existingBannerUrl}`} alt="Current Banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExistingBannerUrl(null)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Remove current banner"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
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
                    <span className="text-gray-500">Choose a new banner</span>
                    <span className="text-sm text-gray-400">
                      {bannerFile ? bannerFile.name : 'No file chosen'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Max 5MB, JPEG/PNG/GIF only</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
              <div className="overflow-hidden rounded-md border border-gray-300">
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold')}><Bold size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={editor?.isActive('italic')}><Italic size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} isActive={editor?.isActive('underline')}><UnderlineIcon size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={editor?.isActive('bulletList')}><List size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} isActive={editor?.isActive('orderedList')}><ListOrdered size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} isActive={editor?.isActive({ textAlign: 'left' })}><AlignLeft size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} isActive={editor?.isActive({ textAlign: 'center' })}><AlignCenter size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} isActive={editor?.isActive({ textAlign: 'right' })}><AlignRight size={16} /></ToolbarButton>
                  <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('justify').run()} isActive={editor?.isActive({ textAlign: 'justify' })}><AlignJustify size={16} /></ToolbarButton>
                </div>
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
                {loading ? <div className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Saving...</div> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;