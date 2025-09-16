"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, Phone, Mail, Check, RefreshCcw } from 'lucide-react';

// Define your API base URL here
const API_BASE_URL = 'https://test.hyrelancer.in/api';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState('choose-method');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [mobileError, setMobileError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [emailError, setEmailError] = useState('');
    const otpInputRefs = useRef([]);
    const router = useRouter();

    const normalizeMobile = (m) => {
        if (!m) return '';
        const digits = String(m).replace(/\D/g, '');
        if (digits.length <= 10) return digits;
        return digits.slice(-10);
    };

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
            setCurrentStep('choose-method');
            setMobileNumber('');
            setEmail('');
            setOtpValues(['', '', '', '', '', '']);
            setCountdown(0);
            setMobileError('');
            setOtpError('');
            setEmailError('');
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

    const handleBack = () => {
        if (currentStep === 'mobile-input' || currentStep === 'email-input') {
            setCurrentStep('choose-method');
            setMobileError('');
            setEmailError('');
        } else if (currentStep === 'otp-input') {
            setCurrentStep('mobile-input');
            setOtpError('');
        } else if (currentStep === 'email-sent') {
            setCurrentStep('email-input');
        }
    };

    const handleMobileSubmit = async () => {
        const payloadMobile = normalizeMobile(mobileNumber);

        if (!payloadMobile || payloadMobile.length !== 10) {
            setMobileError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setMobileError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: payloadMobile }),
            });

            const data = await response.json();
            console.log('forgot send-otp response ->', data);

            // flexible success detection
            if (response.ok && isBackendSuccess(data)) {
                setCurrentStep('otp-input');
                setCountdown(30);
                // ensure phoneNumber is normalized for later steps
                setMobileNumber(payloadMobile);
                // optionally focus first otp input after short delay
                setTimeout(() => otpInputRefs.current[0]?.focus(), 80);
            } else {
                // handle validation object or string message
                if (data && typeof data.message === 'object') {
                    setMobileError(data.message.mobile || JSON.stringify(data.message) || 'Failed to send OTP. Please try again.');
                } else {
                    setMobileError(data.message || data.remark || 'Failed to send OTP. Please try again.');
                }
            }
        } catch (error) {
            console.error('handleMobileSubmit error', error);
            setMobileError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async () => {
        const otpJoined = otpValues.join('').replace(/\D/g, '');
        if (otpJoined.length !== 6) {
            setOtpError('Please enter the 6-digit code.');
            return;
        }

        const payloadMobile = normalizeMobile(mobileNumber);
        if (!payloadMobile || payloadMobile.length !== 10) {
            setOtpError('Invalid mobile number. Please go back and enter your mobile again.');
            return;
        }

        setOtpError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: payloadMobile, otp: otpJoined }),
            });

            const data = await response.json();
            console.log('forgot verify-otp response ->', data);

            if (response.ok && isBackendSuccess(data)) {
                // client-side navigation (no full reload)
                // use router.replace(...) if you don't want this in browser history
                router.push(`/reset-password?mobile=${encodeURIComponent(payloadMobile)}`);
                return;
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

    const handleEmailSubmit = async () => {
        // Basic client-side validation for email format
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
    
        setEmailError('');
        setIsLoading(true);
    
        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // On success, move to the next step
                setCurrentStep('email-sent');
            } else {
                // Handle backend errors (e.g., validation, email not found)
                if (data && data.errors && data.errors.email) {
                    setEmailError(data.errors.email[0]);
                } else {
                    setEmailError(data.message || 'Failed to send reset link. Please try again.');
                }
            }
        } catch (error) {
            console.error('handleEmailSubmit error', error);
            setEmailError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;

        const payloadMobile = normalizeMobile(mobileNumber);
        if (!payloadMobile || payloadMobile.length !== 10) {
            setOtpError('Invalid mobile number. Please go back and enter your mobile again.');
            return;
        }

        setIsLoading(true);
        setOtpValues(['', '', '', '', '', '']); // Clear OTP inputs on resend
        setOtpError('');

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password/reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: payloadMobile }),
            });

            const data = await response.json();
            console.log('forgot reset-otp response ->', data);

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


    const handleResendEmail = async () => {
        // This function simply re-runs the email submission logic
        await handleEmailSubmit();
    };


    if (!isOpen) return null;

    const renderStepContent = () => {
        switch (currentStep) {
            case 'choose-method':
                return (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Reset Your Password</h2>
                            <p className="text-sm sm:text-base text-gray-600">Choose your preferred method to reset your password</p>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <button
                                onClick={() => setCurrentStep('mobile-input')}
                                className="group w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-200 rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Mobile Number</h3>
                                        <p className="text-xs sm:text-sm text-gray-500">Get verification code via SMS</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setCurrentStep('email-input')}
                                className="group w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-200 rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Email Address</h3>
                                        <p className="text-xs sm:text-sm text-gray-500">Get reset link via email</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                );

            case 'mobile-input':
                return (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto">
                                <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Enter Mobile Number</h2>
                            <p className="text-sm sm:text-base text-gray-600">We'll send a verification code to your phone</p>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 text-sm sm:text-base">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => {
                                        setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                                        setMobileError(''); // Clear error on change
                                    }}
                                    placeholder="Enter 10-digit mobile number"
                                    className="w-full h-12 sm:h-14 bg-gray-50 border border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100 focus:bg-white rounded-xl pl-12 sm:pl-16 pr-4 sm:pr-6 text-gray-900 text-sm sm:text-base placeholder-gray-400 outline-none transition-all duration-200"
                                    maxLength={10}
                                />
                            </div>
                            {mobileError && <p className="text-sm text-red-600 text-center -mt-2">{mobileError}</p>}

                            <button
                                onClick={handleMobileSubmit}
                                disabled={mobileNumber.length !== 10 || isLoading}
                                className="w-full h-12 sm:h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw className="w-4 h-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 'otp-input':
                return (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Enter Verification Code</h2>
                            <div className="space-y-1">
                                <p className="text-sm sm:text-base text-gray-600">Enter the 6-digit code sent to</p>
                                <p className="text-sm sm:text-base text-gray-900 font-medium">+91 {mobileNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex gap-2 sm:gap-3 justify-center">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => otpInputRefs.current[index] = el}
                                        type="text"
                                        value={otpValues[index]}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg bg-gray-50 focus:bg-white outline-none transition-all duration-200"
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
                                    'Verify & Reset Password'
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 'email-input':
                return (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-xl flex items-center justify-center mx-auto">
                                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Enter Email Address</h2>
                            <p className="text-sm sm:text-base text-gray-600">We'll send a password reset link to your email</p>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError('');
                                    }}
                                    placeholder="Enter your registered email address"
                                    className="w-full h-12 sm:h-14 bg-gray-50 border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:bg-white rounded-xl px-4 sm:px-6 text-gray-900 text-sm sm:text-base placeholder-gray-400 outline-none transition-all duration-200"
                                />
                            </div>
                            {emailError && <p className="text-sm text-red-600 text-center -mt-2">{emailError}</p>}

                            <button
                                onClick={handleEmailSubmit}
                                disabled={!email || isLoading}
                                className="w-full h-12 sm:h-14 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw className="w-4 h-4 animate-spin" />
                                        Sending Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 'email-sent':
                return (
                    <div className="space-y-6 sm:space-y-8">
                        <div className="text-center space-y-3 sm:space-y-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto">
                                <Check className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Check Your Email</h2>
                            <div className="space-y-2">
                                <p className="text-sm sm:text-base text-gray-600">We've sent a password reset link to</p>
                                <p className="text-sm sm:text-base text-gray-900 font-medium break-all">{email}</p>
                                <p className="text-xs sm:text-sm text-gray-500">The link will expire in 15 minutes</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleResendEmail}
                                disabled={isLoading}
                                className="w-full h-10 sm:h-12 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCcw className="w-4 h-4 animate-spin" />
                                        Resending...
                                    </>
                                ) : (
                                    'Resend Reset Link'
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={() => setCurrentStep('email-input')}
                                        className="text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        try a different email
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg relative animate-scaleIn">
                {/* Header with navigation */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <button
                        onClick={handleBack}
                        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${currentStep === 'choose-method' ? 'invisible' : 'visible'
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
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

export default ForgotPasswordModal;