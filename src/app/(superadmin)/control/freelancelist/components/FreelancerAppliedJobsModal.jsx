"use client";

import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, Star, DollarSign, Eye, MapPin, FileText, Search, Filter, Loader2, Briefcase } from 'lucide-react';
import adminApi from '@/config/adminApi';
import { Base64 } from 'js-base64';
import JobDetailsModal from './JobDetailsModal';

const FreelancerAppliedJobsModal = ({ isOpen = true, onClose = () => {}, freelancer = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Job Details Modal state
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [selectedJobData, setSelectedJobData] = useState(null);

  // Fetch job applications when modal opens and freelancer is provided
  useEffect(() => {
    console.log('Modal useEffect triggered:', { isOpen, freelancer });
    if (isOpen && freelancer?.id) {
      fetchJobApplications();
    }
  }, [isOpen, freelancer?.id]);

  const fetchJobApplications = async () => {
    if (!freelancer?.id) {
      console.log('No freelancer ID provided:', freelancer);
      return;
    }
    
    console.log('Fetching job applications for freelancer ID:', freelancer.id);
    setLoading(true);
    setError(null);
    
    try {
      // Base64 encode the freelancer ID as required by the API
      const encodedFreelancerId = Base64.encode(freelancer.id.toString());
      console.log('Encoded freelancer ID:', encodedFreelancerId);
      
      const response = await adminApi.get(`/getJobsReForFreelancer/${encodedFreelancerId}`);
      console.log('API Response:', response.data);
      setJobApplications(response.data.job_re_list || []);
    } catch (err) {
      console.error('Error fetching job applications:', err);
      setError('Failed to fetch job applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return '✓';
      case 'shortlisted': return '⭐';
      case 'interview_scheduled': return '📅';
      case 'under_review': return '👁️';
      case 'rejected': return '✗';
      case 'withdrawn': return '↩️';
      default: return '●';
    }
  };

  const getApplicationStatus = (application) => {
    if (application.sjr_is_reject === 'rejected') return 'rejected';
    if (application.sjr_is_active === 0) return 'withdrawn';
    
    const jobData = application.get_job_data;
    if (jobData.cuj_is_rejected === 1) return 'rejected';
    if (jobData.cuj_fe_assigned === application.sjr_fe_u_id && jobData.cuj_is_assigned === 1) {
      return 'accepted';
    }
    if (jobData.cuj_job_status === 1) return 'shortlisted';
    
    return 'under_review';
  };

  const filteredJobs = jobApplications.filter(job => {
    const jobData = job.get_job_data;
    const matchesSearch = jobData.cuj_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobData.cuj_contact_name.toLowerCase().includes(searchTerm.toLowerCase());
    const applicationStatus = getApplicationStatus(job);
    const matchesStatus = statusFilter === 'all' || applicationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    total: jobApplications.length,
    under_review: jobApplications.filter(job => getApplicationStatus(job) === 'under_review').length,
    shortlisted: jobApplications.filter(job => getApplicationStatus(job) === 'shortlisted').length,
    accepted: jobApplications.filter(job => getApplicationStatus(job) === 'accepted').length,
    rejected: jobApplications.filter(job => getApplicationStatus(job) === 'rejected').length
  };

  const formatSalary = (from, to) => {
    if (!from && !to) return 'Not specified';
    if (!from) return `Up to ₹${to}`;
    if (!to) return `From ₹${from}`;
    return `₹${from} - ₹${to}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openJobDetailsModal = (jobData) => {
    setSelectedJobData(jobData);
    setIsJobDetailsModalOpen(true);
  };

  const closeJobDetailsModal = () => {
    setIsJobDetailsModalOpen(false);
    setSelectedJobData(null);
  };

  if (!isOpen) return null;

  console.log('Rendering modal with data:', { 
    jobApplications: jobApplications.length, 
    loading, 
    error, 
    freelancer 
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
              {freelancer?.name ? freelancer.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{freelancer?.name || 'Freelancer'}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{freelancer?.email || 'No email provided'}</span>
                <span>•</span>
                <span>{statusCounts.total} applications sent</span>
                <span>•</span>
                <span>{statusCounts.accepted} accepted</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.total}</div>
            <div className="text-xs text-gray-500">Total Applied</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg mx-auto mb-2">
              <Eye size={20} className="text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.under_review}</div>
            <div className="text-xs text-gray-500">Under Review</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
              <Star size={20} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.shortlisted}</div>
            <div className="text-xs text-gray-500">Shortlisted</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
              <User size={20} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.accepted}</div>
            <div className="text-xs text-gray-500">Accepted</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mx-auto mb-2">
              <X size={20} className="text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statusCounts.rejected}</div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Job Applications ({filteredJobs.length})</h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading job applications...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchJobApplications}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Applications List */}
        {!loading && !error && (
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-500">No job applications match your current search criteria.</p>
                </div>
              ) : (
                filteredJobs.map((application) => {
                  const jobData = application.get_job_data;
                  const applicationStatus = getApplicationStatus(application);
                  
                  return (
                    <div 
                      key={application.sjr_id} 
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => openJobDetailsModal(application)}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Briefcase size={16} className="text-blue-600" />
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{jobData.cuj_title}</h4>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(applicationStatus)}`}>
                            <span className="mr-1">{getApplicationStatusIcon(applicationStatus)}</span>
                            {applicationStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Job Description Preview */}
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {jobData.cuj_desc}
                      </p>

                      {/* Key Details */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Customer:</span>
                          <span className="font-medium text-gray-900">{jobData.cuj_contact_name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Salary:</span>
                          <span className="font-medium text-green-600">
                            {formatSalary(jobData.cuj_salary_range_from, jobData.cuj_salary_range_to)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium text-gray-900">{jobData.cuj_job_type}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Mode:</span>
                          <span className="font-medium text-gray-900">{jobData.cuj_work_mode}</span>
                        </div>
                      </div>

                      {/* Applied Date */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          Applied: {formatDate(application.created_at)}
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                          Click to view details →
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        isOpen={isJobDetailsModalOpen}
        onClose={closeJobDetailsModal}
        jobData={selectedJobData}
      />
    </div>
  );
};

export default FreelancerAppliedJobsModal;