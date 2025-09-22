"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import api from '../../../../../config/api';
import { ArrowLeft, Upload, Camera, MapPin, User, Phone, Mail, DollarSign, Calendar, FileText } from 'lucide-react';
import { Select } from 'antd';
import { clearSelectedJob } from '../../../../../redux/slices/jobSlice';
const { Option } = Select;

const EditJobPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get job ID and data from Redux state
  const { selectedJobId, selectedJobData } = useSelector((state) => state.job);
  const jobId = selectedJobId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

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

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [charCounts, setCharCounts] = useState({
    title: 0,
    description: 0,
    name: 0
  });
  const [hideContact, setHideContact] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalCategoryId, setOriginalCategoryId] = useState('');
  const [originalSubcategoryId, setOriginalSubcategoryId] = useState('');
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Function to clean image URLs (split on -- and take first part)
  const cleanImageUrl = (url) => {
    if (!url) return null;
    if (url.includes('--')) {
      url = url.split('--')[0];
    }
    if (url.startsWith('http')) {
      return url;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://test.hyrelancer.in';
    return `${baseUrl}/${url}`;
  };

  // Redirect if no job ID is available
  useEffect(() => {
    if (!jobId) {
      router.push('/customer-dashboard/job-list');
      return;
    }
  }, [jobId, router]);

  // Fetch job data - using the same approach as EditJobDetails
  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        console.log('Fetching job data for ID:', jobId);
        
        // Fetch site data, jobs, languages, and cities in parallel
        const [siteDataRes, jobsRes, languagesRes, citiesRes] = await Promise.all([
          api.get('/getSiteData'),
          api.get('/getJob'),
          api.get('/getLanglist'),
          api.get('/getStatelist')
        ]);

        const siteData = siteDataRes?.data || {};
        const scList = Array.isArray(siteData.sc_list) ? siteData.sc_list : [];
        const seList = Array.isArray(siteData.se_list) ? siteData.se_list : [];

        // Build lookup maps
        const categoryIdToName = {};
        const subCategoryIdToName = {};
        scList.forEach((sc) => {
          if (sc?.get_ca_data?.ca_id != null && sc?.get_ca_data?.ca_name) {
            categoryIdToName[sc.get_ca_data.ca_id] = sc.get_ca_data.ca_name;
          }
          if (sc?.sc_id != null && sc?.sc_name) {
            subCategoryIdToName[sc.sc_id] = sc.sc_name;
          }
        });

        const serviceIdToName = {};
        seList.forEach((se) => {
          if (se?.se_id != null && se?.se_name) {
            serviceIdToName[se.se_id] = se.se_name;
          }
        });

        // Process languages data
        if (languagesRes.data && languagesRes.data.la_list) {
          const formattedLanguages = languagesRes.data.la_list.map((lang) => ({
            id: lang.la_id,
            value: lang.la_language.toLowerCase(),
            label: lang.la_language,
          }));
          setLanguages(formattedLanguages);
        }

        // Process cities data
        if (citiesRes.data && citiesRes.data.city) {
          const formattedCities = citiesRes.data.city.map((city) => ({
            id: city.cit_id,
            value: city.cit_name.toLowerCase(),
            label: city.cit_name,
          }));
          setCities(formattedCities);
        }

        const raw = jobsRes?.data;
        console.log('getJob raw response:', raw);
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.jobs)
              ? raw.jobs
              : Array.isArray(raw?.job_list)
                ? raw.job_list
                : raw?.job_list
                  ? [raw.job_list]
                  : [];

        // Find the specific job
        const jobData = list.find(job => job.cuj_id == jobId);
        console.log('Found job data:', jobData);
        
        if (jobData) {
          // Get category and subcategory names from lookup maps
          const categoryId = jobData.cuj_sc_id || jobData.category;
          const subcategoryId = jobData.cuj_se_id || jobData.service;
          
          const categoryName = subCategoryIdToName[categoryId] || jobData.subcategory_name || jobData.sc_name || '—';
          const subcategoryName = serviceIdToName[subcategoryId] || jobData.service_name || jobData.service || jobData.job_type || '—';
          
          // Store original IDs for form submission
          setOriginalCategoryId(categoryId || '');
          setOriginalSubcategoryId(subcategoryId || '');
          
          // Map job data to form structure (same as EditJobDetails)
          setFormData({
            category: categoryName,
            subcategory: subcategoryName,
            year: jobData.cuj_location || '',
            location: jobData.cuj_location || jobData.location || '',
            experience: jobData.cuj_u_experience || jobData.u_experience || '',
            title: jobData.cuj_title || jobData.title || '',
            description: jobData.cuj_desc || jobData.desc || '',
            workMode: jobData.cuj_work_mode || jobData.work_mode || '',
            language: jobData.cuj_lang || jobData.language || '',
            budgetFrom: String(jobData.cuj_salary_range_from || jobData.salary_range_from || ''),
            budgetTo: String(jobData.cuj_salary_range_to || jobData.salary_range_to || ''),
            state: '',
            city: '',
            district: '',
            landmark: '',
            name: jobData.cuj_contact_name || jobData.contact_name || '',
            phone: jobData.cuj_contact_mobile || jobData.contact_mobile || '',
            email: jobData.cuj_contact_email || jobData.contact_email || ''
          });

          setHideContact(jobData.hide_contact === '1' || jobData.hide_contact === 1);

          // Set existing images with cleaned URLs
          const images = [];
          if (jobData.cuj_img1) images.push({ id: 1, url: cleanImageUrl(jobData.cuj_img1), file: null, isExisting: true });
          if (jobData.cuj_img2) images.push({ id: 2, url: cleanImageUrl(jobData.cuj_img2), file: null, isExisting: true });
          if (jobData.cuj_img3) images.push({ id: 3, url: cleanImageUrl(jobData.cuj_img3), file: null, isExisting: true });
          setExistingImages(images);
          setNewImages([]);

          // Update character counts
          setCharCounts({
            title: (jobData.cuj_title || jobData.title || '').length,
            description: (jobData.cuj_desc || jobData.desc || '').length,
            name: (jobData.cuj_contact_name || jobData.contact_name || '').length
          });
        } else {
          console.log('Job not found for ID:', jobId);
          setError("Job not found");
        }
      } catch (err) {
        console.error("Error fetching job data:", err);
        setError(`Failed to load job data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

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
    } else if (formData.title.length < 5) {
      newErrors.title = 'Job title must be at least 5 characters';
    }

    if (!formData.workMode) {
      newErrors.workMode = 'Work mode is required';
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const totalImages = existingImages.length + newImages.length;
    const availableSlots = 3 - totalImages;
    
    if (availableSlots <= 0) {
      alert('Maximum 3 images allowed');
      return;
    }
    
    const filesToAdd = files.slice(0, availableSlots);
    const newPhotos = filesToAdd.map((file, index) => ({
      id: Date.now() + index,
      file,
      url: URL.createObjectURL(file),
      isExisting: false
    }));
    setNewImages(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter(photo => photo.id !== id));
    } else {
      setNewImages(prev => prev.filter(photo => photo.id !== id));
    }
  };

  const handleSubmit = async (e) => {
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

    setSaving(true);
    setError(null);

    try {
      // Prepare multipart payload including cuj_img1..3
      const payload = new FormData();
      
      // Add all form fields
      payload.append('year', formData.location);
      payload.append('experience', formData.experience);
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('workMode', formData.workMode);
      payload.append('language', formData.language || '');
      payload.append('budgetFrom', formData.budgetFrom);
      payload.append('budgetTo', formData.budgetTo);
      payload.append('state', formData.state);
      payload.append('city', formData.city);
      payload.append('district', formData.district);
      payload.append('landmark', formData.landmark);
      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('email', formData.email);
      payload.append('hide_contact', hideContact ? '1' : '0');

      // Add plain field names for backend validation
      payload.append('desc', formData.description || '');
      payload.append('work_mode', formData.workMode || '');
      payload.append('job_type', 'Full-Time');
      payload.append('language', formData.language || '');
      payload.append('salary_range_from', formData.budgetFrom);
      payload.append('salary_range_to', formData.budgetTo);
      payload.append('location', formData.location);
      payload.append('contact_name', hideContact ? '' : (formData.name || ''));
      payload.append('contact_email', hideContact ? '' : (formData.email || ''));
      payload.append('contact_mobile', hideContact ? '' : (formData.phone || ''));

      // Add new uploaded photos
      newImages.forEach((photo, index) => {
        if (photo.file) {
          payload.append(`cuj_img${index + 1}`, photo.file);
          payload.append(`uploadfile${index + 1}`, photo.file);
        }
      });

      // Add cuj_* fields
      payload.append('cuj_id', jobId);
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const user = stored ? JSON.parse(stored) : null;
        const userId = user?.id || user?.u_id || null;
        if (userId) payload.append('cuj_u_id', String(userId));
      } catch {}
      payload.append('cuj_ca_id', '1');
      
      // Use the stored original IDs
      payload.append('cuj_sc_id', originalCategoryId);
      payload.append('cuj_se_id', originalSubcategoryId);
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

      const response = await api.post('/updatejOB', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        setSuccess('Job updated successfully!');
        dispatch(clearSelectedJob());
        setTimeout(() => {
          router.push('/customer-dashboard/job-list');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating job:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError('Failed to update job. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div
        className="relative h-64 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url('/images/breadcrumb_service.webp')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Edit Your Job</h1>
            <div className="flex items-center justify-center gap-2 text-lg">
              <span className="opacity-80">Update your job posting</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => {
              dispatch(clearSelectedJob());
              router.push('/customer-dashboard/job-list');
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Job List</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

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
                <Select
                  mode="multiple"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const optionChildren = (option?.children || "").toString();
                    const optionValue = (option?.value || "").toString();
                    return (
                      optionChildren.toLowerCase().includes(input.toLowerCase()) ||
                      optionValue.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                  placeholder={
                    languagesLoading
                      ? "Loading languages..."
                      : "Select languages you prefer"
                  }
                  size="large"
                  loading={languagesLoading}
                  disabled={languagesLoading}
                  notFoundContent={
                    languagesLoading ? (
                      "Loading..."
                    ) : (
                      "No languages found"
                    )
                  }
                  value={formData.language ? formData.language.split(',').filter(Boolean) : []}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, language: value.join(',') }));
                  }}
                  className="w-full"
                  style={{ minHeight: '48px' }}
                >
                  {languages.map((lang) => (
                    <Option key={lang.id} value={lang.value}>
                      {lang.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Experience & Location (below Work Mode) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Experience Required <span className="text-red-500">*</span>
                </label>
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const optionChildren = (option?.children || "").toString();
                    const optionValue = (option?.value || "").toString();
                    return (
                      optionChildren.toLowerCase().includes(input.toLowerCase()) ||
                      optionValue.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                  placeholder="Select experience level (e.g., 2 to 5 year)"
                  size="large"
                  value={formData.experience || undefined}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, experience: value || '' }));
                  }}
                  className="w-full"
                  style={{ minHeight: '48px' }}
                >
                  <Option value="0 to 1 year">0 to 1 year</Option>
                  <Option value="1 to 2 year">1 to 2 year</Option>
                  <Option value="2 to 5 year">2 to 5 year</Option>
                  <Option value="5 to 10 year">5 to 10 year</Option>
                  <Option value="10+ years">10+ years</Option>
                </Select>
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location {formData.workMode !== 'Remote' && <span className="text-red-500">*</span>}
                </label>
                <Select
                  mode="multiple"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const optionChildren = (option?.children || "").toString();
                    const optionValue = (option?.value || "").toString();
                    return (
                      optionChildren.toLowerCase().includes(input.toLowerCase()) ||
                      optionValue.toLowerCase().includes(input.toLowerCase())
                    );
                  }}
                  placeholder={
                    formData.workMode === 'Remote' 
                      ? "Not required for Remote" 
                      : citiesLoading 
                        ? "Loading cities..." 
                        : "Select cities (e.g., Mumbai, Delhi)"
                  }
                  size="large"
                  value={formData.location ? formData.location.split(',').filter(Boolean) : []}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, location: value.join(',') }));
                  }}
                  className="w-full"
                  style={{ minHeight: '48px' }}
                  disabled={formData.workMode === 'Remote' || citiesLoading}
                  notFoundContent={
                    citiesLoading ? (
                      "Loading..."
                    ) : (
                      "No cities found"
                    )
                  }
                >
                  {cities.map((city) => (
                    <Option key={city.id} value={city.value}>
                      {city.label}
                    </Option>
                  ))}
                </Select>
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
              Job Photos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Display existing images */}
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={`Job image ${image.id}`}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(image.id, true)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Display new images */}
              {newImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={`New image ${image.id}`}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-green-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(image.id, false)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Upload slot - only show if less than 3 images */}
              {(existingImages.length + newImages.length) < 3 && (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 transition-colors">
                    <Upload size={24} className="text-blue-500 mb-2" />
                    <span className="text-xs text-blue-600 font-medium">Add Photo</span>
                  </div>
                </div>
              )}
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
              disabled={saving}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;
