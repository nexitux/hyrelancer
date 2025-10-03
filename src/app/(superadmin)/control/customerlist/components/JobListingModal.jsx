import React, { useState } from 'react';
import { X, Edit3, Users, Calendar, MapPin, DollarSign, Clock, Eye, Trash2, MoreHorizontal } from 'lucide-react';

const JobListingModal = ({ isOpen = true, onClose = () => {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [jobStatus, setJobStatus] = useState('active');

  // Sample job data
  const jobData = {
    id: 'JOB-2024-001',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '₹120,000 - ₹150,000',
    postedDate: '2024-01-15',
    deadline: '2024-02-15',
    description: 'We are looking for an experienced Frontend Developer to join our dynamic team. The ideal candidate will have expertise in React, Next.js, and modern web technologies.',
    requirements: [
      '5+ years of experience in frontend development',
      'Proficiency in React, Next.js, and TypeScript',
      'Experience with modern CSS frameworks',
      'Strong problem-solving skills'
    ],
    applicants: 24,
    views: 156,
    status: 'active'
  };

  const applicants = [
    { id: 1, name: 'Alice Johnson', email: 'alice@email.com', status: 'pending', appliedDate: '2024-01-20' },
    { id: 2, name: 'Bob Smith', email: 'bob@email.com', status: 'interviewed', appliedDate: '2024-01-18' },
    { id: 3, name: 'Carol Davis', email: 'carol@email.com', status: 'rejected', appliedDate: '2024-01-16' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{jobData.title}</h2>
              <p className="text-sm text-gray-500">{jobData.department} • {jobData.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(jobData.status)}`}>
              {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit3 size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2">
              <Users size={20} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{jobData.applicants}</div>
            <div className="text-xs text-gray-500">Applicants</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
              <Eye size={20} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{jobData.views}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">25</div>
            <div className="text-xs text-gray-500">Days Left</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mx-auto mb-2">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-xs text-gray-500">Interviews</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {['overview', 'applicants', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    {jobData.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign size={16} className="mr-2" />
                    {jobData.salary}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={16} className="mr-2" />
                    {jobData.type}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Posted:</span>
                    <span className="ml-2 text-gray-900">{jobData.postedDate}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="ml-2 text-gray-900">{jobData.deadline}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{jobData.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {jobData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'applicants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Applicants</h3>
                <button className="text-blue-600 text-sm hover:text-blue-700">View All</button>
              </div>
              <div className="space-y-3">
                {applicants.map((applicant) => (
                  <div key={applicant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {applicant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{applicant.name}</div>
                        <div className="text-sm text-gray-500">{applicant.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                        {applicant.status}
                      </span>
                      <span className="text-sm text-gray-500">{applicant.appliedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Job Status</h3>
                <div className="space-y-2">
                  {['active', 'paused', 'closed'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={jobStatus === status}
                        onChange={(e) => setJobStatus(e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                <button className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 size={16} className="mr-2" />
                  Delete Job Listing
                </button>
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
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobListingModal;