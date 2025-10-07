"use client"
import { useState } from 'react';
import {
  FaCalendarAlt,
  FaHourglassHalf,
  FaChartBar,
  FaLanguage,
  FaMapMarkerAlt,
  FaRegDotCircle,
  FaStar,
  FaTimes,
  FaPlay
} from 'react-icons/fa';
import Image from "next/image";

const JobModal = ({ isOpen, onClose, job }) => {
  if (!isOpen) return null;

  const raw = job?.raw || {};
  
  // Extract job data with fallbacks
  const jobTitle = raw.cuj_title || raw.title || 'Job Title';
  const jobDescription = raw.cuj_desc || raw.desc || 'No description available';
  const jobLocation = raw.cuj_location || raw.location || 'Location not specified';
  const jobExperience = raw.cuj_u_experience || raw.u_experience || 'Not specified';
  const jobWorkMode = raw.cuj_work_mode || raw.work_mode || 'Not specified';
  const jobLanguage = raw.cuj_lang || raw.language || 'Not specified';
  const salaryFrom = raw.cuj_salary_range_from || raw.salary_range_from || '0';
  const salaryTo = raw.cuj_salary_range_to || raw.salary_range_to || '0';
  const jobType = raw.cuj_job_type || raw.job_type || 'Not specified';
  const category = job?.category || 'Category';
  const service = job?.service || 'Service';
  const postedOn = job?.postedOn || 'Not specified';
  
  // Contact information
  const contactName = raw.cuj_contact_name || raw.contact_name || 'Not provided';
  const contactEmail = raw.cuj_contact_email || raw.contact_email || 'Not provided';
  const contactMobile = raw.cuj_contact_mobile || raw.contact_mobile || 'Not provided';
  const hideContact = raw.hide_contact === '1' || raw.hide_contact === 1;
  
  // Images - handle both full URLs and relative paths
  const images = [];
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hyre.hyrelancer.com';
  
  // Debug: Log the raw data to see what image fields are available
  console.log('Raw job data:', raw);
  console.log('Image fields:', {
    cuj_img1: raw.cuj_img1,
    cuj_img2: raw.cuj_img2,
    cuj_img3: raw.cuj_img3
  });
  
  // Helper function to clean image URL
  const cleanImageUrl = (url) => {
    if (!url) return null;
    
    // Handle URLs with duplicate filenames separated by --
    if (url.includes('--')) {
      // Split by -- and take the first part
      url = url.split('--')[0];
    }
    
    // If it's already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // Otherwise, prepend base URL
    return `${baseUrl}/${url}`;
  };
  
  if (raw.cuj_img1) {
    const imgUrl = cleanImageUrl(raw.cuj_img1);
    if (imgUrl) images.push({ id: 1, url: imgUrl });
  }
  if (raw.cuj_img2) {
    const imgUrl = cleanImageUrl(raw.cuj_img2);
    if (imgUrl) images.push({ id: 2, url: imgUrl });
  }
  if (raw.cuj_img3) {
    const imgUrl = cleanImageUrl(raw.cuj_img3);
    if (imgUrl) images.push({ id: 3, url: imgUrl });
  }
  
  console.log('Processed images:', images);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="modal_item relative flex-shrink-0 w-full max-w-4xl max-h-[95vh] rounded-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="heading flex items-center justify-between py-4 sm:py-6 px-4 sm:px-7 border-b border-gray-300">
          <h5 className="text-lg sm:text-xl font-bold">View job</h5>
          <button 
            className="close_popup_btn hover:bg-gray-100 rounded-full p-2 transition-colors"
            onClick={onClose}
          >
            <FaTimes size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="py-4 sm:py-6 md:py-7 px-3 sm:px-5 md:px-10 overflow-y-auto scrollbar-hide max-h-[calc(95vh-80px)] pb-6 sm:pb-8 md:pb-10">
          {/* Single Column Layout */}
          <div className="max-w-3xl mx-auto">
            {/* Job Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 md:pb-10 border-b border-gray-300">
              <div className="jobs_info flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[#3d5999] font-medium text-sm sm:text-base">{category}</span>
                  <h4 className="text-lg sm:text-xl md:text-2xl font-bold">{jobTitle}</h4>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 gap-y-1.5 mt-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <FaMapMarkerAlt size={12} className="sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">{jobLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <FaCalendarAlt size={12} className="sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm">{postedOn}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 rounded-full text-xs">{service}</span>
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 rounded-full text-xs">{jobWorkMode}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col xl:items-end gap-2 sm:gap-3">
                <div className="jobs_price text-center sm:text-right">
                  <span className="text-base sm:text-lg md:text-xl font-bold">₹{salaryFrom} - ₹{salaryTo}</span>
                  <span className="text-gray-600 text-xs sm:text-sm">/project</span>
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <div className="overview mt-6 sm:mt-7 md:mt-10">
              <h6 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Job Overview</h6>
              <ul className="list_overview grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3 sm:gap-4 md:gap-6 w-full">
                {[
                  { icon: FaCalendarAlt, label: "Date Posted:", value: postedOn },
                  { icon: FaMapMarkerAlt, label: "Location:", value: jobLocation },
                  { icon: FaChartBar, label: "Experience Required:", value: `${jobExperience} ` },
                  { icon: FaHourglassHalf, label: "Work Mode:", value: jobWorkMode },
                  { icon: FaLanguage, label: "Preferred Language:", value: jobLanguage },
                ].map(({ icon: Icon, label, value }, idx) => (
                  <li key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <Icon size={16} className="flex-shrink-0 text-[#3d5999] sm:w-5 sm:h-5" />
                    <div className="min-w-0 flex-1">
                      <span className="block text-gray-600 text-xs sm:text-sm">{label}</span>
                      <strong className="text-[#3d5999] text-xs sm:text-sm md:text-base break-words">{value}</strong>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Job Description */}
            <div className="description mt-6 sm:mt-7 md:mt-10">
              <h6 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Job Description</h6>
              <p className="text-gray-600 text-sm sm:text-base">
                {jobDescription}
              </p>
            </div>

            {/* Budget Information */}
            <div className="budget mt-6 sm:mt-7 md:mt-10">
              <h6 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Budget Information</h6>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Budget Range:</span>
                  <strong className="text-[#3d5999] text-lg sm:text-xl">₹{salaryFrom} - ₹{salaryTo}</strong>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-500">
                  This is the budget range for this project
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="images mt-6 sm:mt-7 md:mt-10">
              <h6 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Job Images</h6>
              {images.length > 0 ? (
                <ul className="list_images grid xl:grid-cols-2 lg:grid-cols-2 grid-cols-1 gap-3 sm:gap-4 md:gap-5 w-full">
                  {images.map((image, index) => (
                    <li key={image.id} className="relative overflow-hidden rounded-lg bg-gray-200 aspect-square">
                      <img
                        src={image.url}
                        alt={`Job image ${image.id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', image.url);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', image.url)}
                      />
                      <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center hidden">
                        <span className="text-gray-500 text-xs sm:text-sm">Image {image.id} - Failed to load</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">No images uploaded for this job</p>
                </div>
              )}
            </div>

            {/* Contact Information - Moved to last */}
            {!hideContact && (
              <div className="contact mt-6 sm:mt-7 md:mt-10">
                <h6 className="text-base sm:text-lg font-bold mb-2 sm:mb-3">Contact Information</h6>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 text-sm sm:text-base">Contact Name:</span>
                    <strong className="text-[#3d5999] text-sm sm:text-base">{contactName}</strong>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 text-sm sm:text-base">Email:</span>
                    <strong className="text-[#3d5999] text-sm sm:text-base">{contactEmail}</strong>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-gray-600 text-sm sm:text-base">Mobile:</span>
                    <strong className="text-[#3d5999] text-sm sm:text-base">+91 {contactMobile}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;