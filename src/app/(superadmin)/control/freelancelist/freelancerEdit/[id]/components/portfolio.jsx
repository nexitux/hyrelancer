"use client"
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Strikethrough, List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Link, Image, Plus, Trash2, 
  FileImage, Video, Edit, Eye, Save, X
} from 'lucide-react';

const AdminContentForm = () => {
  // State management
  const [contentData, setContentData] = useState(null); // null = loading, [] = no data, [...] = has data
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [imageFields, setImageFields] = useState([{ id: 1, file: null, preview: null }]);
  const [videoFields, setVideoFields] = useState([{ id: 1, url: '' }]);
  const [editingId, setEditingId] = useState(null);

  // Skills (non-editable chips; can add new, can delete but cannot delete last)
  const [skills, setSkills] = useState([]); // array of strings
  const [skillInput, setSkillInput] = useState('');

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Enter your description here...</p>',
    editorProps: {
      attributes: {
        class: 'min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none',
      },
    },
    immediatelyRender: false,
  }, []);

  // Simulate data fetching
  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Change this to [] to see the form, or add items to see the list
      const mockData = [
        {
          id: 1,
          title: 'Sample Content 1',
          description: '<p>This is a sample description with <strong>bold text</strong></p>',
          images: [
            { id: 1, name: 'image1.jpg', url: 'https://via.placeholder.com/150' }
          ],
          videos: [
            { id: 1, url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
          ],
          skills: ['React', 'Node.js'],
          date: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          title: 'Sample Content 2',
          description: '<p>Another sample with <em>italic text</em> and a list:</p><ul><li>Item 1</li><li>Item 2</li></ul>',
          images: [
            { id: 1, name: 'image2.jpg', url: 'https://via.placeholder.com/150' },
            { id: 2, name: 'image3.jpg', url: 'https://via.placeholder.com/150' }
          ],
          videos: [],
          skills: ['Marketing'],
          date: '2024-01-14 15:45:00'
        }
      ];
      
      setContentData(mockData);
      setLoading(false);
    }, 1000);
  };

  // Handle image file change
  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    const updatedFields = imageFields.map(field => {
      if (field.id === id) {
        let preview = null;
        if (file) {
          preview = URL.createObjectURL(file);
        }
        return { ...field, file, preview };
      }
      return field;
    });
    setImageFields(updatedFields);
  };

  // Handle video URL change
  const handleVideoUrlChange = (id, e) => {
    const updatedFields = videoFields.map(field => 
      field.id === id ? { ...field, url: e.target.value } : field
    );
    setVideoFields(updatedFields);
  };

  // Skill handlers (non-editable chips)
  const addSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    if (skills.includes(val)) {
      setSkillInput('');
      return;
    }
    setSkills(prev => [...prev, val]);
    setSkillInput('');
  };

  const removeSkill = (index) => {
    // Prevent removing if only one skill remains
    if (skills.length <= 1) return;
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Add/Remove fields
  const addImageField = () => {
    setImageFields([...imageFields, { id: Date.now(), file: null, preview: null }]);
  };

  const removeImageField = (id) => {
    if (imageFields.length > 1) {
      const field = imageFields.find(f => f.id === id);
      if (field?.preview) {
        URL.revokeObjectURL(field.preview);
      }
      setImageFields(imageFields.filter(field => field.id !== id));
    }
  };

  const addVideoField = () => {
    setVideoFields([...videoFields, { id: Date.now(), url: '' }]);
  };

  const removeVideoField = (id) => {
    if (videoFields.length > 1) {
      setVideoFields(videoFields.filter(field => field.id !== id));
    }
  };

  // Form actions
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newEntry = {
        id: editingId || Date.now(),
        title,
        description: editor ? editor.getHTML() : '',
        images: imageFields.filter(f => f.file).map(field => ({
          id: field.id,
          name: field.file.name,
          url: field.preview || 'https://via.placeholder.com/150'
        })).concat(
          // include existing previews (when editing)
          imageFields.filter(f => f.existing && !f.file).map(f => ({ id: f.id, name: 'existing', url: f.preview }))
        ),
        videos: videoFields.filter(f => f.url.trim()).map(field => ({
          id: field.id,
          url: field.url
        })),
        skills: skills.length ? skills : [], // save skills
        date: new Date().toLocaleString()
      };

      if (editingId) {
        // Update existing
        setContentData(prev => prev.map(item => item.id === editingId ? newEntry : item));
      } else {
        // Add new
        setContentData(prev => [...(prev || []), newEntry]);
      }

      resetForm();
      setLoading(false);
    }, 1000);
  };

  const resetForm = () => {
    setTitle('');
    setImageFields([{ id: Date.now(), file: null, preview: null }]);
    setVideoFields([{ id: Date.now(), url: '' }]);
    setSkills([]);            // reset skills
    setSkillInput('');
    setIsEditing(false);
    setEditingId(null);
    if (editor) {
      editor.commands.setContent('<p>Enter your description here...</p>');
    }
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setEditingId(item.id);
    setIsEditing(true);
    
    // Set up image fields
    const imageFields = item.images.map(img => ({
      id: img.id,
      file: null, // In real app, you'd handle existing files differently
      preview: img.url,
      existing: true
    }));
    if (imageFields.length === 0) {
      imageFields.push({ id: Date.now(), file: null, preview: null });
    }
    setImageFields(imageFields);

    // Set up video fields
    const videoFields = item.videos.map(vid => ({
      id: vid.id,
      url: vid.url
    }));
    if (videoFields.length === 0) {
      videoFields.push({ id: Date.now(), url: '' });
    }
    setVideoFields(videoFields);

    // Set up skills (non-editable chips)
    setSkills(Array.isArray(item.skills) && item.skills.length ? item.skills : []);

    if (editor) {
      editor.commands.setContent(item.description);
    }
  };

  const handleAddNew = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  // Toolbar button component
  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
      }`}
    >
      {children}
    </button>
  );

  // Loading state
  if (loading && !isEditing) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-2">Manage your content items</p>
      </div>

      {/* Show form when editing or when no data exists */}
      {(isEditing || (Array.isArray(contentData) && contentData.length === 0)) ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Edit Content' : 'Add New Content'}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Skills (top, non-editable chips) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a skill and press Enter or click Add"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  <div className="text-sm text-gray-500">No skills added yet.</div>
                ) : (
                  skills.map((sk, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <span className="text-sm text-gray-800">{sk}</span>
                      {/* Delete allowed only if more than one skill exists */}
                      {skills.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Remove skill"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="p-1 text-gray-300 cursor-not-allowed"
                          title="At least one skill is required"
                          disabled
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              {imageFields.map((field) => (
                <div key={field.id} className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
                        <FileImage className="w-4 h-4 mr-2" />
                        <span>Choose Image</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleImageChange(field.id, e)}
                          accept="image/*"
                        />
                      </label>
                      <span className="text-sm text-gray-500 flex-1">
                        {field.file ? field.file.name : field.existing ? 'Existing image' : 'No file chosen'}
                      </span>
                      {field.preview && (
                        <img src={field.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImageField(field.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    disabled={imageFields.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </button>
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URLs</label>
              {videoFields.map((field) => (
                <div key={field.id} className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Video className="w-4 h-4 mr-2 text-gray-500" />
                      <input
                        type="url"
                        value={field.url}
                        onChange={(e) => handleVideoUrlChange(field.id, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter video URL"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideoField(field.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    disabled={videoFields.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVideoField}
                className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Video URL
              </button>
            </div>

            {/* Description with Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    isActive={editor?.isActive('bold')}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    isActive={editor?.isActive('italic')}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    isActive={editor?.isActive('strike')}
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    isActive={editor?.isActive('bulletList')}
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    isActive={editor?.isActive('orderedList')}
                    title="Ordered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    isActive={editor?.isActive({ textAlign: 'left' })}
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    isActive={editor?.isActive({ textAlign: 'center' })}
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    isActive={editor?.isActive({ textAlign: 'right' })}
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </ToolbarButton>

                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    isActive={editor?.isActive('blockquote')}
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().undo().run()}
                    title="Undo"
                  >
                    <Undo className="w-4 h-4" />
                  </ToolbarButton>
                  
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().redo().run()}
                    title="Redo"
                  >
                    <Redo className="w-4 h-4" />
                  </ToolbarButton>
                </div>
                
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Show list when data exists */
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Content Items</h2>
              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </button>
            </div>
          </div>

          {contentData && contentData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Images</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Videos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contentData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate" 
                             dangerouslySetInnerHTML={{ __html: item.description }} />
                        {/* show skills under title */}
                        {Array.isArray(item.skills) && item.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.skills.map((sk, idx) => (
                              <div key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{sk}</div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {item.images.slice(0, 3).map((img, idx) => (
                            <img key={idx} src={img.url} alt={img.name} 
                                 className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                          ))}
                          {item.images.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                              +{item.images.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.images.length} images</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.videos.length} videos</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.date}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-500 mb-4">No content items found</div>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Content
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContentForm;
