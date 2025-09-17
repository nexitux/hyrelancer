"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Phone, Check, RefreshCcw } from 'lucide-react';

// Define your API base URL here
const API_BASE_URL = 'https://backend.hyrelancer.in/api';

const PhoneVerificationModal = ({ isOpen, onClose, phoneNumber = '9876543210' }) => {
  const [currentStep, setCurrentStep] = useState('otp-input');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef([]);

  // flexible backend success detection
  const isBackendSuccess = (data) => {
    if (!data) return false;
    const s = data.status;
    const msg = (data.message || data.remark || '').toString().toLowerCase();

    return (
      s === 1 ||
      s === '1' ||
      s === true ||
      (typeof s === 'string' && s.toLowerCase() === 'success') ||
      (typeof s === 'string' && s.toLowerCase() === 'ok') ||
      msg.includes('sent') ||
      msg.includes('success') ||
      msg.includes('otp') ||
      msg.includes('verified')
    );
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('otp-input');
      setOtpValues(['', '', '', '', '', '']);
      setCountdown(30);
      setOtpError('');
      // Focus first input after short delay
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      setOtpError(''); // Clear error on change

      // Auto-advance to next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle OTP input keydown
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async () => {
    const otpJoined = otpValues.join('').replace(/\D/g, '');
    if (otpJoined.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber, otp: otpJoined }),
      });

      const data = await response.json();
      console.log('phone verification response ->', data);

      if (response.ok && isBackendSuccess(data)) {
        setCurrentStep('success');
      } else {
        setOtpError(data.message || data.remark || 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      console.error('handleOtpSubmit error', error);
      setOtpError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setOtpValues(['', '', '', '', '', '']); // Clear OTP inputs on resend
    setOtpError('');

    try {
      const response = await fetch(`${API_BASE_URL}/send-verification-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phoneNumber }),
      });

      const data = await response.json();
      console.log('resend otp response ->', data);

      if (response.ok && isBackendSuccess(data)) {
        setCountdown(30);
        setOtpValues(['', '', '', '', '', '']);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
      } else {
        setOtpError(data.message || data.remark || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('handleResendOtp error', error);
      setOtpError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue after success
  const handleContinue = () => {
    onClose();
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'otp-input':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Verify Your Phone</h2>
              <div className="space-y-1">
                <p className="text-sm sm:text-base text-gray-600">Enter the 6-digit code sent to</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">
                  {phoneNumber ? `+91 ${phoneNumber}` : 'your mobile number'}
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-6">
              <div className="flex gap-2 sm:gap-3 justify-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => otpInputRefs.current[index] = el}
                    type="text"
                    value={otpValues[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold text-gray-800 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg bg-gray-50 focus:bg-white outline-none transition-all duration-200"
                    maxLength={1}
                    inputMode="numeric"
                  />
                ))}
              </div>
              {otpError && <p className="text-sm text-red-600 text-center -mt-2">{otpError}</p>}

              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={`text-xs sm:text-sm font-medium transition-colors ${countdown > 0 || isLoading
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-700'
                    }`}
                >
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : isLoading
                      ? 'Sending...'
                      : 'Resend verification code'
                  }
                </button>
              </div>

              <button
                onClick={handleOtpSubmit}
                disabled={!otpValues.every(value => value !== '') || isLoading}
                className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Phone Number'
                )}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Congratulations!</h2>
                <h3 className="text-lg sm:text-xl font-semibold text-green-600">Phone Number Verified</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-gray-600">Your phone number has been successfully verified.</p>
                <p className="text-sm sm:text-base text-gray-600">You now have access to all platform features!</p>
                <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-green-50 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Verification Badge Earned</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full h-12 sm:h-14 bg-green-600 hover:bg-green-700 text-white font-medium text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Continue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-51 animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg relative animate-scaleIn">
        {/* Header with close button */}
        <div className="flex items-center justify-end mb-6 sm:mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>

        {/* Step content */}
        <div className="transition-all duration-300 ease-in-out">
          {renderStepContent()}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PhoneVerificationModal;