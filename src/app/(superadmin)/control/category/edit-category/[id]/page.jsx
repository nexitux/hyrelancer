'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Loader2, Trash2
} from 'lucide-react';
import { Base64 } from 'js-base64';

// Import admin API
import adminApi from '@/config/adminApi';
const decodeId = (encodedId) => {
  try {
    return Base64.decode(encodedId);
  } catch (error) {
    return null;
  }
};

const EditCategory = ({ params }) => {
  const { id: encodedId } = params;
  const router = useRouter();
  const decodedId = encodedId ? decodeId(encodedId) : null;

  const [categoryName, setCategoryName] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [existingIconUrl, setExistingIconUrl] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[100px] p-4 focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // Fetch existing category data on component mount
  const fetchCategoryData = useCallback(async () => {
    if (!decodedId) {
      setError("Invalid category ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await adminApi.get(`/category/${encodedId}`);
      const data = response.data.data;

      setCategoryName(data.sc_name || '');
      if (editor) {
        editor.commands.setContent(data.sc_desc || '');
      }
      setExistingIconUrl(data.sc_icon);
      setExistingBannerUrl(data.sc_img);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [decodedId, encodedId, editor]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(null);

  if (!categoryName) {
    setError('Category name is required.');
    setLoading(false);
    return;
  }

  const formData = new FormData();
  formData.append('sc_name', categoryName);
  formData.append('sc_desc', editor?.getHTML() || 'No description provided.');
  formData.append('sc_is_active', 1);

  // Handle icon file:
  // If a new file is chosen, append it.
  if (iconFile) {
    formData.append('ca_icon_file', iconFile);
  } 
  // If the user clicked "remove" and there's no new file, send null to backend.
  else if (existingIconUrl === null) {
    formData.append('ca_icon_file', 'null'); // Backend expects a string 'null' for file removal.
  }

  // Handle banner file:
  // If a new file is chosen, append it.
  if (bannerFile) {
    formData.append('ca_pic_file', bannerFile);
  } 
  // If the user clicked "remove" and there's no new file, send null to backend.
  else if (existingBannerUrl === null) {
    formData.append('ca_pic_file', 'null'); // Backend expects a string 'null' for file removal.
  }
  
  try {
    const response = await adminApi.post(`/updateCategory/${encodedId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setSuccess('Category updated successfully!');
    // A small delay for the user to see the success message
    setTimeout(() => {
      router.push('/control/category');
    }, 1000);

  } catch (err) {
    console.error('API Error:', err);
    
    if (err.response?.status === 422) {
      // Display backend validation errors
      const errorMessages = Object.values(err.response.data.errors || {}).flat();
      setError(errorMessages.join(' ') || err.response.data.message || 'Failed to update category.');
    } else {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    }
  } finally {
    setLoading(false);
  }
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

  const handleIconChange = (e) => {
    setIconFile(e.target.files[0]);
    setExistingIconUrl(null); // Clear the old image preview
  };

  const handleBannerChange = (e) => {
    setBannerFile(e.target.files[0]);
    setExistingBannerUrl(null); // Clear the old image preview
  };

  if (!editor || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">EDIT CATEGORY</h2>
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

            <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
              {/* Left Column: Category Name and Icon */}
              <div className="space-y-6">
                {/* Category Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category Name</label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Category Icon</label>
                  {existingIconUrl && (
                    <div className="relative mb-2 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={`https://backend.hyrelancer.in/${existingIconUrl}`} alt="Current Icon" className="w-full h-full object-cover" />
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
                </div>
              </div>

              {/* Right Column: Category Banner */}
              <div className="flex flex-col">
                <label className="block mb-1 text-sm font-medium text-gray-700">Category Banner</label>
                {existingBannerUrl && (
                  <div className="relative mb-2 h-40 w-full rounded-lg overflow-hidden border border-gray-200">
                    <img src={`https://backend.hyrelancer.in/${existingBannerUrl}`} alt="Current Banner" className="w-full h-full object-cover" />
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
                <div className="relative mt-auto">
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
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
              <div className="overflow-hidden rounded-md border border-gray-300">
                {/* Simple Toolbar */}
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
                {/* Editor Content */}
                <EditorContent editor={editor} className="bg-white min-h-[150px] p-4" />
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

export default EditCategory;