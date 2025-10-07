"use client"

import React, { useState, useEffect } from 'react';
import { Button, Checkbox, message, Spin } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import api, { termsAPI } from "@/config/api";
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
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [termsData, setTermsData] = useState([]);
  const [mainDescription, setMainDescription] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(isRegistrationFlow); // Show modal only in registration flow
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const router = useRouter();

  // Fetch terms and conditions data
  useEffect(() => {
    const fetchTermsData = async () => {
      try {
        setDataLoading(true);
        const response = await termsAPI.getTermsAndConditions();
        
        if (response.status === 'success' && response.data) {
          // Sort by tc_number
          const sortedData = response.data.sort((a, b) => a.tc_number - b.tc_number);
          
          // Find main description (tc_number = 0)
          const mainDesc = sortedData.find(item => item.tc_number === 0);
          if (mainDesc) {
            setMainDescription(mainDesc.tc_content);
          }
          
          // Filter out main description and set terms data
          const termsSections = sortedData.filter(item => item.tc_number !== 0);
          setTermsData(termsSections);
          
          // Find the latest updated date
          const latestUpdate = sortedData.reduce((latest, item) => {
            const itemDate = new Date(item.updated_at);
            const latestDate = new Date(latest);
            return itemDate > latestDate ? item.updated_at : latest;
          }, sortedData[0]?.updated_at || '');
          
          if (latestUpdate) {
            const date = new Date(latestUpdate);
            setLastUpdated(date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            }));
          }
          
          // Initialize expanded sections - first section expanded by default
          const initialExpanded = {};
          termsSections.forEach((_, index) => {
            initialExpanded[`section${index}`] = index === 0;
          });
          setExpandedSections(initialExpanded);
        }
      } catch (error) {
        console.error('Error fetching terms data:', error);
        message.error('Failed to load terms and conditions. Please try again.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchTermsData();
  }, []);

  // Utility function to convert URLs to clickable links
  const convertUrlsToLinks = (text) => {
    if (!text) return text;
    
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    
    return text.replace(urlRegex, (url) => {
      // Add https:// if it starts with www.
      const href = url.startsWith('www.') ? `https://${url}` : url;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${url}</a>`;
    });
  };

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
                  <span className="text-xs text-gray-500">
                    Last updated: {lastUpdated || 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {dataLoading ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : (
                <>
                  {mainDescription && (
                    <div 
                      className="text-gray-700 leading-relaxed mb-6 terms-content"
                      dangerouslySetInnerHTML={{ __html: convertUrlsToLinks(mainDescription) }}
                    />
                  )}
                </>
              )}

              {/* Dynamic Terms Sections */}
              {!dataLoading && termsData.map((term, index) => {
                const sectionKey = `section${index}`;
                const isExpanded = expandedSections[sectionKey] || false;
                
                return (
                  <div key={term.tc_id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg text-blue-600">
                          {index === 0 && <InfoCircleOutlined className="text-lg" />}
                          {index === 1 && <LockOutlined className="text-lg" />}
                          {index >= 2 && <FileTextOutlined className="text-lg" />}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {term.tc_number}. {term.tc_heading || 'Terms Section'}
                        </h3>
                      </div>
                      {isExpanded ? (
                        <UpOutlined className="text-gray-500" />
                      ) : (
                        <DownOutlined className="text-gray-500" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-4 pt-2 bg-white">
                        <div 
                          className="text-gray-600 leading-relaxed terms-content"
                          dangerouslySetInnerHTML={{ __html: convertUrlsToLinks(term.tc_content) }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Agreement Checkbox - Only show when data is loaded */}
              {!dataLoading && (
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
              )}
            </div>
          </div>

          {/* Footer Actions - Only show when data is loaded */}
          {!dataLoading && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default TermsAndConditions;