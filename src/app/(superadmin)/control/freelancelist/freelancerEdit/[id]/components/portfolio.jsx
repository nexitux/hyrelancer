"use client"
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Plus, Trash2,
  FileImage, Video, Edit, ArrowLeft, User, Briefcase, Settings
} from 'lucide-react';

const AdminContentForm = () => {
  // State management
  const [userData, setUserData] = useState(null); // null = loading, false = new user, object = existing user
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentView, setCurrentView] = useState('loading'); // 'loading', 'newUser', 'dashboard', 'editSkills', 'editPortfolio'
  const [error, setError] = useState('');

  // Form state for new user / portfolio
  const [title, setTitle] = useState('');
  const [imageFields, setImageFields] = useState([{ id: 1, file: null, preview: null }]);
  const [videoFields, setVideoFields] = useState([{ id: Date.now(), url: '' }]);

  // Skills management
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [editingPortfolioId, setEditingPortfolioId] = useState(null);

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

  // Simulate API calls - Replace these with your actual API endpoints
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate different scenarios - modify this based on your API response
      const mockResponse = {
        // Change this to null or false to simulate new user
        portfolio: [
          {
            id: 1,
            title: 'Sample Portfolio Item',
            description: '<p>This is a sample description with <strong>bold text</strong></p>',
            images: [{ id: 1, name: 'image1.jpg', url: 'https://via.placeholder.com/150' }],
            videos: [{ id: 1, url: 'https://www.youtube.com/watch?v=example' }],
            createdAt: '2024-01-15T10:30:00Z'
          }
        ],
        skills: ['React', 'Node.js', 'JavaScript']
      };

      if (mockResponse.portfolio || mockResponse.skills) {
        setUserData(mockResponse);
        setCurrentView('dashboard');
      } else {
        setUserData(false);
        setCurrentView('newUser');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please try again.');
      setUserData(false);
      setCurrentView('newUser');
    } finally {
      setLoading(false);
    }
  };

  const handleNewUserSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError('');

      // Validation
      if (!title.trim()) {
        setError('Title is required');
        return;
      }
      if (skills.length === 0) {
        setError('At least one skill is required');
        return;
      }

      const formData = {
        portfolio: {
          title: title.trim(),
          description: editor ? editor.getHTML() : '',
          images: imageFields.filter(f => f.file).map(field => ({
            file: field.file,
            name: field.file.name
          })),
          videos: videoFields.filter(f => f.url.trim()).map(field => ({
            url: field.url.trim()
          }))
        },
        skills: skills
      };

      // Replace with actual API call:
      // const response = await fetch('/api/user/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate successful creation
      const newUserData = {
        portfolio: [{
          id: Date.now(),
          title: formData.portfolio.title,
          description: formData.portfolio.description,
          images: formData.portfolio.images.map((img, idx) => ({
            id: idx + 1,
            name: img.name,
            url: URL.createObjectURL(img.file)
          })),
          videos: formData.portfolio.videos,
          createdAt: new Date().toISOString()
        }],
        skills: formData.skills
      };

      setUserData(newUserData);
      setCurrentView('dashboard');

    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to save data. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSkillsUpdate = async () => {
    try {
      setSubmitLoading(true);
      setError('');

      if (skills.length === 0) {
        setError('At least one skill is required');
        return;
      }

      // Replace with actual API call:
      // const response = await fetch('/api/user/skills', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ skills })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUserData(prev => ({ ...prev, skills }));
      setCurrentView('dashboard');

    } catch (error) {
      console.error('Error updating skills:', error);
      setError('Failed to update skills. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePortfolioUpdate = async () => {
    try {
      setSubmitLoading(true);
      setError('');

      if (!title.trim()) {
        setError('Title is required');
        return;
      }

      const portfolioData = {
        id: editingPortfolioId || Date.now(),
        title: title.trim(),
        description: editor ? editor.getHTML() : '',
        images: imageFields.filter(f => f.file || f.existing).map((field, idx) => ({
          id: field.id || (idx + 1),
          file: field.file,
          name: field.file ? field.file.name : 'existing',
          existing: !!field.existing,
          url: field.preview
        })),
        videos: videoFields.filter(f => f.url.trim()).map(field => ({
          id: field.id || Date.now(),
          url: field.url.trim()
        })),
        createdAt: new Date().toISOString()
      };

      // simulate API call (replace with real call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUserData(prev => {
        const existing = prev?.portfolio || [];

        // editing existing: replace the item
        if (editingPortfolioId) {
          const updated = existing.map(item => item.id === editingPortfolioId ? {
            ...item,
            title: portfolioData.title,
            description: portfolioData.description,
            images: portfolioData.images.map((img, idx) => ({
              id: img.id || idx + 1,
              name: img.name,
              url: img.file ? URL.createObjectURL(img.file) : img.url
            })),
            videos: portfolioData.videos
          } : item);
          return { ...prev, portfolio: updated };
        }

        // otherwise append new item
        const newItem = {
          id: portfolioData.id,
          title: portfolioData.title,
          description: portfolioData.description,
          images: portfolioData.images.map((img, idx) => ({
            id: img.id || idx + 1,
            name: img.name,
            url: img.file ? URL.createObjectURL(img.file) : img.url
          })),
          videos: portfolioData.videos,
          createdAt: portfolioData.createdAt
        };
        return { ...prev, portfolio: [...existing, newItem] };
      });

      setEditingPortfolioId(null);
      setCurrentView('dashboard');

    } catch (error) {
      console.error('Error updating portfolio:', error);
      setError('Failed to update portfolio. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };


  const startNewPortfolioItem = () => {
    setEditingPortfolioId(null);
    setTitle('');
    setImageFields([{ id: Date.now(), file: null, preview: null }]);
    setVideoFields([{ id: Date.now(), url: '' }]);
    if (editor) editor.commands.setContent('<p>Enter your description here...</p>');
    setError('');
    setCurrentView('editPortfolio');
  };

  const startEditPortfolioItem = (idOrIndex) => {
    const portfolio = Array.isArray(userData?.portfolio)
      ? userData.portfolio.find(p => p.id === idOrIndex) || userData.portfolio[idOrIndex]
      : null;

    setEditingPortfolioId(portfolio?.id ?? null);
    setTitle(portfolio?.title || '');
    if (editor) editor.commands.setContent(portfolio?.description || '<p>Enter your description here...</p>');

    const newImageFields = (portfolio?.images || []).map(img => ({
      id: img.id || Date.now(),
      file: null,
      preview: img.url,
      existing: true
    }));
    setImageFields(newImageFields.length ? newImageFields : [{ id: Date.now(), file: null, preview: null }]);

    const newVideoFields = (portfolio?.videos || []).map(vid => ({ id: vid.id || Date.now(), url: vid.url }));
    setVideoFields(newVideoFields.length ? newVideoFields : [{ id: Date.now(), url: '' }]);

    setError('');
    setCurrentView('editPortfolio');
  };

  // Initialize data fetch
  useEffect(() => {
    fetchUserData();
  }, []);

  // Utility functions
  const resetForm = () => {
    setTitle('');
    setImageFields([{ id: Date.now(), file: null, preview: null }]);
    setVideoFields([{ id: Date.now(), url: '' }]);
    if (editor) {
      editor.commands.setContent('<p>Enter your description here...</p>');
    }
    setError('');
  };

  const resetSkillsForm = () => {
    setSkills(userData?.skills || []);
    setSkillInput('');
    setError('');
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

  // Skills management
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
      if (field?.preview && field.file) {
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

  // Navigation handlers
  const handleEditSkills = () => {
    setSkills([...userData.skills]);
    setCurrentView('editSkills');
  };

  const handleEditPortfolio = () => {
    const portfolio = userData.portfolio[0];
    if (portfolio) {
      setTitle(portfolio.title);
      if (editor) {
        editor.commands.setContent(portfolio.description);
      }

      // Set up image fields
      const imageFields = portfolio.images.map(img => ({
        id: img.id,
        file: null,
        preview: img.url,
        existing: true
      }));
      if (imageFields.length === 0) {
        imageFields.push({ id: Date.now(), file: null, preview: null });
      }
      setImageFields(imageFields);

      // Set up video fields
      const videoFields = portfolio.videos.map(vid => ({
        id: vid.id,
        url: vid.url
      }));
      if (videoFields.length === 0) {
        videoFields.push({ id: Date.now(), url: '' });
      }
      setVideoFields(videoFields);
    }
    setCurrentView('editPortfolio');
  };

  const goBack = () => {
    if (currentView === 'editSkills') {
      resetSkillsForm();
    } else if (currentView === 'editPortfolio') {
      resetForm();
    }
    setCurrentView('dashboard');
  };

  // Toolbar button component
  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
        }`}
    >
      {children}
    </button>
  );

  // Loading state
  if (currentView === 'loading') {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New User Form
  if (currentView === 'newUser') {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Welcome! Set up your profile</h1>
                <p className="text-sm text-gray-500">Create your portfolio and add your skills</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Skills Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills *</label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <div className="text-sm text-gray-500">No skills added yet. Please add at least one skill.</div>
                  ) : (
                    skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-sm text-gray-800">{skill}</span>
                        {skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSkill(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Remove skill"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter portfolio title"
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
                        <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
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
                          {field.file ? field.file.name : 'No file chosen'}
                        </span>
                        {field.preview && (
                          <img src={field.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                        )}
                      </div>
                    </div>
                    {imageFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
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
                    {videoFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Video URL
                </button>
              </div>

              {/* Description */}
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
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div></div>
              <button
                type="button"
                onClick={handleNewUserSubmit}
                disabled={submitLoading}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Profile Management</h1>
                <p className="text-sm text-gray-500">Manage your portfolio and skills</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skills Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                  <button
                    onClick={handleEditSkills}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userData.skills?.map((skill, idx) => (
                    <div key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </div>
                  )) || <div className="text-gray-500">No skills added</div>}
                </div>
              </div>

              {/* Portfolio Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Portfolio</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startNewPortfolioItem}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Portfolio
                    </button>
                  </div>
                </div>

                {userData.portfolio && userData.portfolio.length > 0 ? (
                  <div className="space-y-3">
                    {userData.portfolio.map((item) => (
                      <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <div className="text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.description }} />
                            <div className="flex gap-4 text-xs text-gray-500 mt-2">
                              <span>{item.images?.length || 0} images</span>
                              <span>{item.videos?.length || 0} videos</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => startEditPortfolioItem(item.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No portfolio items</div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Skills View
  if (currentView === 'editSkills') {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Skills</h1>
                <p className="text-sm text-gray-500">Update the skills shown on your profile</p>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Add Skill */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Skill</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Current Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skills.length === 0 ? (
                    <div className="text-sm text-gray-500">No skills added yet.</div>
                  ) : (
                    skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                        <span className="text-sm text-gray-800">{skill}</span>
                        {skills.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSkill(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Remove skill"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSkillsUpdate}
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Skills'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Portfolio View
  if (currentView === 'editPortfolio') {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Edit Portfolio</h1>
                <p className="text-sm text-gray-500">Update your portfolio details</p>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter portfolio title"
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
                        <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
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
                          {field.file ? field.file.name : (field.preview ? 'Existing image' : 'No file chosen')}
                        </span>
                        {(field.preview || field.file) && (
                          <img src={field.preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                        )}
                      </div>
                    </div>
                    {imageFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
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
                    {videoFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVideoField(field.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoField}
                  className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Video URL
                </button>
              </div>

              {/* Description */}
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
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePortfolioUpdate}
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Portfolio'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminContentForm;
