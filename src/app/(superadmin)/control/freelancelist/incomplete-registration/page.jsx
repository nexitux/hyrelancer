"use client";
import React, { useState, useEffect } from 'react';
import adminApi from '@/config/adminApi';
import Link from 'next/link';
import { Base64 } from 'js-base64';
import { 
  MdVisibility, 
  MdEdit, 
  MdSearch, 
  MdFilterList, 
  MdRefresh,
  MdPersonAdd,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdWarning
} from 'react-icons/md';

export default function IncompleteRegistrationsPage() {
  // State for the list of incomplete freelancers
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);

  // Fetch data from API
  const fetchIncompleteFreelancers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.get('/getFeIncompleteList');
      const result = response?.data;
      const list = Array.isArray(result) ? result : result?.data;
      if (Array.isArray(list)) {
        setFreelancers(list);
      } else {
        setFreelancers([]);
      }
    } catch (err) {
      setError('Failed to fetch incomplete registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncompleteFreelancers();
  }, []);

  // Filter freelancers based on search term
  const filteredFreelancers = freelancers.filter(freelancer =>
    freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.mobile.includes(searchTerm)
  );

  // Handle select all functionality
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedFreelancers(filteredFreelancers.map(f => f.id));
    } else {
      setSelectedFreelancers([]);
    }
  };

  // Handle individual selection
  const handleSelectFreelancer = (id, checked) => {
    if (checked) {
      setSelectedFreelancers([...selectedFreelancers, id]);
    } else {
      setSelectedFreelancers(selectedFreelancers.filter(fId => fId !== id));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get registration completion percentage
  const getCompletionPercentage = (regComplete) => {
    const percentage = (parseInt(regComplete) / 6) * 100;
    return Math.min(percentage, 100);
  };

  // Get completion status
  const getCompletionStatus = (regComplete) => {
    const step = parseInt(regComplete);
    if (step <= 2) return { text: 'Just Started', color: 'text-red-600 bg-red-50' };
    if (step <= 3) return { text: 'In Progress', color: 'text-yellow-600 bg-yellow-50' };
    if (step <= 4) return { text: 'Almost Done', color: 'text-blue-600 bg-blue-50' };
    return { text: 'Complete', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Incomplete Registrations</h1>
              <p className="mt-2 text-gray-600">
                Manage freelancers who haven't completed their registration process
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchIncompleteFreelancers}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <MdRefresh className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MdWarning className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Incomplete</p>
                <p className="text-2xl font-bold text-gray-900">{freelancers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <MdPersonAdd className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Just Started</p>
                <p className="text-2xl font-bold text-gray-900">
                  {freelancers.filter(f => parseInt(f.is_regi_complete) <= 2).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <MdCalendarToday className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {freelancers.filter(f => parseInt(f.is_regi_complete) === 3).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MdEmail className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Almost Done</p>
                <p className="text-2xl font-bold text-gray-900">
                  {freelancers.filter(f => parseInt(f.is_regi_complete) >= 4).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or mobile..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <MdFilterList className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={selectedFreelancers.length === filteredFreelancers.length && filteredFreelancers.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {selectedFreelancers.length > 0 ? `${selectedFreelancers.length} selected` : 'Select all'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredFreelancers.length} of {freelancers.length} results
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading incomplete registrations...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MdWarning className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                  onClick={fetchIncompleteFreelancers}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : filteredFreelancers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MdPersonAdd className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No incomplete registrations found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search criteria' : 'All freelancers have completed their registration'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFreelancers.map((freelancer) => {
                  const completionStatus = getCompletionStatus(freelancer.is_regi_complete);
                  const completionPercentage = getCompletionPercentage(freelancer.is_regi_complete);
                  
                  return (
                    <div key={freelancer.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedFreelancers.includes(freelancer.id)}
                          onChange={(e) => handleSelectFreelancer(freelancer.id, e.target.checked)}
                        />
                        
                        <div className="ml-4 flex-1">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            {/* Name and ID */}
                            <div className="lg:col-span-3">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {freelancer.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="font-semibold text-gray-900">{freelancer.name}</p>
                                  {/* <p className="text-sm text-gray-500">ID: {freelancer.id}</p> */}
                                </div>
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="lg:col-span-2">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
                                  <span className="truncate">{freelancer.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MdPhone className="w-4 h-4 mr-2 text-gray-400" />
                                  <span>{freelancer.mobile}</span>
                                </div>
                              </div>
                            </div>

                            {/* Registration Progress */}
                            <div className="lg:col-span-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">Progress</span>
                                  <span className="text-sm text-gray-600">{completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${completionPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="lg:col-span-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${completionStatus.color}`}>
                                {completionStatus.text}
                              </span>
                            </div>

                            {/* Step */}
                            <div className="lg:col-span-1">
                              <div className="text-sm text-gray-600">
                                <div>Step</div>
                                <div className="font-medium">{parseInt(freelancer.is_regi_complete)} / 6</div>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="lg:col-span-1">
                              <div className="text-sm text-gray-600">
                                <div>Started</div>
                                <div className="font-medium">{formatDate(freelancer.created_at)}</div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="lg:col-span-1">
                              <div className="flex items-center gap-2 justify-end">
                                <Link
                                  href={`/control/freelancelist/freelancerView/${Base64.encode(freelancer.id.toString())}`}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <MdVisibility className="w-5 h-5" />
                                </Link>
                                <Link
                                  href={`/control/freelancelist/freelancerEdit/${Base64.encode(freelancer.id.toString())}`}
                                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Edit Registration"
                                >
                                  <MdEdit className="w-5 h-5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredFreelancers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {filteredFreelancers.length} of {freelancers.length} incomplete registrations
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    1
                  </button>
                  <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}