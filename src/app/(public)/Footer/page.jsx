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
import Logo from '../../../../public/images/image.png'
import api from '../../../config/api';
import { showSuccessNotification, showErrorNotification } from '../../../utils/notificationService';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <footer className="px-6 pt-12 pb-6 text-white bg-black sm:px-8">
  <div className="mx-auto max-w-7xl">
    {/* Top Row */}
    <div className="flex flex-col gap-6 justify-between items-center mb-12 sm:flex-row">
      {/* Logo */}
      <div>
        <Image src={Logo} alt="hyrelancer-logo" className="w-36 h-auto" />
      </div>

      {/* Social Icons */}
      <div className="flex flex-col gap-2 items-center sm:flex-row sm:gap-4">
        <span className="text-sm text-gray-400 md:text-base">Follow Us:</span>
        <div className="flex gap-3">
          <a href="#" className="text-gray-400 transition-colors hover:text-blue-600"><FaFacebookF size={20} /></a>
          <a href="#" className="text-gray-400 transition-colors hover:text-white"><FaLinkedinIn size={20} /></a>
          <a href="#" className="text-gray-400 transition-colors hover:text-sky-400"><FaTwitter size={20} /></a>
          <a href="#" className="text-gray-400 transition-colors hover:text-pink-400"><FaInstagram size={20} /></a>
          <a href="#" className="text-gray-400 transition-colors hover:text-red-600"><FaYoutube size={20} /></a>
        </div>
      </div>
    </div>

    {/* Grid Columns */}
    <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4">
      {/* Our Company */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Our Company</h3>
        <ul className="space-y-2 text-sm md:text-base">
          <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Categories</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Create Services</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
        </ul>
      </div>

      {/* Locations */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Locations</h3>
        <ul className="space-y-2 text-sm md:text-base">
          <li><a href="#" className="text-gray-400 hover:text-white">Kochi</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Thrissur</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Alappuzha</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Bangalore</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Chennai</a></li>
        </ul>
      </div>

      {/* Featured Services */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Featured Services</h3>
        <ul className="space-y-2 text-sm md:text-base">
          <li><a href="#" className="text-gray-400 hover:text-white">Plumbing Services</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Electrical Works</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">AC Repair & Maintenance</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Deep Cleaning Services</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Home Appliance Repair</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Pest Control Services</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Carpentry & Woodwork</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white">Painting & Renovation</a></li>
        </ul>
      </div>

      {/* Subscribe + App Download */}
      <div>
        {/* Subscribe */}
        <div className="mb-6 space-y-3">
          <h3 className="text-lg font-semibold text-white">Subscribe</h3>
          <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              disabled={isLoading}
              className="flex-1 px-4 py-2 placeholder-gray-400 text-white bg-gray-800 rounded-md md:rounded-l-md md:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="flex justify-center items-center px-4 py-2 mt-2 bg-blue-600 rounded-md transition-colors hover:bg-blue-700 md:mt-0 md:rounded-r-md md:rounded-l-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiArrowRight size={20} />
              )}
            </button>
          </form>
        </div>

        {/* App Download */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Download App</h4>
          <div className="flex flex-col gap-3 md:flex-row">
            <a href="#" className="block w-36">
              <Image src={GoogleStore} alt="Google Play Store" className="w-full h-auto" />
            </a>
            <a href="#" className="block w-36">
              <Image src={AppStore} alt="App Store" className="w-full h-auto" />
            </a>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Bottom */}
    <div className="pt-6 mt-6 border-t border-gray-800">
      <div className="flex flex-col gap-4 justify-between items-center text-sm text-gray-400 md:flex-row">
        <div>©2025 Hyrelancer. All Rights Reserved.</div>
        <div className="flex flex-col items-center justify-center">
            <span className="text-xs text-gray-500 mb-1 text-center w-full">Powered by</span>
            <div className="flex items-center justify-center gap-2 w-full">
              <Image src="/images/Nexit.png" alt="Powered by Company" width={100} height={30} className="h-6 w-auto object-contain mx-auto" />
            </div>
          </div>
        <div className="flex gap-4 items-center">
          <a href="#" className="transition-colors hover:text-white">Terms Of Services</a>
          
          <span className="hidden text-gray-600 md:inline">|</span>
          <a href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</a>
        </div>
      </div>
    </div>
  </div>
</footer>

  );
};

export default Footer;