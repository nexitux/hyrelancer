"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, CircleDollarSign, User, Mail, Phone, Calendar, Globe, Briefcase, Tag, MessageSquare, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Base64 } from 'js-base64';
import adminApi from '@/config/adminApi';
import JobCommentsModal from '../components/JobCommentsModal';
import RemoveReasonModal from '../components/RemoveReasonModal';

const JobDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isRemoveReasonModalOpen, setIsRemoveReasonModalOpen] = useState(false);

  const jobId = searchParams.get('id');

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    } else {
      setError('Job ID not provided');
      setLoading(false);
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const encodedId = Base64.encode(String(jobId));
      const response = await adminApi.get(`/getJobData/${encodedId}`);
      setJobData(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Error loading job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleOpenCommentsModal = () => {
    setIsCommentsModalOpen(true);
  };

  const handleCloseCommentsModal = () => {
    setIsCommentsModalOpen(false);
  };

  const handleOpenRemoveReasonModal = () => {
    setIsRemoveReasonModalOpen(true);
  };

  const handleCloseRemoveReasonModal = () => {
    setIsRemoveReasonModalOpen(false);
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const job = jobData.job_data;

  // Status logic
  let status = 'Unknown';
  let statusColor = 'bg-slate-100 text-slate-600';
  
  if (job.cuj_is_rejected === 1 && job.cuj_is_active === 1) {
    status = 'Active';
    statusColor = 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20';
  } else if (job.cuj_is_rejected === 0 && job.cuj_is_active === 1) {
    status = 'Pending Approval';
    statusColor = 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-600/20';
  } else if (job.cuj_is_rejected === 0 && job.cuj_is_active === 0) {
    status = 'Deleted';
    statusColor = 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20';
  }

  const formatSalary = (from, to) => {
    if (!from || !to) return 'Not specified';
    return `₹${parseInt(from).toLocaleString()} - ₹${parseInt(to).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLanguages = (langString) => {
    if (!langString) return 'Not specified';
    return langString.split(',')
      .map(lang => lang.trim().charAt(0).toUpperCase() + lang.trim().slice(1))
      .join(', ');
  };
  
  // A small component for displaying key-value details with an icon
  const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg p-2 mt-1">
        {icon}
      </div>
      <div>
        <dt className="text-sm font-semibold text-gray-500">{label}</dt>
        <dd className="mt-1 text-gray-800 font-medium">{value || 'N/A'}</dd>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          <span>Back to Jobs List</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800 truncate" title={job.cuj_title}>
              {job.cuj_title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
              {status}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenCommentsModal}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare size={18} />
              <span>Comments</span>
            </button>
            
            <button
              onClick={handleOpenRemoveReasonModal}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={18} />
              <span>Remove Reason</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Details Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Key Details</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <DetailItem icon={<Tag size={18} />} label="Category" value={job.job_category?.sc_name} />
                <DetailItem icon={<Briefcase size={18} />} label="Service" value={job.job_service?.se_name} />
                <DetailItem icon={<Clock size={18} />} label="Job Type" value={job.cuj_job_type} />
                <DetailItem icon={<Globe size={18} />} label="Work Mode" value={job.cuj_work_mode} />
                <DetailItem icon={<Calendar size={18} />} label="Experience" value={job.cuj_u_experience} />
                <DetailItem icon={<CircleDollarSign size={18} />} label="Salary Range" value={formatSalary(job.cuj_salary_range_from, job.cuj_salary_range_to)} />
                {job.cuj_location && <DetailItem icon={<MapPin size={18} />} label="Location" value={job.cuj_location} />}
              </dl>
            </div>

            {/* Description Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{job.cuj_desc}</div>
            </div>

            {/* Languages Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Required Languages</h2>
              <p className="text-gray-700">{formatLanguages(job.cuj_lang)}</p>
            </div>

            {/* Job Images */}
            {(job.cuj_img1 || job.cuj_img2 || job.cuj_img3) && (
              <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Attachments</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[job.cuj_img1, job.cuj_img2, job.cuj_img3].map((img, index) => (
                    img && (
                      <a key={index} href={`https://hyre.hyrelancer.com/${img.split('--')[0]}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`https://hyre.hyrelancer.com/${img.split('--')[0]}`}
                          alt={`Job Attachment ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-100 transition-transform hover:scale-105"
                        />
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Information Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Customer Information</h2>
              <dl className="space-y-5">
                <DetailItem icon={<User size={18} />} label="Name" value={job.customer?.name} />
                <DetailItem icon={<Mail size={18} />} label="Email" value={job.customer?.email} />
                <DetailItem icon={<Phone size={18} />} label="Mobile" value={job.customer?.mobile} />
              </dl>
            </div>

            {/* Job Metadata Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Metadata</h2>
              <dl className="space-y-5">
                <DetailItem icon={<Briefcase size={18} />} label="Job ID" value={`#${job.cuj_id}`} />
                <DetailItem icon={<Calendar size={18} />} label="Created On" value={formatDate(job.created_at)} />
                <DetailItem icon={<Calendar size={18} />} label="Last Updated" value={formatDate(job.updated_at)} />
                <DetailItem icon={<User size={18} />} label="Assignment" value={job.cuj_is_assigned ? 'Assigned' : 'Not Assigned'} />
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <JobCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={handleCloseCommentsModal}
        jobId={jobId}
        userId={job?.customer?.id || job?.customer?.cu_id}
      />

      {/* Remove Reason Modal */}
      <RemoveReasonModal
        isOpen={isRemoveReasonModalOpen}
        onClose={handleCloseRemoveReasonModal}
        jobId={jobId}
      />
    </div>
  );
};

export default JobDetailPage;
