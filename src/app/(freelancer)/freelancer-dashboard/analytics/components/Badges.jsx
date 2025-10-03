"use client";
import { useState, useEffect } from "react";
import { User, Clock, CheckCircle, Mail, X, Edit3, Phone, Mail as MailIcon } from "lucide-react";
import api from '@/config/api';

// Format relative time
const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Individual contact request card
const ContactRequestCard = ({ request, onOpenModal }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    onOpenModal(request);
  };

  return (
    <div className="p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        {/* Customer Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-full bg-blue-50 border-2 border-blue-200">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">
              {request.sender?.name || 'Unknown Customer'}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {getRelativeTime(request.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Accept Button */}
        {accepted ? (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Accepted</span>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Accept</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Contact Details Modal Component
const ContactDetailsModal = ({ isOpen, onClose, request, onConfirm }) => {
  const [step, setStep] = useState('select'); // 'select' or 'form'
  const [contactType, setContactType] = useState(''); // 'registered' or 'custom'
  const [customEmail, setCustomEmail] = useState('');
  const [customMobile, setCustomMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock registered details - in real app, these would come from user profile
  const registeredEmail = 'john.doe@example.com';
  const registeredMobile = '+1 (555) 123-4567';

  const handleSelectType = (type) => {
    setContactType(type);
    if (type === 'registered') {
      handleConfirm(type);
    } else {
      setStep('form');
    }
  };

  const handleConfirm = async (type = contactType) => {
    setIsSubmitting(true);
    try {
      let contactDetails = null;
      
      if (type === 'registered') {
        // For registered contact, send null (API will use registered details)
        contactDetails = null;
      } else {
        // For custom contact, send the entered details
        contactDetails = { 
          email: customEmail, 
          mobile: customMobile 
        };
      }
      
      await onConfirm(request.sc_id, contactDetails);
      onClose();
    } catch (error) {
      console.error('Error confirming contact details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setContactType('');
    setCustomEmail('');
    setCustomMobile('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Share Contact Details</h3>
            <p className="text-sm text-gray-500 mt-1">
              Confirm contact information to share with {request?.sender?.name || 'customer'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-6">
                How would you like to share your contact details?
              </p>
              
              {/* Send Registered Contact Button */}
              <button
                onClick={() => handleSelectType('registered')}
                disabled={isSubmitting}
                className="w-full p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Send Registered Contact</span>
              </button>

              {/* Send New Contact Button */}
              <button
                onClick={() => handleSelectType('custom')}
                disabled={isSubmitting}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Edit3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Send New Contact</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Enter Contact Details</h4>
                <p className="text-sm text-gray-600">
                  Provide the contact information you want to share
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={customMobile}
                      onChange={(e) => setCustomMobile(e.target.value)}
                      placeholder="Enter mobile number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          {step === 'form' && (
            <button
              onClick={() => setStep('select')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          {step === 'form' && (
            <button
              onClick={() => handleConfirm()}
              disabled={isSubmitting || !customEmail || !customMobile}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Share Contact</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Contact Requests component
export default function ContactRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchContactRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('/share-contact');
        
        // Filter only pending requests (sc_message_id === 1 means pending)
        const pendingRequests = (response.data?.data || []).filter(
          req => req.sc_message_id === 1 && req.sender
        );
        
        setRequests(pendingRequests);
        setError(null);
      } catch (err) {
        console.error('Error fetching contact requests:', err);
        setRequests([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContactRequests();
  }, []);

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleConfirmContact = async (requestId, contactDetails) => {
    try {
      // Prepare the request body based on contact type
      const requestBody = contactDetails ? {
        mobile: contactDetails.mobile,
        email: contactDetails.email
      } : null;

      // Encode the sc_id to base64 before passing to the endpoint
      const encodedId = btoa(requestId.toString());
      const endpoint = `/share-contact/reply/${encodedId}`;
      
      await api.post(endpoint, requestBody);
      
      // Remove accepted request from list
      setRequests(prev => prev.filter(req => req.sc_id !== requestId));
      
      // Redirect to messages (you can implement this based on your routing)
      // window.location.href = '/freelancer-dashboard/message';
      console.log('Contact shared successfully, redirecting to messages...');
    } catch (error) {
      console.error('Error sharing contact details:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-[32rem] flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Contact Requests</h3>
            <p className="text-sm text-gray-500 mt-1">Customer requests for your contact details</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 pr-2">
            {[1, 2, 3].map((index) => (
              <div key={index} className="animate-pulse">
                <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-[32rem] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Contact Requests</h3>
          <p className="text-sm text-gray-500 mt-1">
            {requests.length} {requests.length === 1 ? 'pending request' : 'pending requests'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium text-gray-600">
            {requests.length}
          </span>
        </div>
      </div>

      {/* Requests List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {requests.length > 0 ? (
          <div className="space-y-3 pr-2">
          {requests.map((request) => (
            <ContactRequestCard 
              key={request.sc_id} 
              request={request}
              onOpenModal={handleOpenModal}
            />
          ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-3">
              <Mail className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-1">No Pending Requests</h3>
            <p className="text-sm text-gray-500">
              You'll see contact requests from customers here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Accept requests to share your contact information with customers
          </span>
        </div>
      </div>

      {/* Contact Details Modal */}
      <ContactDetailsModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        request={selectedRequest}
        onConfirm={handleConfirmContact}
      />
    </div>
  );
}