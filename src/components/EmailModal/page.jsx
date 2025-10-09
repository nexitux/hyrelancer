'use client';
import { useState, useEffect } from 'react';
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

const EmailVerificationModal = ({ isOpen, onClose, email, onResendEmail }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 5000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await onResendEmail();
      setCountdown(60); // Start 60 second countdown
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl max-w-md w-full p-8 transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#3A599C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaEnvelope className="w-8 h-8 text-[#3A599C]" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h3>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            We've sent a verification link to:
          </p>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="font-medium text-gray-900">{email}</p>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Click the link in the email to verify your account. If you don't see it, check your spam folder.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending || countdown > 0}
              className="w-full py-3 text-[#3A599C] font-medium border border-[#3A599C]/20 rounded-xl hover:bg-[#3A599C]/5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 w-4 h-4 border-2 border-[#3A599C] rounded-full animate-spin border-t-transparent"></div>
                  Sending...
                </div>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Email'
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#3A599C] text-white font-medium rounded-xl hover:bg-[#2d4577] transition-colors duration-200"
            >
              Continue
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            Having trouble? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;