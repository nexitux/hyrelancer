'use client';
import { useState, useEffect, useRef } from 'react';
import { FacebookFilled, GoogleOutlined, MailOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import api from '@/config/api';
import ErrorModal from '../ErorrModal/page';
import EmailVerificationModal from '../EmailModal/page';
import { handleAuthErrors, handleRegistrationErrors, showSuccessNotification } from '../../utils/notificationService';
import ForgotPasswordModal from '../../app/(auth)/Login/components/ForgotPasswordModal';
import { Check, X, Eye, EyeOff } from 'lucide-react';

// Custom hook for password validation
const usePasswordValidation = (password) => {
  const [validation, setValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    setValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    });
  }, [password]);

  const isValid = Object.values(validation).every(Boolean);
  return { validation, isValid };
};

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(cleanPhone);
};

const validateConfirmPassword = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};

// Validation Icon Component
const ValidationIcon = ({ isValid, hasValue }) => {
  if (!hasValue) return null;
  
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
      {isValid ? (
        <Check size={16} className="text-green-500" />
      ) : (
        <X size={16} className="text-red-500" />
      )}
    </div>
  );
};

// Text Validation Component for Confirm Password
const TextValidation = ({ isValid, hasValue, field }) => {
  if (!hasValue || field !== 'confirmPassword') return null;
  
  return (
    <div className="mt-1 text-xs">
      {isValid ? (
        <span className="text-green-600 flex items-center">
          <Check size={12} className="mr-1" />
          Passwords match
        </span>
      ) : (
        <span className="text-red-600 flex items-center">
          <X size={12} className="mr-1" />
          Passwords do not match
        </span>
      )}
    </div>
  );
};

