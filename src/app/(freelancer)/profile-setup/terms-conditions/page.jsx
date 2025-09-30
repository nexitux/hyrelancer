"use client"

import React, { useState } from 'react';
import { Button, Checkbox, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import api from "@/config/api";
import {
  InfoCircleOutlined,
  LockOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons';
import { updateUserProfile } from '@/redux/slices/authSlice';
import AIPlanOfferModal from '../offerPage/page';

const TermsAndConditions = ({ onNext, onBack, isRegistrationFlow = false, isRegistration = false, showCompletionModal }) => {
  const [agreed, setAgreed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    section1: true,
    section2: false,
    section3: false
  });
  const [loading, setLoading] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(isRegistrationFlow); // Show modal only in registration flow
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const router = useRouter();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (e) => {
    setAgreed(e.target.checked);
  };

  const fetchCurrentUserAndUpdate = async (authToken) => {
    try {
      const me = await api.get('/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (me?.data?.user) {
        dispatch(updateUserProfile(me.data.user));
        return me.data.user;
      }
    } catch (err) {
      console.warn('Failed to fetch /me after accepting terms', err);
    }
    return null;
  };

  const handleOfferModalClose = () => {
    setShowOfferModal(false);
  };

  const handleAccept = async () => {
    if (!agreed) return;

    if (!token) {
      message.error('Authentication required. Please login to continue.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/storeterms', {
        agree: "1"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Prefer server-returned user object if available
      if (response?.data) {
        if (response.data.user) {
          // Update redux with server returned user
          dispatch(updateUserProfile(response.data.user));
        } else {
          // Otherwise fetch the latest user state from /me and update redux
          await fetchCurrentUserAndUpdate(token);
        }

        message.success('Terms accepted successfully!');

        // Show completion modal if in registration flow
        if (isRegistration && showCompletionModal) {
          showCompletionModal(
            "Registration Complete! 🎊",
            "Congratulations! Your profile setup is complete. Welcome to Hyerlancer!",
            "Go to Dashboard"
          );
        }

        // Redirect only after Redux/user has been updated
        router.replace('/');
        return;
      }

      message.error('Unexpected server response. Please try again.');
    } catch (error) {
      console.error('Terms API Error:', error?.response || error);
      message.error('Failed to accept terms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Offer Modal - only shows in registration flow */}
      <AIPlanOfferModal
        isOpen={showOfferModal}
        onClose={handleOfferModalClose}
      />

      {/* Terms Content */}
      <div className="bg-gray-50 flex justify-center p-4">
        <div className="w-full max-w-7xl bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-white border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <img
                  src="/images/logo.jpg"
                  alt="Company Logo"
                  className="w-14 h-14"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium text-blue-600">Hyerlancer</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">Last updated: July 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed mb-6">
                Welcome to <span className="font-semibold text-blue-600">Hyerlancer</span> services.
                These Terms govern your use of our platform and services.
              </p>

              {/* Section 1 - Accordion */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('section1')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg text-blue-600">
                      <InfoCircleOutlined className="text-lg" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">1. Agreement to Terms</h3>
                  </div>
                  {expandedSections.section1 ? (
                    <UpOutlined className="text-gray-500" />
                  ) : (
                    <DownOutlined className="text-gray-500" />
                  )}
                </button>
                {expandedSections.section1 && (
                  <div className="p-4 pt-2 bg-white">
                    <p className="text-gray-600 leading-relaxed">
                      By accessing or using our services, you agree to comply with and be bound by these Terms and Conditions.
                      If you do not agree with any part of these terms, you are not permitted to use our services.
                      You agree to use our services only for lawful purposes and in a manner that does not infringe the rights of others.
                      Providing false information or engaging in unauthorized activities may result in suspension or termination of your access.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 2 - Accordion */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('section2')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg text-blue-600">
                      <LockOutlined className="text-lg" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">2. Privacy Policy</h3>
                  </div>
                  {expandedSections.section2 ? (
                    <UpOutlined className="text-gray-500" />
                  ) : (
                    <DownOutlined className="text-gray-500" />
                  )}
                </button>
                {expandedSections.section2 && (
                  <div className="p-4 pt-2 bg-white">
                    <p className="text-gray-600 leading-relaxed">
                      Our Privacy Policy outlines how we collect, use, and safeguard your personal data. By using our services,
                      you consent to the collection and use of your data in accordance with our Privacy Policy.
                      We implement appropriate security measures to protect against unauthorized access, alteration, disclosure,
                      or destruction of your personal information.
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3 - Accordion */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('section3')}
                  className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg text-blue-600">
                      <FileTextOutlined className="text-lg" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">3. Content Ownership</h3>
                  </div>
                  {expandedSections.section3 ? (
                    <UpOutlined className="text-gray-500" />
                  ) : (
                    <DownOutlined className="text-gray-500" />
                  )}
                </button>
                {expandedSections.section3 && (
                  <div className="p-4 pt-2 bg-white">
                    <p className="text-gray-600 leading-relaxed">
                      All content, including text, graphics, logos, and software, remains the exclusive property of
                      Hyerlancer and its licensors. You may not reproduce, distribute, or create derivative works
                      without prior written consent. Any unauthorized use of the content may violate copyright laws,
                      trademark laws, and other applicable regulations.
                    </p>
                  </div>
                )}
              </div>

              {/* Agreement Checkbox */}
              <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  checked={agreed}
                  onChange={handleCheckboxChange}
                  className="w-full"
                >
                  <div className="ml-3">
                    <span className="block font-medium text-gray-800">I accept the Terms and Conditions</span>
                    <span className="block text-sm text-gray-500 mt-1">
                      By checking this box, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions outlined above.
                    </span>
                  </div>
                </Checkbox>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium bg-white hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={!agreed || loading}
              onClick={() => {
                if (isRegistration && showCompletionModal) {
                  showCompletionModal(
                    "Registration Complete! 🎊",
                    "Congratulations! Your profile setup is complete. Welcome to Hyerlancer!",
                    "Go to Dashboard"
                  );
                }
                handleAccept();
              }}
              loading={loading}
              className={`px-6 py-3 rounded-lg font-medium ${agreed && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              {loading ? 'Processing...' : 'Accept & Continue'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;