'use client';

import { useState ,useEffect} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import ListItem from '@tiptap/extension-list-item';
import { useRouter } from 'next/navigation'; // Import useRouter
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Loader2
} from 'lucide-react';
import { message } from 'antd';

const API_BASE_URL = 'https://test.hyrelancer.in/api/admin';

const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }
};

const AddCategory = ({ record, suggestionDetails }) => {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto',
        },
      }),
      ListItem,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4',
      },
    },
    immediatelyRender: false,
  });
  useEffect(() => {
    if (suggestionDetails) {
      setCategoryName(suggestionDetails.fsu_suggestion || '');
      // You can set other fields based on the suggestion details if needed
    }
  }, [suggestionDetails])

  const colors = [
    '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
    '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
    '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b266', '#66a3e0', '#c285ff',
    '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
    '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466',
  ];

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    setIconFile(file);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    setBannerFile(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Form validation
    if (!categoryName) {
      setError('Category name is required.');
      setLoading(false);
      return;
    }
    
    // Create FormData object to send files and other data
    const formData = new FormData();
    formData.append('sc_name', categoryName);
    formData.append('sc_desc', editor?.getHTML() || 'No description provided.');
    formData.append('sc_is_active', 1);
    
    // Append files with the correct names expected by the backend
    if (iconFile) {
      formData.append('ca_icon_file', iconFile);
    }
    if (bannerFile) {
      formData.append('ca_pic_file', bannerFile);
    }

    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/storeCategory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });
      
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          // Display backend validation errors
          const errorMessages = Object.values(result.errors).flat();
          setError(errorMessages.join(' '));
          message.error(errorMessages.join(' '));
        } else {
          const errorMessage = result.message || 'Failed to create category.';
          setError(errorMessage);
          message.error(errorMessage);
        }
        return;
      }

      setSuccess('Category created successfully!');
      message.success('Category created successfully!');
      // Redirect to the category list page after a short delay
      setTimeout(() => {
        router.push('/control/category');
      }, 1000);

    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Add Category</h1>
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Category</span>
            <span>›</span>
            <span className="text-gray-900">Add Category</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-6 pb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">ADD CATEGORY</h2>
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Category Name */}
                <div>
                  <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category-name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                {/* Icon Upload */}
                <div>
                  <label htmlFor="icon-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
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
                      className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500"
                    >
                      <span className="text-gray-500">
                        {iconFile ? iconFile.name : 'Choose file'}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {iconFile ? '' : 'No file chosen'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label htmlFor="banner-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Banner
                  </label>
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
                      className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500"
                    >
                      <span className="text-gray-500">
                        {bannerFile ? bannerFile.name : 'Choose file'}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {bannerFile ? '' : 'No file chosen'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Description with Tiptap Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  {/* Toolbar */}
                  <div className="border-b border-gray-200 p-2 bg-gray-50">
                    <div className="flex flex-wrap gap-1">
                      {/* Text Formatting */}
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                      >
                        <Bold size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                      >
                        <Italic size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline"
                      >
                        <UnderlineIcon size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Strikethrough"
                      >
                        <Strikethrough size={16} />
                      </ToolbarButton>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      {/* Lists */}
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                      >
                        <List size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                      >
                        <ListOrdered size={16} />
                      </ToolbarButton>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      {/* Alignment */}
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        title="Align Left"
                      >
                        <AlignLeft size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        title="Align Center"
                      >
                        <AlignCenter size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        title="Align Right"
                      >
                        <AlignRight size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        title="Justify"
                      >
                        <AlignJustify size={16} />
                      </ToolbarButton>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      {/* Colors */}
                      <div className="relative">
                        <ToolbarButton
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          title="Text Color"
                        >
                          <Palette size={16} />
                        </ToolbarButton>
                        {showColorPicker && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10">
                            <div className="grid grid-cols-7 gap-1">
                              {colors.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    editor.chain().focus().setColor(color).run();
                                    setShowColorPicker(false);
                                  }}
                                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <ToolbarButton
                          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                          title="Highlight"
                        >
                          <Highlighter size={16} />
                        </ToolbarButton>
                        {showHighlightPicker && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 z-10">
                            <div className="grid grid-cols-7 gap-1">
                              {colors.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    editor.chain().focus().toggleHighlight({ color }).run();
                                    setShowHighlightPicker(false);
                                  }}
                                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      {/* Block Elements */}
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Quote"
                      >
                        <Quote size={16} />
                      </ToolbarButton>
                      <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        title="Code Block"
                      >
                        <Code size={16} />
                      </ToolbarButton>

                      <div className="w-px h-6 bg-gray-300 mx-1" />

                      {/* Media */}
                      <ToolbarButton onClick={setLink} title="Add Link">
                        <LinkIcon size={16} />
                      </ToolbarButton>
                      <ToolbarButton onClick={addImage} title="Add Image">
                        <ImageIcon size={16} />
                      </ToolbarButton>
                    </div>
                  </div>

                  {/* Editor Content */}
                  <EditorContent 
                    editor={editor} 
                    className="bg-white min-h-[200px] focus-within:ring-2 focus-within:ring-blue-500"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategory; 