// Validation Checklist Component
const ValidationChecklist = ({ validation }) => {
  const rules = [
    { key: 'minLength', text: 'At least 8 characters' },
    { key: 'hasUppercase', text: 'One uppercase letter' },
    { key: 'hasLowercase', text: 'One lowercase letter' },
    { key: 'hasNumber', text: 'One number' },
    { key: 'hasSpecialChar', text: 'One special character' }
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Password requirements:</p>
      <ul className="space-y-1">
        {rules.map(({ key, text }) => (
          <li key={key} className="flex items-center text-sm">
            {validation[key] ? (
              <Check size={16} className="text-green-500 mr-2" />
            ) : (
              <X size={16} className="text-gray-400 mr-2" />
            )}
            <span className={validation[key] ? 'text-green-700' : 'text-gray-600'}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [formData, setFormData] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotModalMode, setForgotModalMode] = useState('forgot-password');
  const otpRefs = useRef([]);

  const { validation: passwordValidation, isValid: isPasswordValid } = usePasswordValidation(formData.password || '');

  // Phone OTP states
  const [showMobileSignIn, setShowMobileSignIn] = useState(false);
  const [phoneAuthStep, setPhoneAuthStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState({
    'signin-password': false,
    password: false,
    confirmPassword: false
  });

  const toggleShowPassword = (fieldKey) => {
    setShowPasswordFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      dispatch(loginStart());

      const response = await api.post('/login', {
        email: formData['signin-username'],
        password: formData['signin-password']
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('suppressAutoRedirect', '1');

        dispatch(loginSuccess({
          user: response.data.user,
          token: response.data.access_token,
          userType: response.data.user.user_type,
          slug: response.data.fp_slug
        }));

        localStorage.setItem('token', response.data.access_token);

        // Show success modal and then call onLoginSuccess
        setModalContent({
          type: 'success',
          title: 'Login Successful!',
          message: 'Welcome back to Hyrelancer',
        });
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch(loginFailure(error.response?.data?.message || 'Login failed'));

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.error && errorData.error.toLowerCase().includes('email not verified')) {
          if (errorData.resend_available && errorData.email) {
            setRegisteredEmail(errorData.email);
            setShowEmailModal(true);
          } else {
            setErrorModalContent('Please verify your email before logging in. Check your inbox for the verification link.');
            setShowErrorModal(true);
          }
        } else if (errorData.message) {
          const message = errorData.message;
          if (message.toLowerCase().includes('invalid credentials')) {
            setErrorModalContent('Invalid email or password. Please check your credentials and try again.');
            setShowErrorModal(true);
          } else {
            handleAuthErrors(error);
          }
        } else {
          handleAuthErrors(error);
        }

        if (errorData.errors) {
          setErrors(errorData.errors);
        }
      } else {
        handleAuthErrors(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    let newErrors = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = ['Passwords do not match'];
    }
    if (!isPasswordValid) {
      newErrors.password = ['Password does not meet all requirements'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/register', {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        'confirm-password': formData.confirmPassword,
        send_email: true
      });

      if (response.data && response.data.message) {
        setRegisteredEmail(formData.email);
        setShowEmailModal(true);
        showSuccessNotification('Registration successful! Please check your email for verification.');
        setTimeout(() => {
          setShowEmailModal(false);
          setIsSignUpMode(false);
          setFormData({});
        }, 5000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        const errors = error.response.data.errors;
        if (errors.email && errors.email[0].toLowerCase().includes('already')) {
          setErrorModalContent('This email is already registered. Please use a different email or try logging in.');
          setShowErrorModal(true);
        } else if (errors.mobile && errors.mobile[0].toLowerCase().includes('already')) {
          setErrorModalContent('This phone number is already registered. Please use a different number.');
          setShowErrorModal(true);
        } else {
          handleRegistrationErrors(error);
        }
      } else {
        handleRegistrationErrors(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalOk = () => {
    setIsModalOpen(false);
    // Call the success callback to open message modal
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    // Close the login modal
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const isFieldActive = (field) => {
    return focusedField === field || formData[field];
  };

  const handleResendVerificationEmail = async () => {
    try {
      await api.post('/resend-verification', { email: registeredEmail });
      showSuccessNotification('Verification email sent successfully!');
    } catch (error) {
      console.error('Resend email error:', error);
      setErrorModalContent('Failed to resend verification email. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'https://backend.hyrelancer.in/api/google/login';
  };

  const handleGoogleSignUp = () => {
    const frontendUrl = `${window.location.origin}/complete-signup`;
    const googleSignupUrl = `https://backend.hyrelancer.in/api/google/signup?redirect_url=${encodeURIComponent(frontendUrl)}`;
    window.location.href = googleSignupUrl;
  };

  // Phone OTP functions
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
      msg.includes('otp')
    );
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setErrorModalContent('Please enter a valid phone number');
      setShowErrorModal(true);
      return;
    }

    setIsPhoneLoading(true);
    setOtpSuccessMessage('');
    try {
      const response = await api.post('/send-otp', { mobile: phoneNumber });
      if (isBackendSuccess(response.data)) {
        setPhoneAuthStep('otp');
        setCountdown(30);
        setOtpSuccessMessage(response.data.message || 'OTP has been sent successfully.');
        setShowErrorModal(false);
        setTimeout(() => {
          const el = document.getElementById('otp-0');
          if (el) el.focus();
        }, 50);
      } else {
        setErrorModalContent(response.data.remark || response.data.message || 'Failed to send OTP. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Send OTP error:', error, error?.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrorModalContent(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (value && index < otpRefs.current.length - 1) {
      setTimeout(() => {
        const next = otpRefs.current[index + 1];
        if (next) next.focus();
      }, 0);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
        return;
      }
      if (index > 0) {
        const prev = otpRefs.current[index - 1];
        if (prev) prev.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prev = otpRefs.current[index - 1];
      if (prev) prev.focus();
    } else if (e.key === 'ArrowRight' && index < otpRefs.current.length - 1) {
      const next = otpRefs.current[index + 1];
      if (next) next.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrorModalContent('Please enter a valid 6-digit OTP');
      setShowErrorModal(true);
      return;
    }

    setIsPhoneLoading(true);
    try {
      const response = await api.post('/verify-otp', {
        mobile: phoneNumber,
        otp: otpValue
      });

      if (isBackendSuccess(response.data) || (response.data.status && response.data.status.toString().toLowerCase() === 'success')) {
        const { user, token, fp_slug } = response.data;
        dispatch(loginSuccess({
          user: user,
          token: token,
          userType: user.user_type,
          slug: fp_slug
        }));

        localStorage.setItem('token', token);
        setModalContent({
          type: 'success',
          title: 'Login Successful!',
          message: 'Welcome back to Hyrelancer',
        });
        setIsModalOpen(true);
        setShowErrorModal(false);
      } else {
        setErrorModalContent(response.data.message || 'Invalid OTP. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Verify OTP error:', error, error?.response?.data);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setErrorModalContent(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsPhoneLoading(true);
    setOtpSuccessMessage('');
    try {
      const response = await api.post('/reset-otp', { mobile: phoneNumber });
      if (isBackendSuccess(response.data)) {
        setOtp(['', '', '', '', '', '']);
        setCountdown(30);
        setOtpSuccessMessage(response.data.message || 'New OTP sent successfully!');
        setShowErrorModal(false);
        setTimeout(() => {
          const el = document.getElementById('otp-0');
          if (el) el.focus();
        }, 50);
      } else {
        setErrorModalContent(response.data.message || 'Failed to resend OTP.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Resend OTP error:', error, error?.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setErrorModalContent(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsPhoneLoading(false);
    }
  };

  const renderModalContent = () => {
    if (modalContent.type === 'success') {
      return (
        <div className="flex flex-col items-center bg-transparent">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mt-4 mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{modalContent.title}</h3>
          <p className="text-gray-600 mb-8 px-8 text-center">{modalContent.message}</p>
          <div className="w-full border-t border-gray-100 mb-4"></div>
          <button
            onClick={handleModalOk}
            className="w-full py-4 bg-green-600 text-white font-medium hover:bg-green-700 transition-colors rounded-2xl"
          >
            Continue
          </button>
        </div>
      );
    }
  };

  // Phone OTP UI components
  const renderPhoneInput = () => (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full h-11 bg-gray-50 border-2 rounded-xl px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-200"
          placeholder="Enter your phone number"
        />
      </div>
      <button
        type="button"
        onClick={handleSendOtp}
        disabled={isPhoneLoading}
        className="flex items-center justify-center h-11 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm disabled:opacity-50"
      >
        <MailOutlined className="w-4 h-4 mr-3 text-gray-500" />
        {isPhoneLoading ? 'Sending...' : 'Send OTP'}
      </button>
    </div>
  );

  const renderOtpInput = () => (
    <div className="space-y-4">
      <div className="text-center">
        {otpSuccessMessage && (
          <div className="text-sm font-medium text-green-600 mb-2">
            {otpSuccessMessage}
          </div>
        )}
        <p className="text-sm text-gray-600 mb-4">
          Enter the 6-digit code sent to <br />
          <span className="font-medium">{phoneNumber}</span>
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            ref={(el) => (otpRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={countdown > 0 || isPhoneLoading}
          className={`text-sm ${countdown > 0 || isPhoneLoading ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
        >
          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </button>
      </div>

      <button
        type="button"
        onClick={handleVerifyOtp}
        disabled={isPhoneLoading || otp.join('').length !== 6}
        className="flex items-center justify-center h-11 w-full bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all duration-200 font-medium text-sm disabled:opacity-50"
      >
        {isPhoneLoading ? 'Verifying...' : 'Verify & Login'}
      </button>

      <button
        type="button"
        onClick={() => {
          setPhoneAuthStep('phone');
          setOtp(['', '', '', '', '', '']);
        }}
        className="text-sm text-blue-600 hover:underline w-full text-center"
      >
        Change Phone Number
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {isSignUpMode ? 'Create Account' : 'Sign In'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {!isSignUpMode ? (
            // Sign In Form
            <div>
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full h-12 bg-gray-50 border-2 rounded-xl px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${errors.email ? 'border-red-300 bg-red-50' : 'border-transparent'}`}
                    required
                    autoComplete="new-password"
                    onFocus={() => handleFocus('signin-username')}
                    onBlur={handleBlur}
                    onChange={(e) => handleInputChange('signin-username', e.target.value)}
                    placeholder=""
                  />
                  <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    focusedField === 'signin-username' || (formData && formData['signin-username'])
                      ? 'top-0 text-xs text-gray-500 font-medium'
                      : 'top-1/2 -translate-y-1/2 text-gray-400'
                  }`}>
                    Username or Email
                  </label>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                </div>

                <div className="relative">
                  <input
                    type={showPasswordFields['signin-password'] ? 'text' : 'password'}
                    className={`w-full h-12 bg-gray-50 border-2 rounded-xl px-4 pr-12 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${errors.password ? 'border-red-300 bg-red-50' : 'border-transparent'}`}
                    required
                    autoComplete="new-password"
                    onFocus={() => handleFocus('signin-password')}
                    onBlur={handleBlur}
                    onChange={(e) => handleInputChange('signin-password', e.target.value)}
                    placeholder=""
                  />

                  <button
                    type="button"
                    aria-label={showPasswordFields['signin-password'] ? 'Hide password' : 'Show password'}
                    onClick={() => toggleShowPassword('signin-password')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showPasswordFields['signin-password'] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

                  <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    focusedField === 'signin-password' || (formData && formData['signin-password'])
                      ? 'top-0 text-xs text-gray-500 font-medium'
                      : 'top-1/2 -translate-y-1/2 text-gray-400'
                  }`}>
                    Password
                  </label>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalMode('forgot-password');
                      setIsForgotModalOpen(true);
                    }}
                    className="text-sm text-[#3a599c] hover:text-blue-800 font-medium hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#3d5999] text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUpMode(true)}
                      className="text-gray-900 font-bold hover:underline transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                </div>

                {/* Social Login Options */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    aria-label="Sign in with Google"
                    className="flex items-center justify-center h-12 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                  >
                    <GoogleOutlined className="w-4 h-4 mr-3" />
                    Sign in with Google
                  </button>

                  {!showMobileSignIn ? (
                    <button
                      type="button"
                      onClick={() => setShowMobileSignIn(true)}
                      className="flex items-center justify-center h-12 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                    >
                      <MailOutlined className="w-4 h-4 mr-3 text-gray-500" />
                      Sign in with Mobile
                    </button>
                  ) : (
                    <>
                      {phoneAuthStep === 'phone' ? renderPhoneInput() : renderOtpInput()}
                    </>
                  )}
                </div>
              </form>
            </div>
          ) : (
            // Sign Up Form
            <div>
              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                {[
                  { field: 'name', label: 'Full Name', type: 'text' },
                  { field: 'email', label: 'Email Address', type: 'email' },
                  { field: 'mobile', label: 'Mobile Number', type: 'tel' },
                  { field: 'password', label: 'Password', type: 'password' },
                  { field: 'confirmPassword', label: 'Confirm Password', type: 'password' }
                ].map(({ field, label, type }) => {
                  const getValidationState = () => {
                    const value = formData[field] || '';
                    const hasValue = value.length > 0;
                    
                    switch (field) {
                      case 'email':
                        return { isValid: validateEmail(value), hasValue };
                      case 'mobile':
                        return { isValid: validatePhoneNumber(value), hasValue };
                      case 'confirmPassword':
                        return { 
                          isValid: validateConfirmPassword(formData.password || '', value), 
                          hasValue 
                        };
                      default:
                        return { isValid: false, hasValue: false };
                    }
                  };

                  const validationState = getValidationState();

                  return (
                    <div key={field}>
                      <div className="relative">
                        {(field === 'password' || field === 'confirmPassword') ? (
                          <>
                            <input
                              type={showPasswordFields[field] ? 'text' : 'password'}
                              className={`w-full h-12 bg-gray-50 border-2 rounded-lg px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-200 pr-12 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-transparent'}`}
                              required
                              autoComplete="new-password"
                              onFocus={() => handleFocus(field)}
                              onBlur={handleBlur}
                              onChange={(e) => {
                                if (field === 'mobile') {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                  handleInputChange(field, value);
                                } else {
                                  handleInputChange(field, e.target.value);
                                }
                              }}
                              value={formData[field] || ''}
                              placeholder=""
                            />

                            <button
                              type="button"
                              aria-label={showPasswordFields[field] ? 'Hide password' : 'Show password'}
                              onClick={() => toggleShowPassword(field)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                            >
                              {showPasswordFields[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type={type}
                              maxLength={field === 'mobile' ? 10 : undefined}
                              className={`w-full h-12 bg-gray-50 border-2 rounded-lg px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-200 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-transparent'}`}
                              required
                              autoComplete="new-password"
                              onFocus={() => handleFocus(field)}
                              onBlur={handleBlur}
                              onChange={(e) => {
                                if (field === 'mobile') {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                  handleInputChange(field, value);
                                } else {
                                  handleInputChange(field, e.target.value);
                                }
                              }}
                              value={formData[field] || ''}
                              placeholder=""
                            />

                            {(field === 'email' || field === 'mobile') && (
                              <ValidationIcon 
                                isValid={validationState.isValid} 
                                hasValue={validationState.hasValue} 
                              />
                            )}
                          </>
                        )}

                        {!(formData[field] && formData[field].length > 0) && (
                          <label className={`absolute left-4 transition-all duration-200 pointer-events-none text-sm ${isFieldActive(field)
                            ? 'top-1.5 text-xs text-gray-500'
                            : 'top-1/2 -translate-y-1/2 text-gray-400'
                          }`}>
                            {label}
                          </label>
                        )}
                      </div>

                      {field === 'password' && formData.password && (
                        <div className="mt-2">
                          <ValidationChecklist validation={passwordValidation} />
                        </div>
                      )}
                      {field === 'confirmPassword' && (
                        <TextValidation 
                          isValid={validationState.isValid} 
                          hasValue={validationState.hasValue}
                          field={field}
                        />
                      )}
                      {field === 'confirmPassword' && errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.confirmPassword) ? errors.confirmPassword[0] : errors.confirmPassword}</p>
                      )}
                      {field === 'password' && errors.password && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>
                      )}
                      {field !== 'password' && field !== 'confirmPassword' && errors[field] && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</p>
                      )}
                    </div>
                  );
                })}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  aria-label="Sign up with Google"
                  className="flex items-center justify-center h-12 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                >
                  <GoogleOutlined className="w-4 h-4 mr-3" />
                  Sign up with Google
                </button>

                <p className="text-center text-gray-600 text-sm mt-3">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUpMode(false)}
                    className="text-[#3a599c] font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-60 p-4 ${isModalOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          {renderModalContent()}
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        error={errorModalContent}
        type="error"
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        email={registeredEmail}
        onResendEmail={handleResendVerificationEmail}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          setForgotModalMode('forgot-password');
        }}
        mode={forgotModalMode}
        initialMobile={forgotModalMode === 'signup' ? (formData.mobile || '') : ''}
      />
    </>
  );
};

export default LoginModal;
