"use client";
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export default function JobAlertsForm() {
    const [formData, setFormData] = useState({
        alertName: '',
        keyword: '',
        jobRegion: '',
        categories: '',
        tags: 'Landing',
        jobType: 'Fulltime',
        emailFrequency: 'Weekly'
    });

    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRefs = useRef({});

    const tagOptions = ['Landing', 'Featured', 'Remote', 'Contract', 'Internship'];
    const jobTypeOptions = ['Fulltime', 'Part-time', 'Contract', 'Freelance', 'Internship'];
    const frequencyOptions = ['Daily', 'Weekly', 'Monthly'];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedInsideAnyDropdown = Object.values(dropdownRefs.current).some(ref =>
                ref && ref.contains(event.target)
            );

            if (!clickedInsideAnyDropdown) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleDropdown = (dropdown) => {
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const selectOption = (field, value) => {
        handleInputChange(field, value);
        setOpenDropdown(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Handle form submission here
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Jobs Alerts</h1>
                    <button className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Alerts
                    </button>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Alert Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Alert Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Alert Name..."
                                value={formData.alertName}
                                onChange={(e) => handleInputChange('alertName', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* Keyword */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Keyword
                            </label>
                            <input
                                type="text"
                                placeholder="Keyword..."
                                value={formData.keyword}
                                onChange={(e) => handleInputChange('keyword', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* Job Region */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Job Region <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Job Region..."
                                value={formData.jobRegion}
                                onChange={(e) => handleInputChange('jobRegion', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Categories <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Categories..."
                                value={formData.categories}
                                onChange={(e) => handleInputChange('categories', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            />
                        </div>

                        {/* Tags Dropdown */}
                        <div className="relative" ref={el => dropdownRefs.current['tags'] = el}>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Tags <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('tags')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left flex justify-between items-center hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                <span className="text-gray-900">{formData.tags}</span>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </button>
                            {openDropdown === 'tags' && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    {tagOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => selectOption('tags', option)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Job Type Dropdown */}
                        <div className="relative" ref={el => dropdownRefs.current['jobType'] = el}>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Job Type <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('jobType')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left flex justify-between items-center hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                <span className="text-gray-900">{formData.jobType}</span>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </button>
                            {openDropdown === 'jobType' && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    {jobTypeOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => selectOption('jobType', option)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Email Frequency Dropdown */}
                        <div className="relative lg:col-start-1" ref={el => dropdownRefs.current['emailFrequency'] = el}>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Email Frequency <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleDropdown('emailFrequency')}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left flex justify-between items-center hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                <span className="text-gray-900">{formData.emailFrequency}</span>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </button>
                            {openDropdown === 'emailFrequency' && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    {frequencyOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => selectOption('emailFrequency', option)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}