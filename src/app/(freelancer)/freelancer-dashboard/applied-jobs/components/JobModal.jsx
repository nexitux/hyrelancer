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
import Image from "next/image";

const JobModal = ({ isOpen, onClose }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const toggleShare = () => setIsShareOpen(!isShareOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="modal_item relative flex-shrink-0 min-[1400px]:w-[1370px] w-[90vw] max-h-[90vh] rounded-lg bg-white overflow-hidden">
        {/* Header */}
        <div className="heading flex items-center justify-between py-6 px-7 border-b border-gray-300">
          <h5 className="text-xl font-bold">View job</h5>
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
                    PE
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#3d5999] font-medium">PrimeEdge Solutions</span>
                  <h4 className="text-2xl font-bold">Full Stack Developer</h4>
                  <div className="flex flex-wrap items-center gap-5 gap-y-1.5 mt-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaMapMarkerAlt size={16} />
                      <span>Las Vegas, USA</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCalendarAlt size={16} />
                      <span>2 days ago</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 mt-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Part-Time</span>
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Web Design</span>
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
                  <span className="text-xl font-bold">$450 - $550</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
            </div>

            {/* Project Overview */}
            <div className="overview md:mt-10 mt-7">
              <h6 className="text-lg font-bold mb-4">Projects Overview</h6>
              <ul className="list_overview grid sm:grid-cols-3 grid-cols-2 gap-6 w-full">
                {[
                  { icon: FaCalendarAlt, label: "Date Posted:", value: "April 20, 2024" },
                  { icon: FaClock, label: "Expiration date:", value: "April 20, 2027" },
                  { icon: FaMapMarkerAlt, label: "Location:", value: "Las Vegas, USA" },
                  { icon: FaHourglassHalf, label: "Hours:", value: "35h /week" },
                  { icon: FaChartBar, label: "Experience:", value: "4 Year" },
                  { icon: FaLanguage, label: "English Level:", value: "Fluent" },
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
              <h6 className="text-lg font-bold mb-3">Full Job Description</h6>
              <p className="text-gray-600">
                Are you a User Experience Designer with a track record of delivering intuitive digital experiences that drive results? Are you a strategic storyteller and systems thinker who can concept and craft smart, world-class campaigns across a variety of mediums?
              </p>
            </div>

            {/* The Work You'll Do */}
            <div className="work md:mt-10 mt-7">
              <h6 className="text-lg font-bold mb-3">The Work You'll Do:</h6>
              <ul className="list_work w-full">
                {[
                  "Support the Creative Directors and Associate Creative Directors of experience design to concept and oversee the production of bold, innovative, award-winning campaigns and digital experiences.",
                  "Make strategic and tactical UX decisions related to design and usability as well as features and functions.",
                  "Creates low- and high-fidelity wireframes that represent a user's journey."
                ].map((item, idx) => (
                  <li key={idx} className="flex text-gray-600 mb-3">
                    <FaRegDotCircle className="mt-1 mr-3 text-[#3d5999] flex-shrink-0" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You'll Bring */}
            <div className="bring md:mt-10 mt-7">
              <h6 className="text-lg font-bold mb-3">What you'll bring:</h6>
              <ul className="list_work w-full">
                {[
                  "Passion for Human-Centered Design-a drive to make interactive technology better for people.",
                  "Thorough knowledge of UX/UI best practices.",
                  "Possess problem-solving skills, an investigative mentality, and a proactive nature-committed to delivering solutions."
                ].map((item, idx) => (
                  <li key={idx} className="flex text-gray-600 mb-3">
                    <FaRegDotCircle className="mt-1 mr-3 text-[#3d5999] flex-shrink-0" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div className="qualifications md:mt-10 mt-7">
              <h6 className="text-lg font-bold mb-3">Qualifications:</h6>
              <ul className="list_work w-full">
                {[
                  "Bachelor's degree preferred, or equivalent experience.",
                  "At least 5-8 years of experience with UX and UI design.",
                  "2 years of experience with design thinking or similar framework that focuses on defining users' needs early.",
                  "Strong portfolio showing expert concept, layout, and typographic skills, as well as creativity and ability to adhere to brand standards.",
                  "Expertise in Figma, Adobe Creative Cloud suite, Microsoft suite."
                ].map((item, idx) => (
                  <li key={idx} className="flex text-gray-600 mb-3">
                    <FaRegDotCircle className="mt-1 mr-3 text-[#3d5999] flex-shrink-0" />
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Images */}
            <div className="images md:mt-10 mt-7">
              <ul className="list_images grid xl:grid-cols-3 grid-cols-2 sm:gap-5 gap-4 gap-y-5 w-full">
                <li className="max-xl:col-span-2 flex items-center justify-center relative overflow-hidden rounded-lg bg-gray-200 h-48">
                  <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-gray-500">Video Preview</span>
                  </div>
                  <button className="absolute w-12 h-12 rounded-full bg-red-500 text-white duration-300 hover:bg-white hover:text-red-500 flex items-center justify-center">
                    <FaPlay />
                  </button>
                </li>
                <li className="relative overflow-hidden rounded-lg bg-gray-200 h-48">
                  <div className="w-full h-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Image 1</span>
                  </div>
                </li>
                <li className="relative overflow-hidden rounded-lg bg-gray-200 h-48">
                  <div className="w-full h-full bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Image 2</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="jobs_sidebar flex-shrink-0 lg:w-[380px] w-full h-fit">
            <div className="about overflow-hidden rounded-xl bg-white shadow-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300">
                <h6 className="text-lg font-bold">About the Employer</h6>
              </div>
              <div className="employer_info p-5">
                <a href="#" className="flex items-center gap-5 w-full mb-5">
                  <div className="flex-shrink-0 w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#3d5999]">
                    PE
                  </div>
                  <div>
                    <div className="rate flex items-center pb-1">
                      {[...Array(4)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                      <FaStar className="text-gray-300" />
                    </div>
                    <strong className="text-lg font-bold">PrimeEdge Solutions</strong>
                    <div className="text-gray-600 text-sm">Since December 11, 2020</div>
                  </div>
                </a>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600">Industry:</span>
                    <strong className="text-[#3d5999]">Internet Publishing</strong>
                  </div>
                  <div className="flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600">Company size:</span>
                    <strong className="text-[#3d5999]">150 Employees</strong>
                  </div>
                  <div className="flex items-center justify-between w-full py-5 border-b border-gray-300">
                    <span className="text-gray-600">Address:</span>
                    <strong className="text-[#3d5999]">3 SValley, Las Vegas, USA</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4 w-full py-5">
                    <span className="text-gray-600">Socials:</span>
                    <ul className="flex items-center gap-3">
                      {[
                        { icon: FacebookFilled, url: "https://www.facebook.com/" },
                        { icon: LinkedinFilled, url: "https://www.linkedin.com/" },
                        { icon: TwitterSquareFilled, url: "https://www.twitter.com/" },
                        { icon: InstagramFilled, url: "https://www.instagram.com/" },
                        { icon: PinterestFilled, url: "https://www.pinterest.com/" }
                      ].map(({ icon: Icon, url }, idx) => (
                        <li key={idx}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full text-black duration-300 hover:bg-[#3d5999] hover:text-white"
                          >
                            <Icon />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button className="w-full bg-[#3d5999] text-white py-3 rounded-lg font-medium hover:bg-[#2d3f6f] transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;