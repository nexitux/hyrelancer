import React from 'react';
import { X, MapPin, Clock, DollarSign, User, Mail, Phone, Calendar, Globe, Briefcase, Tag } from 'lucide-react';

const JobDetailModal = ({ isOpen, onClose, jobData }) => {
  if (!isOpen || !jobData) return null;

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800 truncate" title={job.cuj_title}>{job.cuj_title}</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
              {status}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Details Card */}
              <div className="p-5 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Key Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <DetailItem icon={<Tag size={18} />} label="Category" value={job.job_category?.sc_name} />
                  <DetailItem icon={<Briefcase size={18} />} label="Service" value={job.job_service?.se_name} />
                  <DetailItem icon={<Clock size={18} />} label="Job Type" value={job.cuj_job_type} />
                  <DetailItem icon={<Globe size={18} />} label="Work Mode" value={job.cuj_work_mode} />
                  <DetailItem icon={<Calendar size={18} />} label="Experience" value={job.cuj_u_experience} />
                  <DetailItem icon={<DollarSign size={18} />} label="Salary Range" value={formatSalary(job.cuj_salary_range_from, job.cuj_salary_range_to)} />
                  {job.cuj_location && <DetailItem icon={<MapPin size={18} />} label="Location" value={job.cuj_location} />}
                </dl>
              </div>

              {/* Description Card */}
              <div className="p-5 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{job.cuj_desc}</div>
              </div>

              {/* Languages Card */}
              <div className="p-5 border border-gray-200 rounded-lg">
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Required Languages</h3>
                 <p className="text-gray-700">{formatLanguages(job.cuj_lang)}</p>
              </div>

              {/* Job Images */}
              {(job.cuj_img1 || job.cuj_img2 || job.cuj_img3) && (
                <div className="p-5 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[job.cuj_img1, job.cuj_img2, job.cuj_img3].map((img, index) => (
                      img && (
                        <a key={index} href={`https://test.hyrelancer.in/${img.split('--')[0]}`} target="_blank" rel="noopener noreferrer">
                            <img
                                src={`https://test.hyrelancer.in/${img.split('--')[0]}`}
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
              <div className="p-5 border border-gray-200 rounded-lg bg-slate-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Customer Information</h3>
                <dl className="space-y-4">
                  <DetailItem icon={<User size={18} />} label="Name" value={job.customer?.name} />
                  <DetailItem icon={<Mail size={18} />} label="Email" value={job.customer?.email} />
                  <DetailItem icon={<Phone size={18} />} label="Mobile" value={job.customer?.mobile} />
                </dl>
              </div>

              {/* Job Metadata Card */}
              <div className="p-5 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Metadata</h3>
                <dl className="space-y-4">
                  <DetailItem icon={<Briefcase size={18} />} label="Job ID" value={`#${job.cuj_id}`} />
                  <DetailItem icon={<Calendar size={18} />} label="Created On" value={formatDate(job.created_at)} />
                  <DetailItem icon={<Calendar size={18} />} label="Last Updated" value={formatDate(job.updated_at)} />
                  <DetailItem icon={<User size={18} />} label="Assignment" value={job.cuj_is_assigned ? 'Assigned' : 'Not Assigned'} />
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-5 bg-gray-50 border-t border-gray-200">
          <button onClick={onClose} className="px-5 py-2 text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;