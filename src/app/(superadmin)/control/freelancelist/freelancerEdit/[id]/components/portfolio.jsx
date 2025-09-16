"use client"
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Upload, 
  ChevronDown, 
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
  Image as ImageIcon,
  Table as TableIcon,
  Plus,
  Trash2,
  FileImage,
  Video
} from 'lucide-react';

const ContentForm = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [imageFields, setImageFields] = useState([{ id: 1, file: null }]);
  const [videoFields, setVideoFields] = useState([{ id: 1, url: '' }]);
  const [savedData, setSavedData] = useState([]);

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
        class: 'min-h-[200px] p-4 focus:outline-none',
      },
    },
    // Add these SSR-related configurations
    onCreate: () => {
      // This ensures the editor is only created on the client side
      if (typeof window !== 'undefined') {
        // Additional initialization if needed
      }
    },
    onUpdate: ({ editor }) => {
      // Handle updates
    },
    // Explicitly disable immediate rendering for SSR
    immediatelyRender: false,
  }, []);

  // Handle image file change
  const handleImageChange = (id, e) => {
    const updatedFields = imageFields.map(field => 
      field.id === id ? { ...field, file: e.target.files[0] } : field
    );
    setImageFields(updatedFields);
  };

  // Handle video URL change
  const handleVideoUrlChange = (id, e) => {
    const updatedFields = videoFields.map(field => 
      field.id === id ? { ...field, url: e.target.value } : field
    );
    setVideoFields(updatedFields);
  };

  // Add new image field
  const addImageField = () => {
    setImageFields([...imageFields, { id: Date.now(), file: null }]);
  };

  // Remove image field
  const removeImageField = (id) => {
    if (imageFields.length > 1) {
      setImageFields(imageFields.filter(field => field.id !== id));
    }
  };

  // Add new video field
  const addVideoField = () => {
    setVideoFields([...videoFields, { id: Date.now(), url: '' }]);
  };

  // Remove video field
  const removeVideoField = (id) => {
    if (videoFields.length > 1) {
      setVideoFields(videoFields.filter(field => field.id !== id));
    }
  };

  // Save form data to table
  const handleSave = (e) => {
    e.preventDefault();
    
    const newEntry = {
      id: Date.now(),
      title,
      images: imageFields.map(field => ({
        id: field.id,
        name: field.file ? field.file.name : 'No file chosen'
      })),
      videos: videoFields.map(field => ({
        id: field.id,
        url: field.url
      })),
      description: editor ? editor.getHTML() : '',
      date: new Date().toLocaleString()
    };

    setSavedData([...savedData, newEntry]);
    resetForm();
  };

  // Reset form after save
  const resetForm = () => {
    setTitle('');
    setImageFields([{ id: Date.now(), file: null }]);
    setVideoFields([{ id: Date.now(), url: '' }]);
    if (editor) {
      editor.commands.setContent('<p>Enter your description here...</p>');
    }
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
      <h1 className="text-2xl font-bold mb-8">Content Form</h1>
      
      <form onSubmit={handleSave} className="space-y-8">
        {/* Title */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Title</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter title"
            required
          />
        </div>

        {/* Image Upload Fields */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Images</h2>
          {imageFields.map((field) => (
            <div key={field.id} className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="flex items-center justify-between px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <FileImage className="w-4 h-4 mr-2" />
                    <span>Choose Image</span>
                  </div>
                  <span className="text-sm text-gray-500 truncate max-w-xs">
                    {field.file ? field.file.name : 'No file chosen'}
                  </span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleImageChange(field.id, e)}
                    accept="image/*"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeImageField(field.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                disabled={imageFields.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Image
          </button>
        </div>

        {/* Video URL Fields */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Video URLs</h2>
          {videoFields.map((field) => (
            <div key={field.id} className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center">
                  <Video className="w-4 h-4 mr-2 text-gray-500" />
                  <input
                    type="url"
                    value={field.url}
                    onChange={(e) => handleVideoUrlChange(field.id, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video URL"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeVideoField(field.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                disabled={videoFields.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addVideoField}
            className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Video URL
          </button>
        </div>

        {/* Description with TipTap Editor */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Description</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
              <div className="flex items-center gap-1">
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
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <div className="flex items-center gap-1">
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
              </div>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <div className="flex items-center gap-1">
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
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <div className="flex items-center gap-1">
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
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <div className="flex items-center gap-1">
                <ToolbarButton 
                  onClick={() => editor?.chain().focus().setLink({ href: 'https://example.com' }).run()}
                  isActive={editor?.isActive('link')}
                  title="Link"
                >
                  <Link className="w-4 h-4" />
                </ToolbarButton>
                
                <ToolbarButton title="Image">
                  <ImageIcon className="w-4 h-4" />
                </ToolbarButton>
                
                <ToolbarButton title="Table">
                  <TableIcon className="w-4 h-4" />
                </ToolbarButton>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="bg-white">
              <EditorContent 
                editor={editor}
                className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-8 border-t border-gray-200">
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>

      {/* Saved Data Table */}
      {savedData.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Saved Content</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Videos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {savedData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <ul className="list-disc pl-5">
                        {item.images.map(img => (
                          <li key={img.id}>{img.name}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <ul className="list-disc pl-5">
                        {item.videos.map(vid => (
                          <li key={vid.id}>
                            <a href={vid.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {vid.url || 'No URL'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentForm;