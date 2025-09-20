"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api from '../../../../../config/api';
import breadcrumb from '../../../../../../public/images/breadcrumb_service.webp';
import { ArrowLeft, Upload, Camera, MapPin, User, Phone, Mail, DollarSign, Calendar, FileText } from 'lucide-react';

const JobPostForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    year: '',
    location: '',
    experience: '',
    title: '',
    description: '',
    workMode: '',
    language: '',
    budgetFrom: '',
    budgetTo: '',
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
  const [hideContact, setHideContact] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Technology', 'Design', 'Business', 'Marketing', 'Sales', 
    'Engineering', 'Healthcare', 'Education', 'Finance'
  ];

  const subcategories = {
    Technology: ['Web Development', 'Mobile Apps', 'AI & Machine Learning', 'Cloud Computing', 'Cybersecurity'],
    Design: ['UI/UX Design', 'Graphic Design', 'Branding', 'Web Design', 'Print Design'],
    Business: ['Consulting', 'Management', 'Operations', 'Strategy', 'Analysis']
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.subcategory.trim()) {
      newErrors.subcategory = 'Sub-category is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Job title must be at least 10 characters';
    }

    if (!formData.workMode) {
      newErrors.workMode = 'Work mode is required';
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    } else if (parseInt(formData.experience) < 0) {
      newErrors.experience = 'Experience cannot be negative';
    }

    if (formData.workMode !== 'Remote' && !formData.location.trim()) {
      newErrors.location = 'Location is required for non-remote positions';
    }

    if (!formData.budgetFrom) {
      newErrors.budgetFrom = 'Budget from is required';
    } else if (parseInt(formData.budgetFrom) <= 0) {
      newErrors.budgetFrom = 'Budget must be greater than 0';
    }

    if (!formData.budgetTo) {
      newErrors.budgetTo = 'Budget to is required';
    } else if (parseInt(formData.budgetTo) <= 0) {
      newErrors.budgetTo = 'Budget must be greater than 0';
    } else if (parseInt(formData.budgetTo) <= parseInt(formData.budgetFrom)) {
      newErrors.budgetTo = 'Budget to must be greater than budget from';
    }

    // Contact information validation (only if not hidden)
    if (!hideContact) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Mobile number is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
        newErrors.phone = 'Mobile number must be 10 digits';
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Normalize specific fields
    if (name === 'contact_name') {
      setFormData(prev => ({ ...prev, name: value }));
      return;
    }
    if (name === 'contact_email') {
      setFormData(prev => ({ ...prev, email: value }));
      return;
    }
    if (name === 'contact_mobile') {
      const onlyDigits = value.replace(/[^0-9+]/g, '');
      setFormData(prev => ({ ...prev, phone: onlyDigits }));
      return;
    }
    if (name === 'experience') {
      const onlyDigits = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyDigits }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'workMode') {
      if (value === 'Remote') {
        setFormData(prev => ({ ...prev, location: '' }));
        // Clear location error if switching to remote
        if (errors.location) {
          setErrors(prev => ({ ...prev, location: '' }));
        }
      }
    }
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
    setUploadedPhotos(prev => {
      const remaining = Math.max(0, 3 - prev.length);
      const toAdd = newPhotos.slice(0, remaining);
      return [...prev, ...toAdd];
    });
  };

  const removePhoto = (id) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Prepare multipart payload including cuj_img1..3
    const payload = new FormData();
    // Map: category = subcategory id (sc_id), service = service id (se_id)
    const qpScId = searchParams?.get('category');
    const qpSeId = searchParams?.get('service');
    const scId = (qpScId && /^\d+$/.test(qpScId)) ? qpScId : (formData.category || '');
    const seId = (qpSeId && /^\d+$/.test(qpSeId)) ? qpSeId : (formData.subcategory || '');
    payload.append('category', scId);
    payload.append('service', seId);
    // Keep legacy key for compatibility
    payload.append('subcategory', seId);
    payload.append('year', formData.location);
    // Plain key required by backend controller
    payload.append('location', formData.location || '');
    payload.append('experience', formData.experience);
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('workMode', formData.workMode);
    payload.append('language', formData.language || '');
    // Backend plain field aliases
    payload.append('desc', formData.description || '');
    payload.append('work_mode', formData.workMode || '');
    // Backend sometimes requires job_type even if UI removed
    payload.append('job_type', 'Full-Time');
    payload.append('budgetFrom', formData.budgetFrom);
    payload.append('budgetTo', formData.budgetTo);
    payload.append('salary_range_from', formData.budgetFrom);
    payload.append('salary_range_to', formData.budgetTo);
    payload.append('state', formData.state);
    payload.append('city', formData.city);
    payload.append('district', formData.district);
    payload.append('landmark', formData.landmark);
    payload.append('name', formData.name);
    payload.append('phone', formData.phone);
    payload.append('email', formData.email);
    // Plain contact_* keys required by backend
    payload.append('contact_name', hideContact ? '' : (formData.name || ''));
    payload.append('contact_email', hideContact ? '' : (formData.email || ''));
    payload.append('contact_mobile', hideContact ? '' : (formData.phone || ''));
    payload.append('hide_contact', hideContact ? '1' : '0');

    // Map first 3 photos to keys expected by backend
    if (uploadedPhotos[0]?.file) {
      payload.append('cuj_img1', uploadedPhotos[0].file);
      payload.append('uploadfile1', uploadedPhotos[0].file);
    }
    if (uploadedPhotos[1]?.file) {
      payload.append('cuj_img2', uploadedPhotos[1].file);
      payload.append('uploadfile2', uploadedPhotos[1].file);
    }
    if (uploadedPhotos[2]?.file) {
      payload.append('cuj_img3', uploadedPhotos[2].file);
      payload.append('uploadfile3', uploadedPhotos[2].file);
    }

    // Add cuj_* fields expected by backend
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = stored ? JSON.parse(stored) : null;
      const userId = user?.id || user?.u_id || null;
      const qpCatId = searchParams?.get('category'); // sc_id
      const qpServId = searchParams?.get('service'); // se_id
      if (userId) payload.append('cuj_u_id', String(userId));
      payload.append('cuj_ca_id', '1'); // default category id per schema
      if (qpCatId && /^\d+$/.test(qpCatId)) payload.append('cuj_sc_id', qpCatId);
      if (qpServId && /^\d+$/.test(qpServId)) payload.append('cuj_se_id', qpServId);
      payload.append('cuj_u_experience', formData.experience || '');
      payload.append('cuj_location', formData.location || '');
      payload.append('cuj_title', formData.title || '');
      payload.append('cuj_desc', formData.description || '');
      payload.append('cuj_work_mode', formData.workMode || '');
      payload.append('cuj_job_type', 'Full-Time');
      if (formData.language) payload.append('cuj_lang', formData.language);
      payload.append('cuj_salary_range_from', formData.budgetFrom || '');
      payload.append('cuj_salary_range_to', formData.budgetTo || '');
      payload.append('cuj_contact_name', hideContact ? '' : (formData.name || ''));
      payload.append('cuj_contact_email', hideContact ? '' : (formData.email || ''));
      payload.append('cuj_contact_mobile', hideContact ? '' : (formData.phone || ''));
    } catch {}

    // Submit to API
    api.post('/storeJob', payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((res) => {
        window.alert(res?.data?.message || 'Job submitted successfully');
        try { window.location.href = '/customer-dashboard/job-list'; } catch {}
      })
      .catch((err) => {
        const resp = err?.response?.data;
        const details = resp?.errors ? `\n${Object.entries(resp.errors).map(([k,v]) => `${k}: ${(Array.isArray(v)?v.join(', '):v)}`).join('\n')}` : '';
        const msg = (resp?.message || 'Failed to submit job') + details;
        window.alert(msg);
        console.error('Job submit error', err);
      });
  };

  // Prefill category and service (subcategory) from query params if provided
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams) return;
    const qpCategory = searchParams.get('categoryName') || searchParams.get('category') || '';
    const qpService = searchParams.get('serviceName') || searchParams.get('service') || searchParams.get('subcategory') || '';
    if (qpCategory || qpService) {
      setFormData(prev => ({
        ...prev,
        category: qpCategory || prev.category,
        subcategory: qpService || prev.subcategory,
      }));
    }
  }, [searchParams]);

  // If IDs are passed (e.g., category=sc_id, service=se_id), fetch names from API
  useEffect(() => {
    let isMounted = true;
    const qpCat = searchParams?.get('category');
    const qpServ = searchParams?.get('service');
    const catIsId = qpCat && /^\d+$/.test(qpCat);
    const servIsId = qpServ && /^\d+$/.test(qpServ);
    if (!catIsId && !servIsId) return;
    (async () => {
      try {
        const res = await api.get('/getSiteData');
        const data = res?.data || {};
        const scList = Array.isArray(data.sc_list) ? data.sc_list : [];
        const seList = Array.isArray(data.se_list) ? data.se_list : [];
        const scName = catIsId ? (scList.find(s => String(s.sc_id) === String(qpCat))?.sc_name || '') : (formData.category || '');
        const seName = servIsId ? (seList.find(s => String(s.se_id) === String(qpServ))?.se_name || '') : (formData.subcategory || '');
        if (!isMounted) return;
        setFormData(prev => ({
          ...prev,
          category: scName || prev.category,
          subcategory: seName || prev.subcategory,
        }));
      } catch {}
    })();
    return () => { isMounted = false; };
  }, [searchParams]);

  // Prefill contact info from localStorage user
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);
      const rawPhone =
        user?.mobile ??
        user?.phone ??
        user?.mobile_no ??
        user?.contact_mobile ??
        user?.mobileNumber ??
        user?.phoneNumber ??
        user?.u_mobile ??
        user?.u_phone ?? '';
      const qpPhone = searchParams?.get('phone') || '';
      const normalizedPhone = String(rawPhone || qpPhone || '')
        .toString()
        .trim()
        .replace(/[^0-9+]/g, '');
      setFormData(prev => ({
        ...prev,
        name: prev.name || user?.name || '',
        email: prev.email || user?.email || user?.contact_email || '',
        phone: prev.phone || normalizedPhone
      }));
    } catch {}
  }, [searchParams]);

  // Fallback: fetch from /me if phone still empty
  useEffect(() => {
    if (formData.phone && formData.phone.length > 0) return;
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/me');
        const me = res?.data?.user || res?.data || null;
        if (!me || !mounted) return;
        const rawPhone =
          me?.mobile;
        const normalizedPhone = String(rawPhone || '')
          .toString()
          .trim()
          .replace(/[^0-9+]/g, '');
        setFormData(prev => ({
          ...prev,
          name: prev.name || me?.name || '',
          email: prev.email || me?.email || me?.contact_email || '',
          phone: prev.phone || normalizedPhone
        }));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [formData.phone]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="relative h-64 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url(${breadcrumb.src})`
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
                <input
                  type="text"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  placeholder="Category"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } text-gray-700 cursor-not-allowed`}
                  required
                  disabled
                />
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="service"
                  value={formData.subcategory || ''}
                  onChange={handleInputChange}
                  placeholder="Sub-Category"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.subcategory ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } text-gray-700 cursor-not-allowed`}
                  required
                  disabled
                />
                {errors.subcategory && <p className="text-red-500 text-xs mt-1">{errors.subcategory}</p>}
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
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500">{charCounts.title}/100</div>
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
              </div>
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
                  Work Mode <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'Remote', desc: 'Work from anywhere' },
                    { value: 'On-site', desc: 'Office based' },
                    { value: 'Hybrid', desc: 'Mix of both' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer select-none flex-1 ${
                        formData.workMode === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${errors.workMode ? 'border-red-500' : ''}`}
                    >
                      <input
                        type="radio"
                        name="workMode"
                        value={option.value}
                        checked={formData.workMode === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                        required
                      />
                      <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                        formData.workMode === option.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                        {formData.workMode === option.value && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`font-medium text-sm ${
                          formData.workMode === option.value ? 'text-blue-700' : 'text-gray-700'
                        }`}>{option.value}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.workMode && <p className="text-red-500 text-xs mt-1">{errors.workMode}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                >
                  <option value="">Select language</option>
                  <option value="kannada">kannada</option>
                  <option value="Hindi">Hindi</option>
                  <option value="tamil">Tamil</option>
                  <option value="gujarati">Gujarati</option>
                  <option value="urdu">Urdu</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>

            {/* Experience & Location (below Work Mode) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience Required (Years) <span className="text-red-500">*</span>
                </label>
                      <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g. 2"
                  min="0"
                  step="1"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.experience ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        required
                      />
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                      </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location {formData.workMode !== 'Remote' && <span className="text-red-500">*</span>}
                    </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={formData.workMode === 'Remote' ? 'Not required for Remote' : 'Job location'}
                  disabled={formData.workMode === 'Remote'}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                    formData.workMode === 'Remote'
                      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                      : errors.location 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  required={formData.workMode !== 'Remote'}
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Budget Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <DollarSign size={20} className="text-white" />
              </div>
              Budget Range
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget From <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input
                    type="number"
                    name="budgetFrom"
                    value={formData.budgetFrom}
                    onChange={handleInputChange}
                    placeholder="e.g., 50,000"
                    min="0"
                    step="1000"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                      errors.budgetFrom ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                    } focus:ring-2 focus:ring-green-500/20 transition-all duration-200`}
                  required
                />
            </div>
                {errors.budgetFrom && <p className="text-red-500 text-xs mt-1">{errors.budgetFrom}</p>}
          </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget To <span className="text-red-500">*</span>
                </label>
              <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input
                    type="number"
                    name="budgetTo"
                    value={formData.budgetTo}
                    onChange={handleInputChange}
                    placeholder="e.g., 80,000"
                    min="0"
                    step="1000"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                      errors.budgetTo ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                    } focus:ring-2 focus:ring-green-500/20 transition-all duration-200`}
                    required
                  />
                </div>
                {errors.budgetTo && <p className="text-red-500 text-xs mt-1">{errors.budgetTo}</p>}
              </div>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Camera size={20} className="text-white" />
              </div>
              Upload Company Photos (Up to 3)
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
              {Array.from({ length: 2 }).map((_, index) => (
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
                <h3 className="font-semibold text-gray-700 mb-3">Uploaded Photos ({uploadedPhotos.length}/3)</h3>
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

          {/* Contact Information Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <User size={20} className="text-white" />
              </div>
              Contact Information
            </h2>

            {/* Hide contact info toggle */}
            <label className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                checked={hideContact}
                onChange={(e) => setHideContact(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Hide my contact information on the job post</span>
            </label>

            {!hideContact && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name or company name"
                    maxLength={30}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    } focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200`}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-gray-500">{charCounts.name}/30</div>
                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
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
                      name="contact_mobile"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      pattern="[0-9]{10}"
                      className={`flex-1 px-4 py-3 rounded-r-xl border ${
                        errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200`}
                      required
                    />
              </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email address"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-indigo-500'
                    } focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            )}

              <button
              type="button"
              onClick={handleSubmit}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Job Now
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default JobPostForm;