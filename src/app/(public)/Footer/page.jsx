"use client";

import React, { useState } from 'react';
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { FiArrowRight, FiChevronDown } from "react-icons/fi";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const companyLinks = [
    { label: "About Us", href: "#about" },
    { label: "Categories", href: "#categories" },
    { label: "Create Services", href: "#create-services" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const locations = [
    { name: "Kochi", href: "#kochi" },
    { name: "Thrissur", href: "#thrissur" },
    { name: "Alappuzha", href: "#alappuzha" },
    { name: "Bangalore", href: "#bangalore" },
    { name: "Chennai", href: "#chennai" },
  ];

  const featuredServices = [
    { name: "Plumbing Services", href: "#plumbing" },
    { name: "Electrical Works", href: "#electrical" },
    { name: "AC Repair & Maintenance", href: "#ac-repair" },
    { name: "Deep Cleaning Services", href: "#deep-cleaning" },
    { name: "Home Appliance Repair", href: "#appliance-repair" },
  ];

  const footerLinks = [
    { label: "Content Privacy", href: "#content-privacy" },
    { label: "Privacy Policy", href: "#privacy-policy" },
    { label: "Terms of Service", href: "#terms-of-service" },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      alert('Thank you for subscribing!');
      setEmail('');
      setIsLoading(false);
    }, 1000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="w-full bg-white">
      <footer className="relative rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] overflow-hidden min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] mx-auto max-w-[1850px] my-2 sm:my-4 lg:my-8 pb-0 sm:pb-0 lg:pb-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Mobile: Background image with proper fit */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden mx-1 rounded-2xl"
            style={{
              backgroundImage: "url('/images/FOOTERBG.png')"
            }}
          ></div>
          {/* Mobile: subtle overlay for text readability */}
          <div className="absolute inset-0 md:hidden mx-1 rounded-2xl bg-black/25"></div>
          {/* Tablet and Desktop: Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center hidden md:block"
            style={{
              backgroundImage: "url('/images/FOOTERBG.png')",
              filter: 'grayscale(0.8)'
            }}
          />
          {/* Overlay for tablet and desktop only */}
          <div className="absolute inset-0 bg-black/50 lg:bg-black/70 hidden md:block"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Top Section - Main Footer Content */}
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 pt-4 sm:pt-6 lg:pt-8">
            <div className="max-w-7xl mx-auto">
              {/* Logo */}
              <div className="flex justify-left items-left mb-4 sm:mb-6 lg:mb-0">
                <img
                  src="/images/hyrelancerWhite.png"
                  alt="Hyrelancer Logo"
                  className="h-12 w-20 xs:h-26 xs:w-48 sm:h-40 sm:w-32 md:h-24 md:w-36 lg:h-30 lg:w-40"
                />
              </div>

              {/* Navigation Grid - Mobile First Approach */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-4 sm:mb-6 lg:mb-10">
                {/* Our Company */}
                <nav className="flex flex-col gap-1 sm:gap-2 lg:gap-3 items-center sm:items-start">
                  <button 
                    onClick={() => toggleSection('company')}
                    className="flex items-center justify-between w-full md:w-auto text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-400 mb-1 sm:mb-2 text-center sm:text-left md:justify-start"
                  >
                    Our Company
                    <FiChevronDown 
                      className={`ml-2 transition-transform duration-200 md:hidden ${
                        expandedSections.company ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <div className={`w-full md:block ${expandedSections.company ? 'block' : 'hidden md:block'}`}>
                    {companyLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        className="block text-white hover:text-gray-300 transition-colors text-xs sm:text-sm md:text-md leading-tight text-center sm:text-left py-1"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </nav>

                {/* Locations */}
                <nav className="flex flex-col gap-1 sm:gap-2 lg:gap-3 items-center sm:items-start">
                  <button 
                    onClick={() => toggleSection('locations')}
                    className="flex items-center justify-between w-full md:w-auto text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-400 mb-1 sm:mb-2 text-center sm:text-left md:justify-start"
                  >
                    Locations
                    <FiChevronDown 
                      className={`ml-2 transition-transform duration-200 md:hidden ${
                        expandedSections.locations ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <div className={`w-full md:block ${expandedSections.locations ? 'block' : 'hidden md:block'}`}>
                    {locations.map((location, index) => (
                      <a
                        key={index}
                        href={location.href}
                        className="block text-white hover:text-gray-300 transition-colors text-xs sm:text-sm md:text-md leading-tight text-center sm:text-left py-1"
                      >
                        {location.name}
                      </a>
                    ))}
                  </div>
                </nav>

                {/* Featured Services */}
                <nav className="flex flex-col gap-1 sm:gap-2 lg:gap-3 items-center sm:items-start">
                  <button 
                    onClick={() => toggleSection('services')}
                    className="flex items-center justify-between w-full md:w-auto text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-400 mb-1 sm:mb-2 text-center sm:text-left md:justify-start"
                  >
                    Featured Services
                    <FiChevronDown 
                      className={`ml-2 transition-transform duration-200 md:hidden ${
                        expandedSections.services ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  <div className={`w-full md:block ${expandedSections.services ? 'block' : 'hidden md:block'}`}>
                    {featuredServices.map((service, index) => (
                      <a
                        key={index}
                        href={service.href}
                        className="block text-white hover:text-gray-300 transition-colors text-xs sm:text-sm md:text-md leading-tight text-center sm:text-left py-1"
                      >
                        {service.name}
                      </a>
                    ))}
                  </div>
                </nav>

                {/* Subscribe Section - Full width on mobile, then responsive */}
                <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-7 w-full md:col-span-3 xl:col-span-1 items-center sm:items-start">
                  {/* Subscribe Input */}
                  <div className="flex flex-col gap-1 sm:gap-2 lg:gap-3 w-full">
                    <label className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-semibold mb-0 text-center sm:text-left">
                      Subscribe
                    </label>
                    <div className="flex items-center bg-[#375a9f] rounded-full px-1 py-1 w-full">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className="flex-1 bg-white rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-black text-xs sm:text-sm md:text-md outline-none placeholder-gray-500 border-none text-center sm:text-left"
                      />
                      <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ml-1 sm:ml-2 cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiArrowRight size={14} className="text-white sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center w-full mt-1 mb-1 gap-1 sm:gap-2 md:gap-0">
                    <div className="flex flex-col items-center sm:items-start gap-0">
                      <span className="text-gray-400 text-[8px] sm:text-[10px] md:text-[12px] font-medium text-center sm:text-left">Toll Free Customer Care</span>
                      <a
                        href="tel:+11234560000"
                        className="text-white font-semibold text-[10px] sm:text-[12px] md:text-[14px] leading-tight hover:underline text-center sm:text-left"
                      >
                        +(1) 123 456 0000
                      </a>
                    </div>
                    <div className="flex flex-col items-center sm:items-start gap-0">
                      <span className="text-gray-400 text-[8px] sm:text-[10px] md:text-[12px] font-medium text-center sm:text-left">Need live support?</span>
                      <a
                        href="mailto:info@hyrelancer.com"
                        className="text-white font-semibold text-[10px] sm:text-[12px] md:text-[14px] leading-tight hover:underline break-all text-center sm:text-left"
                      >
                        info@hyrelancer.com
                      </a>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="flex flex-row items-center w-full justify-center sm:justify-start gap-1 sm:gap-2">
                    <span className="text-white text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">Follow Us</span>
                    <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-gray-800 transition-colors ml-1 sm:ml-2">
                      <FaFacebookF size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </a>
                    <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-gray-800 transition-colors">
                      <FaInstagram size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </a>
                    <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-gray-800 transition-colors">
                      <FaTwitter size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </a>
                    <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-gray-800 transition-colors">
                      <FaLinkedinIn size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </a>
                    <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-gray-800 transition-colors">
                      <FaYoutube size={12} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Responsive positioning */}
          <div className="flex justify-center lg:justify-start px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 relative lg:absolute lg:top-110">
            <div className="w-full max-w-4xl lg:mx-80 mb-4 sm:mb-8 lg:mb-20">
              {/* Divider on top */}
          <div className="w-full h-px bg-white/40 mb-3 sm:mb-6 lg:mb-15"></div>
          <div className="backdrop-blur-sm bg-[#3636368F]/50 sm:bg-[#3636368F]/70 lg:bg-[#3636368F]/90 rounded-2xl sm:rounded-full px-3 sm:px-4 md:px-6 lg:px-12 xl:px-20 py-3 sm:py-3 md:py-4 lg:py-6 flex flex-col sm:flex-row items-center justify-between w-full shadow-lg gap-2 sm:gap-2 md:gap-3 lg:gap-0">
                {/* Copyright and Powered By */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-3">
                  <span className="text-white text-[8px] sm:text-[10px] md:text-xs lg:text-sm whitespace-nowrap text-center sm:text-left">
                    Copyright © All Rights Reserved.2025
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-gray-400 text-[8px] sm:text-[10px] md:text-xs whitespace-nowrap">Powered by</span>
                    <img
                      src="/images/Nexit.png"
                      alt="NEXIT"
                      className="h-3 w-6 sm:h-4 sm:w-8 md:h-5 md:w-10 lg:h-6 lg:w-13 rounded-full object-fill"
                    />
                  </div>
                </div>
                {/* Legal Links */}
                <nav className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap justify-center sm:justify-end">
                  {footerLinks.map((link, index) => (
                    <React.Fragment key={index}>
                      <a
                        href={link.href}
                        className="text-white hover:text-gray-300 transition-colors text-[8px] sm:text-[10px] md:text-xs lg:text-sm whitespace-nowrap"
                      >
                        {link.label}
                      </a>
                      {index < footerLinks.length - 1 && <span className="text-gray-400 text-[8px] sm:text-[10px] md:text-xs mx-1 sm:mx-2"></span>}
                    </React.Fragment>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Large Screen Layout - Curved Design - Only for 1300px+ screens */}
        <div className="absolute bottom-0 right-0 bg-white rounded-tl-[30px] w-96 xl:w-[440px] h-40 items-center justify-center px-8 py-6 z-20 hidden xl:flex flex-col">
          {/* SVG curve - Left side */}
          <div className="absolute -left-4 bottom-0">
            <svg width="16" height="16" className="w-4 h-4" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 20V0C20 12 12 20 0 20H20Z" />
            </svg>
          </div>

          {/* SVG curve - Top side */}
          <div className="absolute bottom-30 left-90 -translate-y-[40px]">
            <svg
              width="80"
              height="56"
              className="w-20 h-14"
              viewBox="0 0 80 56"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M80 56V0C80 42 48 56 0 56H80Z" />
            </svg>
          </div>

          <span className="text-gray-800 font-semibold text-lg mb-4 text-center">
            Download App!
          </span>
          <div className="flex gap-3">
            <a href="#" className="flex items-center gap-1 bg-black text-white px-4 py-3 rounded-lg hover:opacity-80 transition-opacity">
              <img src="/images/google-play.png" alt="Google Play" className="h-7 w-auto" />
            </a>
            <a href="#" className="flex items-center gap-1 bg-black text-white px-4 py-3 rounded-lg hover:opacity-80 transition-opacity">
              <img src="/images/app_store.png" alt="App Store" className="h-7 w-auto" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;