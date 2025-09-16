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
  Image,
  Table,
  MoreHorizontal,
  Type,
  HelpCircle
} from 'lucide-react';
import { Select } from 'antd';

const { Option } = Select;

const ProfileForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    languages: [],
    tagLine: 'FASF',
    workCompletingTime: '',
    amountFor: 'Hour',
    paymentMethod: 'Through Hyeriancer',
    amount: '0'
  });

  // Initialize TipTap editor with more extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Tell us about yourself...</p>',
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
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLanguageChange = (value) => {
    setFormData(prev => ({
      ...prev,
      languages: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const content = editor ? editor.getHTML() : '';
    console.log('Profile Form submitted:', { ...formData, aboutMe: content });
  };

  // Enhanced Toolbar button component
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
      <h1 className="text-2xl font-bold mb-8">Profile Pie</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Picture Upload */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Profile Pic</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-center px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
              <span className="text-sm text-gray-500 block">
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Display Name</h2>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Display Name"
            />
          </div>

          {/* Language - Improved Multi-select */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Language</h2>
            <Select
              mode="multiple"
              placeholder="Select languages"
              value={formData.languages}
              onChange={handleLanguageChange}
              className="w-full"
              size="large"
              dropdownStyle={{ zIndex: 2000 }}
            >
              {["English", "Spanish", "French", "German", "Chinese", "Japanese", "Italian", "Portuguese"].map((lang) => (
                <Option key={lang} value={lang}>
                  {lang}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Tag Line */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Tag Line</h2>
          <textarea
            name="tagLine"
            value={formData.tagLine}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Enhanced About Me with TipTap Editor */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">About Me</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Editor Toolbar - More Elegant */}
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
                  <Image className="w-4 h-4" />
                </ToolbarButton>
                
                <ToolbarButton title="Table">
                  <Table className="w-4 h-4" />
                </ToolbarButton>
              </div>
              
              <div className="ml-auto flex items-center gap-2">
                <select 
                  onChange={e => {
                    const value = e.target.value;
                    if (value === 'paragraph') {
                      editor?.chain().focus().setParagraph().run();
                    } else {
                      editor?.chain().focus().toggleHeading({ level: parseInt(value.replace('h', '')) }).run();
                    }
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="paragraph">Normal</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>
                
                <ToolbarButton title="Help">
                  <HelpCircle className="w-4 h-4" />
                </ToolbarButton>
              </div>
            </div>
            
            {/* Editor Content - More Elegant */}
            <div className="bg-white">
              <EditorContent 
                editor={editor}
                className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Work Completing Time */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Work Completing Time</h2>
            <div className="relative">
              <select
                name="workCompletingTime"
                value={formData.workCompletingTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select Work Completing Time</option>
                <option value="1-3 days">1-3 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Payment method</h2>
            <div className="relative">
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="Through Hyeriancer">Through Hyeriancer</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Amount For */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Amount For</h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <select
                  name="amountFor"
                  value={formData.amountFor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="Hour">Hour</option>
                  <option value="Project">Project</option>
                  <option value="Word">Word</option>
                  <option value="Page">Page</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Amount</h2>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        {/* Submit Button - Aligned bottom left and right */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={() => console.log('Verify clicked')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Verify
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;