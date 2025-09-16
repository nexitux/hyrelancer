"use client"
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Plus,
  Trash2,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { Select } from 'antd';

const { Option } = Select;

const ExperiencePage = () => {
  const [experiences, setExperiences] = useState([]);
  const [formData, setFormData] = useState({
    year: '',
    position: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Describe your experience...</p>',
    editorProps: {
      attributes: {
        class: 'min-h-[150px] p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        description: editor.getHTML()
      }));
    },
    immediatelyRender: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.description || formData.description === '<p></p>') newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingId !== null) {
      // Update existing experience
      setExperiences(experiences.map(exp => 
        exp.id === editingId ? { ...formData, id: editingId } : exp
      ));
      setEditingId(null);
    } else {
      // Add new experience
      const newExperience = {
        ...formData,
        id: Date.now()
      };
      setExperiences([...experiences, newExperience]);
    }

    // Reset form
    setFormData({
      year: '',
      position: '',
      description: ''
    });
    editor?.commands.setContent('<p></p>');
  };

  const handleEdit = (id) => {
    const experienceToEdit = experiences.find(exp => exp.id === id);
    setFormData({
      year: experienceToEdit.year,
      position: experienceToEdit.position,
      description: experienceToEdit.description
    });
    editor?.commands.setContent(experienceToEdit.description);
    setEditingId(id);
  };

  const handleDelete = (id) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      year: '',
      position: '',
      description: ''
    });
    editor?.commands.setContent('<p></p>');
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Experience</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Year and Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="Ex: 2024-2025"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.year ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              placeholder="Your position"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.position ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
          </div>
        </div>

        {/* Description with Tiptap Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className={`border rounded-lg overflow-hidden ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}>
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
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
            </div>
            
            {/* Editor Content */}
            <div className="bg-white">
              <EditorContent 
                editor={editor}
                className="min-h-[150px] p-4 focus:outline-none prose prose-sm max-w-none"
              />
            </div>
          </div>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          {editingId !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center"
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            {editingId !== null ? (
              <>
                <Save className="w-4 h-4 mr-1" /> Update
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" /> Add Experience
              </>
            )}
          </button>
        </div>
      </form>

      {/* Experiences Table */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Your Experiences</h2>
        {experiences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No experiences added yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exp.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exp.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div 
                        className="prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ __html: exp.description }} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(exp.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="inline w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="inline w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperiencePage;