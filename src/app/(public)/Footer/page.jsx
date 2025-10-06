"use client";

import React, { useState } from 'react';
import Image from 'next/image'
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import AppStore from '../../../../public/images/app_store.png';
import GoogleStore from '../../../../public/images/gg_play.png'
import Logo from '../../../../public/images/Hyrelancer2.png'
import NexitLogo from '../../../../public/images/Nexit.png'
import api from '../../../config/api';
import { showSuccessNotification, showErrorNotification } from '../../../utils/notificationService';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorNotification('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showErrorNotification('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/subscribe', {
        email: email
      });

      if (response.status === 200 || response.status === 201) {
        showSuccessNotification('Thank you for subscribing! You will now receive our latest updates and exclusive offers.');
        setEmail(''); // Clear the input field
      }
    } catch (error) {
      console.error('Subscription error:', error);
      
      if (error.response?.status === 422) {
        const message = error.response.data?.message || 'Invalid email address';
        showErrorNotification(message);
      } else if (error.response?.status === 409) {
        showErrorNotification('This email is already subscribed to our newsletter');
      } else {
        showErrorNotification('Failed to subscribe. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="relative w-full min-h-screen bg-gray-100">
      {/* Background Image with People */}
      <div className="absolute inset-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='1920' height='1080' viewBox='0 0 1920 1080' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1920' height='1080' fill='%23F5F5F5'/%3E%3Ccircle cx='300' cy='400' r='80' fill='%23E0E0E0'/%3E%3Ccircle cx='1200' cy='350' r='60' fill='%23E0E0E0'/%3E%3C/svg%3E")`,
            filter: 'blur(2px) grayscale(0.8)'
          }}
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 flex items-end justify-center w-full min-h-screen pb-8">
        <div className="flex flex-col lg:flex-row items-end gap-8 w-full max-w-7xl px-4 lg:px-8">
          {/* Main Footer Content */}
          <div className="flex-1 bg-black/90 backdrop-blur-sm rounded-3xl p-6 lg:p-12 w-full">
            {/* Logo */}
            <div className="mb-8 lg:mb-12">
              <Image 
                src={Logo} 
                alt="Hyrelancer logo" 
                width={180} 
                height={43}
                className="w-auto h-auto"
              />
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 mb-8 lg:mb-12">
              {/* Our Company */}
              <nav className="flex flex-col items-start gap-4">
                <h3 className="text-xl font-semibold text-white leading-6 mb-2">
                  Our Company
                </h3>
                {companyLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-white hover:text-gray-300 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Locations */}
              <nav className="flex flex-col items-start gap-4">
                <h3 className="text-xl font-semibold text-white leading-6 mb-2">
                  Locations
                </h3>
                {locations.map((location, index) => (
                  <a
                    key={index}
                    href={location.href}
                    className="text-white hover:text-gray-300 transition-colors text-sm"
                  >
                    {location.name}
                  </a>
                ))}
              </nav>

              {/* Featured Services */}
              <nav className="flex flex-col items-start gap-4">
                <h3 className="text-xl font-semibold text-white leading-6 mb-2">
                  Featured Services
                </h3>
                {featuredServices.map((service, index) => (
                  <a
                    key={index}
                    href={service.href}
                    className="text-white hover:text-gray-300 transition-colors text-sm"
                  >
                    {service.name}
                  </a>
                ))}
              </nav>

              {/* Subscribe Section */}
              <div className="flex flex-col items-start gap-6">
                {/* Subscribe Form */}
                <form onSubmit={handleSubscribe} className="flex flex-col items-start gap-3 w-full max-w-sm">
                  <label className="text-white text-xl font-semibold">
                    Subscribe
                  </label>
                  
                  <div className="flex items-center w-full bg-blue-600 rounded-full p-1">
                    <div className="flex items-center flex-1 bg-white rounded-full px-4 py-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="enter your email"
                        required
                        disabled={isLoading}
                        className="w-full text-black text-sm border-0 outline-none bg-transparent placeholder-gray-500"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center w-10 h-10 bg-transparent border-0 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiArrowRight size={20} className="text-white" />
                      )}
                    </button>
                  </div>
                </form>

                {/* Contact Information */}
                <div className="flex flex-col gap-4">
                  <address className="text-white not-italic">
                    <span className="text-gray-400 text-sm">
                      Toll Free Customer Care
                    </span>
                    <br />
                    <a
                      href="tel:+11234560000"
                      className="text-white hover:underline text-sm"
                    >
                      +(1) 123 456 0000
                    </a>
                  </address>

                  <address className="text-white not-italic">
                    <span className="text-gray-400 text-sm">
                      Need live support?
                    </span>
                    <br />
                    <a
                      href="mailto:info@hyrelancer.com"
                      className="text-white hover:underline text-sm"
                    >
                      info@hyrelancer.com
                    </a>
                  </address>
                </div>

                {/* Social Media */}
                <div className="flex items-center gap-4">
                  <span className="text-white text-sm">Follow Us</span>
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                      <FaFacebookF size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                      <FaLinkedinIn size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                      <FaTwitter size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                      <FaInstagram size={14} />
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                      <FaYoutube size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-gray-600 pt-6">
              <div className="flex flex-col lg:flex-row items-center justify-between bg-gray-800/50 rounded-full px-4 lg:px-6 py-4 gap-4 lg:gap-0">
                <p className="text-gray-400 text-sm text-center lg:text-left">
                  Copyright © All Rights Reserved.2025
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">
                    Powered by
                  </span>
                  <Image
                    src={NexitLogo}
                    alt="Powered by NEXIT"
                    width={58}
                    height={25}
                    className="object-cover"
                  />
                </div>

                <nav className="flex items-center gap-2 lg:gap-4 flex-wrap justify-center">
                  {footerLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-gray-400 hover:underline transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* App Download Section */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 flex flex-col items-center gap-4 w-full lg:min-w-[280px] lg:w-auto">
            <span className="text-black font-medium text-lg">
              Download App!
            </span>
            <div className="flex flex-col gap-3">
              <a href="#" className="block">
                <Image src={GoogleStore} alt="Google Play Store" className="w-36 h-auto" />
              </a>
              <a href="#" className="block">
                <Image src={AppStore} alt="App Store" className="w-36 h-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;