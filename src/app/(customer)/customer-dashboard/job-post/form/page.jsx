"use client";

import { useState } from 'react';
import Image from 'next/image';
import breadcrumb from '../../../../../../public/images/breadcrumb_service.webp';
import { ArrowLeft, Upload, Camera, MapPin, User, Phone, Mail, DollarSign, Calendar, FileText, Tag } from 'lucide-react';

const JobPostForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    year: '',
    experience: '',
    title: '',
    description: '',
    jobType: '',
    workMode: '',
    price: '',
    state: '',
    city: '',
    district: '',
    landmark: '',
    name: '',
    phone: '',
    email: ''
  });

  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [activeLocationTab, setActiveLocationTab] = useState('list');
  const [charCounts, setCharCounts] = useState({
    title: 0,
    description: 0,
    name: 0
  });

  const categories = [
    'Technology', 'Design', 'Business', 'Marketing', 'Sales', 
    'Engineering', 'Healthcare', 'Education', 'Finance'
  ];

  const subcategories = {
    Technology: ['Web Development', 'Mobile Apps', 'AI & Machine Learning', 'Cloud Computing', 'Cybersecurity'],
    Design: ['UI/UX Design', 'Graphic Design', 'Branding', 'Web Design', 'Print Design'],
    Business: ['Consulting', 'Management', 'Operations', 'Strategy', 'Analysis']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update character counts
    if (['title', 'description', 'name'].includes(name)) {
      setCharCounts(prev => ({ ...prev, [name]: value.length }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file)
    }));
    setUploadedPhotos(prev => [...prev, ...newPhotos].slice(0, 20));
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData, uploadedPhotos);
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="relative h-64 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage:
            `url(${breadcrumb.src})`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Post Your Job Ad</h1>
            <div className="flex items-center justify-center gap-2 text-lg">
              <span className="opacity-80">Category:</span>
              <span className="font-semibold">Technology</span>
              <span className="opacity-60">›</span>
              <span className="font-semibold">Web Development</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Categories</span>
        </button>

        <div className="space-y-8">
          {/* Job Details Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <FileText size={20} className="text-white" />
              </div>
              Job Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                  disabled={!formData.category}
                >
                  <option value="">Select Sub-Category</option>
                  {formData.category && subcategories[formData.category]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 2-5 years"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="Job location"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter job title"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                required
              />
              <div className="text-xs text-gray-500 mt-1">{charCounts.title}/100</div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the job requirements, responsibilities, and benefits..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">{charCounts.description}/500</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                    <label key={type} className="flex items-center gap-2 p-3 rounded-xl border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="jobType"
                        value={type.toLowerCase()}
                        checked={formData.jobType === type.toLowerCase()}
                        onChange={handleInputChange}
                        className="text-blue-500 focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Remote', 'On-site', 'Hybrid'].map(mode => (
                    <label key={mode} className="flex items-center gap-2 p-3 rounded-xl border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="workMode"
                        value={mode.toLowerCase()}
                        checked={formData.workMode === mode.toLowerCase()}
                        onChange={handleInputChange}
                        className="text-blue-500 focus:ring-blue-500"
                        required
                      />
                      <span className="text-sm font-medium">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Salary Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <DollarSign size={20} className="text-white" />
              </div>
              Salary Range
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Salary <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 50,000 - 80,000 per month"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Camera size={20} className="text-white" />
              </div>
              Upload Company Photos (Up to 20)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Main photo slot */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 transition-colors">
                  <Upload size={24} className="text-blue-500 mb-2" />
                  <span className="text-xs text-blue-600 font-medium">Main Photo</span>
                </div>
              </div>

              {/* Additional photo slots */}
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                    <Camera size={20} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Uploaded photos preview */}
            {uploadedPhotos.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Uploaded Photos ({uploadedPhotos.length}/20)</h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {uploadedPhotos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="Uploaded"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <MapPin size={20} className="text-white" />
              </div>
              Confirm Location
            </h2>

            <div className="flex gap-2 mb-6">
              {['List', 'Current Location'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveLocationTab(tab.toLowerCase().replace(' ', '-'))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeLocationTab === tab.toLowerCase().replace(' ', '-')
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select State</option>
                  <option value="kerala">Kerala</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="maharashtra">Maharashtra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select City</option>
                  <option value="kochi">Kochi</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="chennai">Chennai</option>
                  <option value="mumbai">Mumbai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select District</option>
                  <option value="ernakulam">Ernakulam</option>
                  <option value="bangalore-north">Bangalore North</option>
                  <option value="chennai-central">Chennai Central</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Nearby landmark"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <User size={20} className="text-white" />
              </div>
              Contact Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company/Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name or company name"
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{charCounts.name}/30</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-700 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    pattern="[0-9]{10}"
                    className="flex-1 px-4 py-3 rounded-r-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-2 focus:ring-purple-500/20"
              >
                Post Job Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostForm;