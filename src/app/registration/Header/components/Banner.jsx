'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector
import Link from 'next/link';
import {
  FaShieldAlt, FaStar, FaBriefcase, FaCheckCircle, FaLock,
  FaImages, FaUsers, FaClock, FaRocket, FaPhone
} from "react-icons/fa";
import PhoneVerificationModal from './PhoneVerificationModal';

export default function Banner() {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { user } = useSelector((state) => state.auth); // Get user from Redux store

  const handleVerifyPhone = () => {
    setShowVerificationModal(true);
  };

  // Check if mobile number is verified
  const isMobileVerified = user?.mobile_verified_at && user.mobile_verified_at !== null;

  const marqueeItems = [
    { icon: <FaBriefcase className="text-sky-400" />, text: "Find Your Next Big Project" },
    { icon: <FaCheckCircle className="text-teal-400" />, text: "Thousands of Verified Clients" },
    { icon: <FaLock className="text-rose-400" />, text: "Secure & Timely Payments" },
    { icon: <FaImages className="text-indigo-400" />, text: "Build a Stunning Portfolio" },
    { icon: <FaUsers className="text-amber-400" />, text: "Collaborate with Top Companies" },
    { icon: <FaClock className="text-cyan-400" />, text: "Enjoy a Flexible Work Schedule" },
    { icon: <FaRocket className="text-lime-400" />, text: "Advance Your Freelance Career" },
  ];

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Marquee Container */}
          <div className="relative w-full flex-grow overflow-hidden group">
            {/* Gradient Fades for Edges */}
            <div className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
            <div className="absolute top-0 right-0 h-full w-40 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

            <div className="flex animate-marquee group-hover:pause">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <div key={index} className="flex items-center space-x-8 whitespace-nowrap px-6">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Verify Button - Only show if mobile is not verified */}
          {!isMobileVerified && (
            <div className="flex-shrink-0 w-full lg:w-auto">
              <button
                onClick={handleVerifyPhone}
                className="relative flex items-center justify-center gap-3 px-6 py-3 text-sm font-semibold bg-white text-slate-900 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 ease-in-out whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 active:bg-slate-100 group/button"
              >
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-slate-700">Verify Phone Number</span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 opacity-0 group-hover/button:opacity-100 transition-opacity duration-200 -z-10"></div>
              </button>
            </div>
          )}

        </div>
      </div>

      <PhoneVerificationModal 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)}
      />

      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .group-hover\\:pause:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </section>
  );
}