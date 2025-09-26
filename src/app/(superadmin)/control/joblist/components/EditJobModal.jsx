"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload, MapPin, Tag, Briefcase, DollarSign, User, Mail, Phone, Globe, Clock, Check, ChevronDown } from 'lucide-react';

const EditJobModal = ({ isOpen, onClose, jobData, onSave }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        categories: [],
        services: [],
        languages: [],
    });
    const [selectedImages, setSelectedImages] = useState({
        uploadfile1: null,
        uploadfile2: null,
        uploadfile3: null
    });
    const [errors, setErrors] = useState({});
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef(null);

    // Initialize form data when modal opens
    useEffect(() => {
        if (isOpen && jobData) {
            const job = jobData.job_data;
            setFormData({
                cuj_id: job.cuj_id,
                cuj_sc_id: job.job_category?.sc_id || '',
                cuj_se_id: job.job_service?.se_id || '',
                cuj_title: job.cuj_title || '',
                cuj_desc: job.cuj_desc || '',
                cuj_u_experience: job.cuj_u_experience || '',
                cuj_location: job.cuj_location || '',
                cuj_work_mode: job.cuj_work_mode || '',
                cuj_salary_range_from: job.cuj_salary_range_from || '',
                cuj_salary_range_to: job.cuj_salary_range_to || '',
                cuj_contact_name: job.customer?.name || '',
                cuj_contact_email: job.customer?.email || '',
                cuj_contact_mobile: job.customer?.mobile || '',
                uploadfile1: job.cuj_img1 || '',
                uploadfile2: job.cuj_img2 || '',
                uploadfile3: job.cuj_img3 || ''
            });
            // Set selected languages from comma-separated string
            setSelectedLanguages(job.cuj_lang ? job.cuj_lang.split(',').filter(lang => lang.trim() !== '') : []);
            fetchDropdownData();
        }
    }, [isOpen, jobData]);

    // Close language dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [categoriesRes, languagesRes] = await Promise.all([
                fetch('https://test.hyrelancer.in/api/getCategorylist'),
                fetch('https://test.hyrelancer.in/api/getLanglist'),
            ]);

            const [categoriesData, languagesData] = await Promise.all([
                categoriesRes.json(),
                languagesRes.json(),
            ]);

            setDropdownData({
                categories: categoriesData.sc_list || [],
                services: categoriesData.se_list || [],
                languages: languagesData.la_list || [],
            });
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, selectionStart } = e.target;

        // update state
        setFormData(prev => ({ ...prev, [name]: value }));

        // clear error for this field
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

        // restore caret position after the state update -> avoids caret loss when input rerenders
        // requestAnimationFrame is used to run after render
        requestAnimationFrame(() => {
            const el = document.querySelector(`[name="${name}"]`);
            if (el && typeof selectionStart === 'number') {
                try {
                    el.focus();
                    el.setSelectionRange(selectionStart, selectionStart);
                } catch (err) {
                    // ignore if browser doesn't support setSelectionRange for this element type
                }
            }
        });
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setFormData(prev => ({ ...prev, cuj_sc_id: categoryId, cuj_se_id: '' }));
    };

    const handleImageChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImages(prev => ({ ...prev, [fieldName]: file }));
            const reader = new FileReader();
            reader.onload = (e) => setFormData(prev => ({ ...prev, [fieldName]: e.target.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleLanguageSelect = (language) => {
        if (!selectedLanguages.includes(language)) {
            setSelectedLanguages([...selectedLanguages, language]);
        } else {
            setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.cuj_title?.trim()) newErrors.cuj_title = 'Title is required';
        if (!formData.cuj_desc?.trim()) newErrors.cuj_desc = 'Description is required';
        if (!formData.cuj_sc_id) newErrors.cuj_sc_id = 'Category is required';
        if (!formData.cuj_se_id) newErrors.cuj_se_id = 'Service is required';
        if (!formData.cuj_contact_name?.trim()) newErrors.cuj_contact_name = 'Contact name is required';
        if (!formData.cuj_contact_email?.trim()) newErrors.cuj_contact_email = 'Contact email is required';
        if (formData.cuj_contact_email && !/\S+@\S+\.\S+/.test(formData.cuj_contact_email)) newErrors.cuj_contact_email = 'Invalid email format';
        if (!formData.cuj_contact_mobile?.trim()) newErrors.cuj_contact_mobile = 'Contact mobile is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // REPLACE your handleSubmit with this
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setLoading(true);

  try {
    const formDataToSend = new FormData();

    // Explicitly add required IDs first so backend always receives them
    formDataToSend.append('cuj_id', String(formData.cuj_id ?? ''));
    formDataToSend.append('cuj_sc_id', String(formData.cuj_sc_id ?? ''));
    formDataToSend.append('cuj_se_id', String(formData.cuj_se_id ?? ''));

    // Append other textual fields (only those you expect)
    const textFields = [
      'cuj_title','cuj_desc','cuj_u_experience','cuj_location','cuj_work_mode',
      'cuj_salary_range_from','cuj_salary_range_to',
      'cuj_contact_name','cuj_contact_email','cuj_contact_mobile'
    ];
    textFields.forEach(k => {
      // ensure undefined stays undefined, but append empty string if truly empty
      formDataToSend.append(k, formData[k] != null ? String(formData[k]) : '');
    });

    // Append languages as a CSV
    formDataToSend.append('cuj_lang', selectedLanguages.join(','));

    // Append images (either file objects or existing path strings)
    ['uploadfile1', 'uploadfile2', 'uploadfile3'].forEach(fieldName => {
      if (selectedImages[fieldName]) {
        formDataToSend.append(fieldName, selectedImages[fieldName]);
      } else if (formData[fieldName] && typeof formData[fieldName] === 'string') {
        formDataToSend.append(fieldName, formData[fieldName]);
      } else {
        // ensure backend receives something (optional)
        formDataToSend.append(fieldName, '');
      }
    });

    // Debugging: log the FormData entries (non-sensitive)
    // NOTE: FormData entries with files won't print content, but keys & filenames show
    for (const pair of formDataToSend.entries()) {
      console.log('formData:', pair[0], pair[1]);
    }

    // token fallback: try both keys used in your app
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

    const response = await fetch('https://test.hyrelancer.in/api/admin/updateJobByAdmin', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }, // DO NOT set Content-Type
      body: formDataToSend
    });

    const result = await response.json();

    if (response.ok) {
      // If backend returns updated job -> parent can patch; else fallback to refresh in parent
      onSave?.(result);

      // If backend doesn't include updated job object, call a fallback handler if provided:
      if (!result?.job_data && typeof onSave === 'function') {
        // parent can decide to run fetchJobs(); this is a signal it must refresh
        // you may call onSave({ needsRefresh: true }) instead — parent should handle this.
        onSave({ needsRefresh: true });
      }

      onClose();
    } else {
      setErrors({ submit: result.message || 'Update failed' });
    }
  } catch (error) {
    console.error('Error updating job:', error);
    setErrors({ submit: 'Network error. Please try again.' });
  } finally {
    setLoading(false);
  }
};


    if (!isOpen || !jobData) return null;

    const getFilteredServices = () => dropdownData.services.filter(service => service.se_sc_id == formData.cuj_sc_id);
    const workModeOptions = ['Remote', 'On-site', 'Hybrid'];

    // A small component for styled input fields with icons
    const InputField = ({ icon, children }) => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                {icon}
            </div>
            {children}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Job Posting</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" disabled={loading}>
                        <X size={22} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-8" style={{ scrollbarWidth: 'thin' }}>
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm font-medium">{errors.submit}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="p-5 border border-gray-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Job Details</h3>

                                <div className="space-y-4">
                                    <InputField icon={<Briefcase size={16} />}>
                                        <input type="text" name="cuj_title" value={formData.cuj_title || ''} onChange={handleInputChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuj_title ? 'border-red-400' : 'border-gray-300'}`} placeholder="Job Title *" />
                                    </InputField>
                                    {errors.cuj_title && <p className="text-red-500 text-xs mt-1">{errors.cuj_title}</p>}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputField icon={<Tag size={16} />}>
                                                <select name="cuj_sc_id" value={formData.cuj_sc_id || ''} onChange={handleCategoryChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuj_sc_id ? 'border-red-400' : 'border-gray-300'}`}>
                                                    <option value="">Category *</option>
                                                    {dropdownData.categories.map(cat => <option key={cat.sc_id} value={cat.sc_id}>{cat.sc_name}</option>)}
                                                </select>
                                            </InputField>
                                            {errors.cuj_sc_id && <p className="text-red-500 text-xs mt-1">{errors.cuj_sc_id}</p>}
                                        </div>
                                        <div>
                                            <InputField icon={<Tag size={16} />}>
                                                <select name="cuj_se_id" value={formData.cuj_se_id || ''} onChange={handleInputChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuj_se_id ? 'border-red-400' : 'border-gray-300'}`} disabled={!formData.cuj_sc_id}>
                                                    <option value="">Service *</option>
                                                    {getFilteredServices().map(srv => <option key={srv.se_id} value={srv.se_id}>{srv.se_name}</option>)}
                                                </select>
                                            </InputField>
                                            {errors.cuj_se_id && <p className="text-red-500 text-xs mt-1">{errors.cuj_se_id}</p>}
                                        </div>
                                    </div>

                                    <InputField icon={<Globe size={16} />}>
                                        <select name="cuj_work_mode" value={formData.cuj_work_mode || ''} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Work Mode</option>
                                            {workModeOptions.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                                        </select>
                                    </InputField>

                                    {/* ====== MODIFIED PART START ====== */}
                                    <InputField icon={<Clock size={16} />}>
                                        <select
                                            name="cuj_u_experience"
                                            value={formData.cuj_u_experience || ''}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Experience Required</option>
                                            <option value="0 to 1 year">0 to 1 year</option>
                                            <option value="1 to 2 year">1 to 2 year</option>
                                            <option value="2 to 5 year">2 to 5 year</option>
                                            <option value="5 to 10 year">5 to 10 year</option>
                                            <option value="10+ years">10+ years</option>
                                        </select>
                                    </InputField>
                                    {/* ====== MODIFIED PART END ====== */}

                                    <InputField icon={<MapPin size={16} />}>
                                        <input type="text" name="cuj_location" value={formData.cuj_location || ''} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Job location" />
                                    </InputField>
                                </div>
                            </div>

                            <div className="p-5 border border-gray-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Salary Range (₹)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField icon={<DollarSign size={16} />}>
                                        <input type="number" name="cuj_salary_range_from" value={formData.cuj_salary_range_from || ''} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="From" />
                                    </InputField>
                                    <InputField icon={<DollarSign size={16} />}>
                                        <input type="number" name="cuj_salary_range_to" value={formData.cuj_salary_range_to || ''} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" placeholder="To" />
                                    </InputField>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="p-5 border border-gray-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Description & Requirements</h3>
                                <div className="space-y-4">
                                    <div>
                                        <textarea name="cuj_desc" value={formData.cuj_desc || ''} onChange={handleInputChange} rows={6} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuj_desc ? 'border-red-400' : 'border-gray-300'}`} placeholder="Detailed job description... *" />
                                        {errors.cuj_desc && <p className="text-red-500 text-xs mt-1">{errors.cuj_desc}</p>}
                                    </div>
                                    <div ref={langDropdownRef} className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                                        <div onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="w-full p-2 border border-gray-300 rounded-lg flex flex-wrap gap-2 items-center cursor-pointer min-h-[42px]">
                                            {selectedLanguages.length > 0 ? (
                                                selectedLanguages.map(lang => (
                                                    <span key={lang} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                                                        {lang}
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleLanguageSelect(lang); }} className="text-blue-600 hover:text-blue-800"><X size={12} /></button>
                                                    </span>
                                                ))
                                            ) : <span className="text-gray-400 px-1">Select languages...</span>}
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                        {isLangDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {dropdownData.languages.map(lang => (
                                                    <div key={lang.la_id} onClick={() => handleLanguageSelect(lang.la_language)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between">
                                                        {lang.la_language}
                                                        {selectedLanguages.includes(lang.la_language) && <Check size={16} className="text-blue-600" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border border-gray-200 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Person</h3>
                                <div className="space-y-4">
                                    <InputField icon={<User size={16} />}>
                                        <input type="text" name="cuj_contact_name" value={formData.cuj_contact_name || ''} onChange={handleInputChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuj_contact_name ? 'border-red-400' : 'border-gray-300'}`} placeholder="Contact Name *" />
                                    </InputField>
                                    {errors.cuj_contact_name && <p className="text-red-500 text-xs mt-1">{errors.cuj_contact_name}</p>}

                                    <InputField icon={<Mail size={16} />}>
                                        <input type="email" name="cuj_contact_email" value={formData.cuj_contact_email || ''} onChange={handleInputChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuj_contact_email ? 'border-red-400' : 'border-gray-300'}`} placeholder="Contact Email *" />
                                    </InputField>
                                    {errors.cuj_contact_email && <p className="text-red-500 text-xs mt-1">{errors.cuj_contact_email}</p>}

                                    <InputField icon={<Phone size={16} />}>
                                        <input type="tel" name="cuj_contact_mobile" value={formData.cuj_contact_mobile || ''} onChange={handleInputChange} className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cuj_contact_mobile ? 'border-red-400' : 'border-gray-300'}`} placeholder="Contact Mobile *" />
                                    </InputField>
                                    {errors.cuj_contact_mobile && <p className="text-red-500 text-xs mt-1">{errors.cuj_contact_mobile}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Job Images</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['uploadfile1', 'uploadfile2', 'uploadfile3'].map((fieldName, index) => (
                                <div key={fieldName} className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center flex flex-col justify-center items-center h-40">
                                    {formData[fieldName] ? (
                                        <div className="relative w-full h-full">
                                            <img src={typeof formData[fieldName] === 'string' && formData[fieldName].startsWith('data:') ? formData[fieldName] : `https://test.hyrelancer.in/${formData[fieldName].split('--')[0]}`} alt={`Preview`} className="w-full h-full object-cover rounded-md" />
                                            <button type="button" onClick={() => { setFormData(prev => ({ ...prev, [fieldName]: '' })); setSelectedImages(prev => ({ ...prev, [fieldName]: null })); }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 text-gray-500">
                                            <Upload size={24} />
                                            <span className="text-xs font-medium">Upload Image {index + 1}</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, fieldName)} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 p-5 bg-gray-50 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold" disabled={loading}>
                        Cancel
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold">
                        {loading ? (<><Loader2 size={18} className="animate-spin" /><span>Updating...</span></>) : (<><Save size={18} /><span>Update Job</span></>)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditJobModal;