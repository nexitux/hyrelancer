"use client";

import React, { useState } from 'react';
import { X, User, Calendar, Clock, Star, DollarSign, Eye, MapPin, FileText, Search, Filter } from 'lucide-react';

const FreelancerAppliedJobsModal = ({ isOpen = true, onClose = () => {}, freelancer = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample freelancer data - this would come from props
  const defaultFreelancer = {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: 'SJ',
    rating: 4.8,
    totalApplications: 18,
    acceptedApplications: 5,
    appliedJobs: [
      {
        id: 'APP-001',
        jobId: 'JOB-001',
        title: 'Senior React Developer',
        customer: 'TechCorp Inc.',
        customerId: 'CUST-001',
        applicationStatus: 'under_review',
        appliedDate: '2024-01-18',
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        salary: '$120,000 - $150,000',
        description: 'We are looking for an experienced React developer to join our dynamic team and work on cutting-edge web applications.',
        requirements: ['5+ years React experience', 'TypeScript proficiency', 'Team leadership skills'],
        applicationMessage: 'I am excited to apply for this position. My 6 years of React experience and leadership background make me a perfect fit.',
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        totalApplicants: 45,
        companyRating: 4.5
      },
      {
        id: 'APP-002',
        jobId: 'JOB-002',
        title: 'UI/UX Designer',
        customer: 'DesignStudio Pro',
        customerId: 'CUST-002',
        applicationStatus: 'shortlisted',
        appliedDate: '2024-01-20',
        location: 'Remote',
        jobType: 'Contract',
        salary: '$80 - $120/hour',
        description: 'Looking for a creative UI/UX designer to work on mobile and web application designs.',
        requirements: ['Figma expertise', 'Mobile design experience', 'Portfolio required'],
        applicationMessage: 'I have attached my portfolio showcasing mobile and web designs. I specialize in user-centered design.',
        postedDate: '2024-01-17',
        deadline: '2024-02-10',
        totalApplicants: 23,
        companyRating: 4.2
      },
      {
        id: 'APP-003',
        jobId: 'JOB-003',
        title: 'Full Stack Developer',
        customer: 'StartupXYZ',
        customerId: 'CUST-003',
        applicationStatus: 'rejected',
        appliedDate: '2024-01-12',
        location: 'New York, NY',
        jobType: 'Full-time',
        salary: '$90,000 - $130,000',
        description: 'Join our startup team to build innovative web applications using modern technologies.',
        requirements: ['Node.js & React', 'Database design', 'AWS experience'],
        applicationMessage: 'I am passionate about startups and have the technical skills needed for this role.',
        postedDate: '2024-01-10',
        deadline: '2024-01-30',
        totalApplicants: 67,
        companyRating: 3.8,
        rejectionReason: 'Looking for candidates with more startup experience'
      },
      {
        id: 'APP-004',
        jobId: 'JOB-004',
        title: 'Frontend Team Lead',
        customer: 'Enterprise Solutions',
        customerId: 'CUST-004',
        applicationStatus: 'interview_scheduled',
        appliedDate: '2024-01-22',
        location: 'Austin, TX',
        jobType: 'Full-time',
        salary: '$140,000 - $180,000',
        description: 'Lead a team of frontend developers and drive technical decisions for our enterprise platform.',
        requirements: ['Leadership experience', 'Advanced React/Vue', 'Agile methodology'],
        applicationMessage: 'I have led frontend teams for 3 years and am excited about this leadership opportunity.',
        postedDate: '2024-01-20',
        deadline: '2024-02-20',
        totalApplicants: 31,
        companyRating: 4.7,
        interviewDate: '2024-01-28',
        interviewTime: '2:00 PM'
      },
      {
        id: 'APP-005',
        jobId: 'JOB-005',
        title: 'Mobile App Developer',
        customer: 'MobileFirst Co.',
        customerId: 'CUST-005',
        applicationStatus: 'accepted',
        appliedDate: '2024-01-08',
        location: 'Remote',
        jobType: 'Contract',
        salary: '$100 - $150/hour',
        description: 'Develop cross-platform mobile applications using React Native and Flutter.',
        requirements: ['React Native', 'Flutter experience', 'App Store deployment'],
        applicationMessage: 'I have 4 years of mobile development experience and have published 12+ apps.',
        postedDate: '2024-01-05',
        deadline: '2024-01-25',
        totalApplicants: 19,
        companyRating: 4.3,
        acceptedDate: '2024-01-25',
        startDate: '2024-02-01'
      }
    ]
  };

  const currentFreelancer = freelancer || defaultFreelancer;
  const appliedJobs = Array.isArray(currentFreelancer?.appliedJobs)
    ? currentFreelancer.appliedJobs
    : [];

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

  const filteredJobs = appliedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.applicationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    total: appliedJobs.length,
    under_review: appliedJobs.filter(job => job.applicationStatus === 'under_review').length,
    shortlisted: appliedJobs.filter(job => job.applicationStatus === 'shortlisted').length,
    accepted: appliedJobs.filter(job => job.applicationStatus === 'accepted').length,
    rejected: appliedJobs.filter(job => job.applicationStatus === 'rejected').length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
              {currentFreelancer.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{currentFreelancer.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Star size={14} className="text-yellow-400 fill-current mr-1" />
                  {currentFreelancer.rating}
                </div>
                <span>•</span>
                <span>{currentFreelancer.totalApplications} applications sent</span>
                <span>•</span>
                <span>{currentFreelancer.acceptedApplications} accepted</span>
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

        {/* Applications List */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-500">No job applications match your current search criteria.</p>
              </div>
            ) : (
              filteredJobs.map((application) => (
                <div key={application.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{application.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getApplicationStatusColor(application.applicationStatus)}`}>
                          <span className="mr-1">{getApplicationStatusIcon(application.applicationStatus)}</span>
                          {application.applicationStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span>Company: <span className="text-gray-900 font-medium">{application.customer}</span></span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Star size={12} className="text-yellow-400 fill-current mr-1" />
                          {application.companyRating}
                        </span>
                        <span>•</span>
                        <span>{application.totalApplicants} applicants</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{application.description}</p>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-lg font-bold text-gray-900">{application.salary}</div>
                      <div className="text-xs text-gray-500">Salary Range</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2 text-purple-500" />
                      <div>
                        <div className="text-xs text-gray-500">Applied On</div>
                        <div className="font-medium">{new Date(application.appliedDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-2 text-red-500" />
                      <div>
                        <div className="text-xs text-gray-500">Deadline</div>
                        <div className="font-medium">{new Date(application.deadline).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={14} className="mr-2 text-blue-500" />
                      <div>
                        <div className="text-xs text-gray-500">Location</div>
                        <div className="font-medium">{application.location}</div>
                      </div>
                    </div>
                  </div>

                  {/* Application Message */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Application Message:</div>
                    <p className="text-sm text-gray-700 italic">"{application.applicationMessage}"</p>
                  </div>

                  {/* Status-specific information */}
                  {application.applicationStatus === 'interview_scheduled' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-1">Interview Scheduled</div>
                      <div className="text-sm text-blue-700">
                        Date: {application.interviewDate} at {application.interviewTime}
                      </div>
                    </div>
                  )}

                  {application.applicationStatus === 'accepted' && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-900 mb-1">Application Accepted!</div>
                      <div className="text-sm text-green-700">
                        Accepted on: {application.acceptedDate} • Start Date: {application.startDate}
                      </div>
                    </div>
                  )}

                  {application.applicationStatus === 'rejected' && application.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-900 mb-1">Application Status</div>
                      <div className="text-sm text-red-700">{application.rejectionReason}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Application ID: {application.id} • Job ID: {application.jobId}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors font-medium">
                        View Job Details
                      </button>
                      {application.applicationStatus === 'under_review' && (
                        <button className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors font-medium">
                          Withdraw Application
                        </button>
                      )}
                      {application.applicationStatus === 'interview_scheduled' && (
                        <button className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium">
                          Interview Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

export default FreelancerAppliedJobsModal;