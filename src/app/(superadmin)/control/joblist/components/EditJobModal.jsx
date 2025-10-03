"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload, MapPin, Tag, Briefcase, DollarSign, User, Mail, Phone, Globe, Clock, Check, ChevronDown, Search } from 'lucide-react';
import adminApi from '@/config/adminApi';
import api from '@/config/api';

const EditJobModal = ({ isOpen, onClose, jobData, onSave }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        categories: [],
        services: [],
        languages: [],
        cities: [],
    });
    const [selectedImages, setSelectedImages] = useState({
        uploadfile1: null,
        uploadfile2: null,
        uploadfile3: null
    });
    const [errors, setErrors] = useState({});
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedCities, setSelectedCities] = useState([]);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const langDropdownRef = useRef(null);
    const cityDropdownRef = useRef(null);

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
            // Set selected cities from comma-separated string
            setSelectedCities(job.cuj_location ? job.cuj_location.split(',').filter(city => city.trim() !== '') : []);
            fetchDropdownData();
        }
    }, [isOpen, jobData]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
                setIsCityDropdownOpen(false);
                setCitySearchTerm('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [categoriesRes, languagesRes, citiesRes] = await Promise.all([
                api.get('/getCategorylist'),
                api.get('/getLanglist'),
                api.get('/getStatelist'),
            ]);

            setDropdownData({
                categories: categoriesRes.data.sc_list || [],
                services: categoriesRes.data.se_list || [],
                languages: languagesRes.data.la_list || [],
                cities: citiesRes.data.city || [],
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

    const handleCitySelect = (cityName) => {
        if (!selectedCities.includes(cityName)) {
            setSelectedCities([...selectedCities, cityName]);
        } else {
            setSelectedCities(selectedCities.filter(city => city !== cityName));
        }
        setCitySearchTerm('');
    };

    const getFilteredCities = () => {
        if (!citySearchTerm) return dropdownData.cities;
        return dropdownData.cities.filter(city => 
            city.cit_name.toLowerCase().includes(citySearchTerm.toLowerCase())
        );
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Explicitly add required IDs first
            formDataToSend.append('cuj_id', String(formData.cuj_id ?? ''));
            formDataToSend.append('cuj_sc_id', String(formData.cuj_sc_id ?? ''));
            formDataToSend.append('cuj_se_id', String(formData.cuj_se_id ?? ''));

            // Append other textual fields
            const textFields = [
                'cuj_title','cuj_desc','cuj_u_experience','cuj_work_mode',
                'cuj_salary_range_from','cuj_salary_range_to',
                'cuj_contact_name','cuj_contact_email','cuj_contact_mobile'
            ];
            textFields.forEach(k => {
                formDataToSend.append(k, formData[k] != null ? String(formData[k]) : '');
            });

            // Append languages as a CSV
            formDataToSend.append('cuj_lang', selectedLanguages.join(','));
            
            // Append cities as a CSV for location
            formDataToSend.append('cuj_location', selectedCities.join(','));

            // Append images
            ['uploadfile1', 'uploadfile2', 'uploadfile3'].forEach(fieldName => {
                if (selectedImages[fieldName]) {
                    formDataToSend.append(fieldName, selectedImages[fieldName]);
                } else if (formData[fieldName] && typeof formData[fieldName] === 'string') {
                    formDataToSend.append(fieldName, formData[fieldName]);
                } else {
                    formDataToSend.append(fieldName, '');
                }
            });

            const response = await adminApi.post('/updateJobByAdmin', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const result = response.data;

            onSave?.(result);
            if (!result?.job_data && typeof onSave === 'function') {
                onSave({ needsRefresh: true });
            }
            onClose();
        } catch (error) {
            console.error('Error updating job:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Network error. Please try again.';
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !jobData) return null;

    const getFilteredServices = () => dropdownData.services.filter(service => service.se_sc_id == formData.cuj_sc_id);
    const workModeOptions = ['Remote', 'On-site', 'Hybrid'];

    const InputField = ({ icon, children, className = "" }) => (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                {icon}
            </div>
            {children}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Edit Job Posting</h2>
                        <p className="text-sm text-slate-500 mt-1">Update job details and requirements</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200" 
                        disabled={loading}
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto px-8 py-6" style={{ scrollbarWidth: 'thin' }}>
                    {errors.submit && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-700 text-sm font-medium">{errors.submit}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-8">
                            {/* Job Details */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                    <Briefcase size={20} className="text-blue-600" />
                                    Job Details
                                </h3>

                                <div className="space-y-5">
                                    <div>
                                        <InputField icon={<Briefcase size={18} />}>
                                            <input 
                                                type="text" 
                                                name="cuj_title" 
                                                value={formData.cuj_title || ''} 
                                                onChange={handleInputChange} 
                                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.cuj_title ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`} 
                                                placeholder="Job Title *" 
                                            />
                                        </InputField>
                                        {errors.cuj_title && <p className="text-red-500 text-xs mt-2 ml-1">{errors.cuj_title}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputField icon={<Tag size={18} />}>
                                                <select 
                                                    name="cuj_sc_id" 
                                                    value={formData.cuj_sc_id || ''} 
                                                    onChange={handleCategoryChange} 
                                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.cuj_sc_id ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
                                                >
                                                    <option value="">Select Category *</option>
                                                    {dropdownData.categories.map(cat => 
                                                        <option key={cat.sc_id} value={cat.sc_id}>{cat.sc_name}</option>
                                                    )}
                                                </select>
                                            </InputField>
                                            {errors.cuj_sc_id && <p className="text-red-500 text-xs mt-2 ml-1">{errors.cuj_sc_id}</p>}
                                        </div>
                                        <div>
                                            <InputField icon={<Tag size={18} />}>
                                                <select 
                                                    name="cuj_se_id" 
                                                    value={formData.cuj_se_id || ''} 
                                                    onChange={handleInputChange} 
                                                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.cuj_se_id ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`} 
                                                    disabled={!formData.cuj_sc_id}
                                                >
                                                    <option value="">Select Service *</option>
                                                    {getFilteredServices().map(srv => 
                                                        <option key={srv.se_id} value={srv.se_id}>{srv.se_name}</option>
                                                    )}
                                                </select>
                                            </InputField>
                                            {errors.cuj_se_id && <p className="text-red-500 text-xs mt-2 ml-1">{errors.cuj_se_id}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField icon={<Globe size={18} />}>
                                            <select 
                                                name="cuj_work_mode" 
                                                value={formData.cuj_work_mode || ''} 
                                                onChange={handleInputChange} 
                                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                                            >
                                                <option value="">Work Mode</option>
                                                {workModeOptions.map(mode => 
                                                    <option key={mode} value={mode}>{mode}</option>
                                                )}
                                            </select>
                                        </InputField>

                                        <InputField icon={<Clock size={18} />}>
                                            <select
                                                name="cuj_u_experience"
                                                value={formData.cuj_u_experience || ''}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                                            >
                                                <option value="">Experience</option>
                                                <option value="0 to 1 year">0 to 1 year</option>
                                                <option value="1 to 2 year">1 to 2 year</option>
                                                <option value="2 to 5 year">2 to 5 year</option>
                                                <option value="5 to 10 year">5 to 10 year</option>
                                                <option value="10+ years">10+ years</option>
                                            </select>
                                        </InputField>
                                    </div>

                                    {/* Multi-select Cities */}
                                    <div ref={cityDropdownRef} className="relative">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Job Locations</label>
                                        <div 
                                            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)} 
                                            className="w-full p-3 border border-slate-200 rounded-xl flex flex-wrap gap-2 items-center cursor-pointer min-h-[48px] bg-white hover:border-slate-300 transition-all"
                                        >
                                            {selectedCities.length > 0 ? (
                                                selectedCities.map(city => (
                                                    <span key={city} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-lg flex items-center gap-2">
                                                        <MapPin size={14} />
                                                        {city}
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setSelectedCities(selectedCities.filter(c => c !== city)); 
                                                            }} 
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    Select job locations...
                                                </span>
                                            )}
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                        {isCityDropdownOpen && (
                                            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg">
                                                <div className="p-3 border-b border-slate-100">
                                                    <div className="relative">
                                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search cities..."
                                                            value={citySearchTerm}
                                                            onChange={(e) => setCitySearchTerm(e.target.value)}
                                                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    {getFilteredCities().map(city => (
                                                        <div 
                                                            key={city.cit_id} 
                                                            onClick={() => handleCitySelect(city.cit_name)} 
                                                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <MapPin size={14} className="text-slate-400" />
                                                                {city.cit_name}
                                                            </span>
                                                            {selectedCities.includes(city.cit_name) && 
                                                                <Check size={16} className="text-blue-600" />
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Salary Range */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                    <DollarSign size={20} className="text-green-600" />
                                    Salary Range (₹)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField icon={<DollarSign size={18} />}>
                                        <input 
                                            type="number" 
                                            name="cuj_salary_range_from" 
                                            value={formData.cuj_salary_range_from || ''} 
                                            onChange={handleInputChange} 
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all" 
                                            placeholder="From" 
                                        />
                                    </InputField>
                                    <InputField icon={<DollarSign size={18} />}>
                                        <input 
                                            type="number" 
                                            name="cuj_salary_range_to" 
                                            value={formData.cuj_salary_range_to || ''} 
                                            onChange={handleInputChange} 
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all" 
                                            placeholder="To" 
                                        />
                                    </InputField>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Description & Languages */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                    <Tag size={20} className="text-purple-600" />
                                    Description & Requirements
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <textarea 
                                            name="cuj_desc" 
                                            value={formData.cuj_desc || ''} 
                                            onChange={handleInputChange} 
                                            rows={6} 
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all ${errors.cuj_desc ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`} 
                                            placeholder="Detailed job description and requirements... *" 
                                        />
                                        {errors.cuj_desc && <p className="text-red-500 text-xs mt-2 ml-1">{errors.cuj_desc}</p>}
                                    </div>

                                    {/* Languages */}
                                    <div ref={langDropdownRef} className="relative">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Required Languages</label>
                                        <div 
                                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} 
                                            className="w-full p-3 border border-slate-200 rounded-xl flex flex-wrap gap-2 items-center cursor-pointer min-h-[48px] bg-white hover:border-slate-300 transition-all"
                                        >
                                            {selectedLanguages.length > 0 ? (
                                                selectedLanguages.map(lang => (
                                                    <span key={lang} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-lg flex items-center gap-2">
                                                        <Globe size={14} />
                                                        {lang}
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                handleLanguageSelect(lang); 
                                                            }} 
                                                            className="text-purple-600 hover:text-purple-800 transition-colors"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 flex items-center gap-2">
                                                    <Globe size={16} />
                                                    Select languages...
                                                </span>
                                            )}
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                        {isLangDropdownOpen && (
                                            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {dropdownData.languages.map(lang => (
                                                    <div 
                                                        key={lang.la_id} 
                                                        onClick={() => handleLanguageSelect(lang.la_language)} 
                                                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Globe size={14} className="text-slate-400" />
                                                            {lang.la_language}
                                                        </span>
                                                        {selectedLanguages.includes(lang.la_language) && 
                                                            <Check size={16} className="text-purple-600" />
                                                        }
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Person */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                    <User size={20} className="text-orange-600" />
                                    Contact Person
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <InputField icon={<User size={18} />}>
                                            <input 
                                                type="text" 
                                                name="cuj_contact_name" 
                                                value={formData.cuj_contact_name || ''} 
                                                onChange={handleInputChange} 
                                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${errors.cuj_contact_name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`} 
                                                placeholder="Contact Name *" 
                                            />
                                        </InputField>
                                        {errors.cuj_contact_name && <p className="text-red-500 text-xs mt-2 ml-1">{errors.cuj_contact_name}</p>}
                                    </div>

                                    <div>
                                        <InputField icon={<Mail size={18} />}>
                                            <input 
                                                type="email" 
                                                name="cuj_contact_email" 
                                                value={formData.cuj_contact_email || ''} 
                                                onChange={handleInputChange} 
                                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${errors.cuj_contact_email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`} 
                                                placeholder="Contact Email *" 
                                            />
                                        </InputField>
                                        {errors.cuj_contact_email && <p className="text-red-500 text-xs mt-2 ml-1">{errors.cuj_contact_email}</p>}
                                    </div>

                                    <div>
                                        <InputField icon={<Phone size={18} />}>
                                            <input 
                                                type="tel" 
                                                name="cuj_contact_mobile" 
                                                value={formData.cuj_contact_mobile || ''} 
                                                onChange={handleInputChange} 
                                                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${errors.cuj_contact_mobile ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`} 
                                                placeholder="Contact Mobile *" 
                                            />
                                        </InputField>
                                        {errors.cuj_contact_mobile && <p className="text-red-500 text-xs mt-2 ml-1">{errors.cuj_contact_mobile}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Images */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mt-8">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <Upload size={20} className="text-indigo-600" />
                            Job Images
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['uploadfile1', 'uploadfile2', 'uploadfile3'].map((fieldName, index) => (
                                <div key={fieldName} className="group relative">
                                    {formData[fieldName] ? (
                                        <div className="relative bg-white border-2 border-slate-200 rounded-xl overflow-hidden h-48">
                                            <img 
                                                src={typeof formData[fieldName] === 'string' && formData[fieldName].startsWith('data:') 
                                                    ? formData[fieldName] 
                                                    : `https://backend.hyrelancer.in/${formData[fieldName].split('--')[0]}`} 
                                                alt={`Preview ${index + 1}`} 
                                                className="w-full h-full object-cover" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                                                <button 
                                                    type="button" 
                                                    onClick={() => { 
                                                        setFormData(prev => ({ ...prev, [fieldName]: '' })); 
                                                        setSelectedImages(prev => ({ ...prev, [fieldName]: null })); 
                                                    }} 
                                                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 transform hover:scale-105"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="block cursor-pointer">
                                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center h-48 flex flex-col justify-center items-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 group">
                                                <div className="bg-indigo-100 rounded-full p-3 mb-3 group-hover:bg-indigo-200 transition-colors">
                                                    <Upload size={24} className="text-indigo-600" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                                                    Upload Image {index + 1}
                                                </span>
                                                <span className="text-xs text-slate-400 mt-1">
                                                    PNG, JPG, GIF up to 10MB
                                                </span>
                                            </div>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => handleImageChange(e, fieldName)} 
                                                className="hidden" 
                                            />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium" 
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSubmit} 
                        disabled={loading} 
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Update Job</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditJobModal;