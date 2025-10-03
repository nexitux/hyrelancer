"use client";

import React from 'react';
import { X, Calendar, Clock, Star, DollarSign, MapPin, FileText, User, Mail, Phone, Briefcase, Globe } from 'lucide-react';

const JobDetailsModal = ({ isOpen = false, onClose = () => {}, jobData = null }) => {
  if (!isOpen || !jobData) return null;

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
      month: 'long',
      day: 'numeric'
    });
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

  const applicationStatus = getApplicationStatus(jobData);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{jobData.get_job_data.cuj_title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getApplicationStatusColor(applicationStatus)}`}>
                  <span className="mr-1">{getApplicationStatusIcon(applicationStatus)}</span>
                  {applicationStatus.replace('_', ' ').toUpperCase()}
                </span>
                <span>•</span>
                <span>Job ID: {jobData.get_job_data.cuj_id}</span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Job Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed">{jobData.get_job_data.cuj_desc}</p>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Job Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <DollarSign size={16} className="text-green-600" />
                  <div>
                    <div className="text-sm text-gray-500">Salary Range</div>
                    <div className="font-medium">{formatSalary(jobData.get_job_data.cuj_salary_range_from, jobData.get_job_data.cuj_salary_range_to)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Briefcase size={16} className="text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Job Type</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_job_type}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe size={16} className="text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-500">Work Mode</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_work_mode}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User size={16} className="text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-500">Experience Required</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_u_experience}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Languages */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location & Requirements</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-red-600" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_location || 'Not specified'}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText size={16} className="text-indigo-600" />
                  <div>
                    <div className="text-sm text-gray-500">Languages</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_lang || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <User size={16} className="text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-500">Contact Name</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_contact_name}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_contact_email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-500">Mobile</div>
                    <div className="font-medium">{jobData.get_job_data.cuj_contact_mobile}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Applied On</div>
                  <div className="font-medium">{formatDate(jobData.created_at)}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-green-600" />
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="font-medium">{formatDate(jobData.updated_at)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Images */}
          {(jobData.get_job_data.cuj_img1 || jobData.get_job_data.cuj_img2 || jobData.get_job_data.cuj_img3) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {jobData.get_job_data.cuj_img1 && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={`https://backend.hyrelancer.in/${jobData.get_job_data.cuj_img1}`} 
                      alt="Job Image 1"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {jobData.get_job_data.cuj_img2 && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={`https://backend.hyrelancer.in/${jobData.get_job_data.cuj_img2}`} 
                      alt="Job Image 2"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {jobData.get_job_data.cuj_img3 && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={`https://backend.hyrelancer.in/${jobData.get_job_data.cuj_img3}`} 
                      alt="Job Image 3"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status-specific information */}
          {applicationStatus === 'accepted' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-900 mb-1">Application Accepted!</div>
              <div className="text-sm text-green-700">
                Assigned on: {formatDate(jobData.updated_at)}
              </div>
            </div>
          )}

          {applicationStatus === 'rejected' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-900 mb-1">Application Status</div>
              <div className="text-sm text-red-700">
                {jobData.sjr_is_reject === 'rejected' ? 'Application was rejected' : 'Job was rejected'}
              </div>
            </div>
          )}
        </div>

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
    </div>
  );
};

export default JobDetailsModal;
