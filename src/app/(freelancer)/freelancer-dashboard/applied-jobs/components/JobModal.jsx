"use client"
import { useState } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaHourglassHalf,
  FaChartBar,
  FaLanguage,
  FaShareAlt,
  FaMapMarkerAlt,
  FaRegDotCircle,
  FaStar,
  FaTimes,
  FaPlay
} from 'react-icons/fa';
import {
  FacebookFilled,
  LinkedinFilled,
  TwitterSquareFilled,
  InstagramFilled,
  PinterestFilled
} from '@ant-design/icons';

const JobModal = ({ isOpen, onClose, selectedJob }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const toggleShare = () => setIsShareOpen(!isShareOpen);

  if (!isOpen || !selectedJob) return null;

  // Generate company initials from company name
  const getCompanyInitials = (companyName) => {
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate days ago
  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="modal_item relative flex-shrink-0 min-[1400px]:w-[1370px] w-[90vw] max-h-[90vh] rounded-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="heading flex items-center justify-between py-6 px-7 border-b border-gray-300">
          <h5 className="text-xl font-bold">View Job Application</h5>
          <button 
            className="close_popup_btn hover:bg-gray-100 rounded-full p-2 transition-colors"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex max-lg:flex-col gap-y-8 py-7 md:px-10 px-5 overflow-y-auto scrollbar-hide max-h-[calc(90vh-90px)] pb-10">
          {/* Left Content */}
          <div className="jobs_inner w-full lg:pr-15 pb-6">
            {/* Job Header */}
            <div className="flex max-xl:flex-col xl:items-center justify-between gap-7 gap-y-4 pb-10 border-b border-gray-300">
              <div className="jobs_info flex flex-wrap sm:gap-8 gap-4">
                <div className="overflow-hidden flex-shrink-0 sm:w-[100px] w-24 sm:h-[100px] h-24 rounded-full">
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#3d5999]">
                    {getCompanyInitials(selectedJob.company)}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#3d5999] font-medium">{selectedJob.company}</span>
                  <h4 className="text-2xl font-bold">{selectedJob.title}</h4>
                  <div className="flex flex-wrap items-center gap-5 gap-y-1.5 mt-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt size={16} />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt size={16} />
                      <span>{getDaysAgo(selectedJob.date)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 mt-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{selectedJob.jobType}</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">{selectedJob.workMode}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedJob.status === 'Active' ? 'bg-green-100 text-green-800' :
                      selectedJob.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                      selectedJob.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedJob.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="breadcrumb_action flex flex-col xl:items-end max-lg:flex-col-reverse gap-3">
                <button 
                  className="button_share flex items-center justify-center w-12 h-12 border border-gray-300 rounded-full bg-white duration-300 hover:border-[#3d5999] relative"
                  onClick={toggleShare}
                >
                  <FaShareAlt size={20} />
                  {isShareOpen && (
                    <ul className="social absolute right-0 top-full mt-2 bg-white p-2 rounded-lg shadow-lg z-10 flex gap-2">
                      <li>
                        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center border border-gray-300 text-black rounded-full duration-300 hover:bg-[#3d5999] hover:text-white">
                          <FacebookFilled />
                        </a>
                      </li>
                      <li>
                        <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center border border-gray-300 text-black rounded-full duration-300 hover:bg-[#3d5999] hover:text-white">
                          <LinkedinFilled />
                        </a>
                      </li>
                      <li>
                        <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center border border-gray-300 text-black rounded-full duration-300 hover:bg-[#3d5999] hover:text-white">
                          <TwitterSquareFilled />
                        </a>
                      </li>
                    </ul>
                  )}
                </button>
                <div className="jobs_price">
                  <span className="text-xl font-bold">{selectedJob.cost}</span>
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <div className="overview md:mt-10 mt-7">
              <h6 className="text-lg font-bold mb-4">Job Overview</h6>
              <ul className="list_overview grid sm:grid-cols-3 grid-cols-2 gap-6 w-full">
                {[
                  { icon: FaCalendarAlt, label: "Date Applied:", value: selectedJob.date },
                  { icon: FaClock, label: "Job Type:", value: selectedJob.jobType },
                  { icon: FaMapMarkerAlt, label: "Location:", value: selectedJob.location },
                  { icon: FaHourglassHalf, label: "Work Mode:", value: selectedJob.workMode },
                  { icon: FaChartBar, label: "Experience:", value: selectedJob.experience },
                  { icon: FaLanguage, label: "Languages:", value: selectedJob.languages || "Not specified" },
                ].map(({ icon: Icon, label, value }, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Icon size={24} className="flex-shrink-0 text-[#3d5999]" />
                    <div>
                      <span className="block text-gray-600 text-sm">{label}</span>
                      <strong className="text-[#3d5999]">{value}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Job Description */}
            <div className="description md:mt-10 mt-7">
              <h6 className="text-lg font-bold mb-3">Job Description</h6>
              <p className="text-gray-600">
                {selectedJob.description || "No description available for this job."}
              </p>
            </div>

            {/* Application Status */}
            <div className="status md:mt-10 mt-7">
              <h6 className="text-lg font-bold mb-3">Application Status</h6>
              <div className={`p-4 rounded-lg ${
                selectedJob.status === 'Active' ? 'bg-green-50 border border-green-200' :
                selectedJob.status === 'Submitted' ? 'bg-blue-50 border border-blue-200' :
                selectedJob.status === 'Rejected' ? 'bg-red-50 border border-red-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedJob.status === 'Active' ? 'bg-green-500' :
                    selectedJob.status === 'Submitted' ? 'bg-blue-500' :
                    selectedJob.status === 'Rejected' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className={`font-medium ${
                    selectedJob.status === 'Active' ? 'text-green-800' :
                    selectedJob.status === 'Submitted' ? 'text-blue-800' :
                    selectedJob.status === 'Rejected' ? 'text-red-800' :
                    'text-gray-800'
                  }`}>
                    {selectedJob.status}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${
                  selectedJob.status === 'Active' ? 'text-green-700' :
                  selectedJob.status === 'Submitted' ? 'text-blue-700' :
                  selectedJob.status === 'Rejected' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {selectedJob.status === 'Active' ? 'Your application is currently active and under review.' :
                   selectedJob.status === 'Submitted' ? 'Your application has been submitted successfully.' :
                   selectedJob.status === 'Rejected' ? 'Unfortunately, your application was not selected.' :
                   'This application has expired.'}
                </p>
              </div>
            </div>

            {/* Job Image */}
            {selectedJob.image && (
              <div className="images md:mt-10 mt-7">
                <h6 className="text-lg font-bold mb-3">Job Image</h6>
                <div className="relative overflow-hidden rounded-lg bg-gray-200 h-48">
                  <img 
                    src={`https://hyre.hyrelancer.com/${selectedJob.image}`}
                    alt="Job related image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center"><span class="text-gray-500">Image not available</span></div>';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="jobs_sidebar flex-shrink-0 lg:w-[380px] w-full h-fit">
            <div className="about overflow-hidden rounded-xl bg-white shadow-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
                <h6 className="text-lg font-bold">About the Employer</h6>
              </div>
              <div className="employer_info p-5">
                <div className="flex items-center gap-5 w-full mb-5">
                  <div className="flex-shrink-0 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#3d5999]">
                    {getCompanyInitials(selectedJob.company)}
                  </div>
                  <div>
                    <div className="rate flex items-center pb-1">
                      {[...Array(4)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                      <FaStar className="text-gray-300" />
                    </div>
                    <strong className="text-lg font-bold">{selectedJob.company}</strong>
                    <div className="text-gray-600 text-sm">Since {formatDate(selectedJob.date)}</div>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600">Job Type:</span>
                    <strong className="text-[#3d5999]">{selectedJob.jobType}</strong>
                  </div>
                  <div className="flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600">Work Mode:</span>
                    <strong className="text-[#3d5999]">{selectedJob.workMode}</strong>
                  </div>
                  <div className="flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600">Location:</span>
                    <strong className="text-[#3d5999]">{selectedJob.location}</strong>
                  </div>
                  {selectedJob.contactEmail && (
                    <div className="flex items-center justify-between w-full py-5 border-b border-gray-300">
                      <span className="text-gray-600">Email:</span>
                      <strong className="text-[#3d5999] text-sm break-all">{selectedJob.contactEmail}</strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 w-full py-5">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedJob.status === 'Active' ? 'bg-green-100 text-green-800' :
                      selectedJob.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                      selectedJob.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedJob.status}
                    </span>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;