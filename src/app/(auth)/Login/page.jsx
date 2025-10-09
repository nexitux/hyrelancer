'use client';
import { useState, useEffect, useRef } from 'react';
import { FacebookFilled, GoogleOutlined, MailOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice';
import api from '@/config/api';
import ErrorModal from '../../../components/ErorrModal/page';
import EmailVerificationModal from '../../../components/EmailModal/page';
import { handleAuthErrors, handleRegistrationErrors, showSuccessNotification } from '../../../utils/notificationService';
import ForgotPasswordModal from './components/ForgotPasswordModal'
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { sanitizeInput, validationConfigs } from '../../../utils/inputValidation';

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
  if (!email) return false;
  if (/\s/.test(email)) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateEmailInput = (value) => {
  if (!value) return '';
  return value.replace(/\s/g, '').replace(/[^a-zA-Z0-9@.]/g, '');
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

const Modal = ({ title, open, onOk, onCancel, children, footer }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-2">
          {footer}
        </div>
      </div>
    </div>
  );
};

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("signup");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [formData, setFormData] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const dispatch = useDispatch();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotModalMode, setForgotModalMode] = useState('forgot-password');
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
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

  const carouselTexts = [
    {
      title: "Diverse Opportunities\nAcross various industries",
      description: "We empower freelancers by providing a platform to showcase their skills and connect with clients. Hyrelancer is more than a job board - it is a community fostering growth and success."
    },
    {
      title: "Connect with Top Clients\nWorldwide",
      description: "Build meaningful relationships with clients from around the globe. Our platform makes it easy to find projects that match your expertise and grow your freelance career."
    },
    {
      title: "Secure Payments\nGuaranteed",
      description: "Focus on your work while we handle the rest. Our secure payment system ensures you get paid on time, every time, with full protection and transparency."
    }
  ];

  // Google Login Integration
  useEffect(() => {
    const handleGoogleLoginRedirect = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');
      const googleId = queryParams.get('user_googleid');
      const urlError = queryParams.get('error');

      if (token && googleId) {
        setIsLoading(true);
        dispatch(loginStart());
        try {
          const backendUrl = 'https://hyre.hyrelancer.com/api';
          const response = await api.get(
            `${backendUrl}/getDatatByGoogleId?google_id=${googleId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          const data = response.data;
          dispatch(loginSuccess({
            user: data.user,
            token: data.token,
            userType: data.user.user_type,
            slug: data.fp_slug,
            availability: data.u_avail || 'Offline',
            u_avail: data.u_avail || 'Offline'
          }));

          if (!data.user.user_type) {
            router.push('/select-user-type');
          }

        } catch (apiError) {
          const errorMessage = apiError.response?.data?.error || 'Failed to complete Google login.';
          dispatch(loginFailure(errorMessage));
          setErrorModalContent(errorMessage);
          setShowErrorModal(true);
        } finally {
          setIsLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (urlError) {
        let errorMessage = decodeURIComponent(urlError);
        
        if (urlError === 'user_exists') {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        } else if (urlError === 'email_already_registered') {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        }
        
        dispatch(loginFailure(errorMessage));
        setErrorModalContent(errorMessage);
        setShowErrorModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleGoogleLoginRedirect();
  }, [dispatch]);

  // Auto-change carousel text every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselTexts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselTexts.length]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clean up email fields to remove spaces
  useEffect(() => {
    const cleanedFormData = { ...formData };
    let hasChanges = false;

    if (formData.email) {
      const cleanedEmail = validateEmailInput(formData.email);
      if (cleanedEmail !== formData.email) {
        cleanedFormData.email = cleanedEmail;
        hasChanges = true;
      }
    }

    if (formData['signin-username']) {
      const cleanedUsername = validateEmailInput(formData['signin-username']);
      if (cleanedUsername !== formData['signin-username']) {
        cleanedFormData['signin-username'] = cleanedUsername;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      setFormData(cleanedFormData);
    }
  }, [formData.email, formData['signin-username']]);

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
          slug: response.data.fp_slug,
          availability: response.data.u_avail || 'Offline',
          u_avail: response.data.u_avail || 'Offline'
        }));

        localStorage.setItem('token', response.data.access_token);

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
          setActiveTab("login");
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
  };

  const handleInputChange = (field, value) => {
    let sanitizedValue = value;
    
    if (field === 'email' || field === 'signin-username') {
      sanitizedValue = value.replace(/[^a-zA-Z0-9@.]/g, '');
    } else if (field === 'mobile') {
      sanitizedValue = value.replace(/[^0-9+]/g, '');
    } else if (field === 'name') {
      sanitizedValue = sanitizeInput(value, validationConfigs.name);
    } else if (field === 'signin-password' || field === 'password' || field === 'confirmPassword') {
      sanitizedValue = sanitizeInput(value, { allowLimitedChars: true, strict: false });
    } else if (['title', 'description'].includes(field)) {
      sanitizedValue = sanitizeInput(value, validationConfigs.title);
    }
    
    setFormData({ ...formData, [field]: sanitizedValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleFocus = (field) => {
    setFocusedField(field);
    
    if (field === 'email' || field === 'signin-username') {
      const currentValue = formData[field] || '';
      const cleanedValue = validateEmailInput(currentValue);
      if (cleanedValue !== currentValue) {
        setFormData({ ...formData, [field]: cleanedValue });
      }
    }
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleKeyDown = (e, field) => {
    if ((field === 'email' || field === 'signin-username') && e.key === ' ') {
      e.preventDefault();
    }
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
    window.location.href = 'https://hyre.hyrelancer.com/api/google/login';
  };

  const handleGoogleSignUp = () => {
    const frontendUrl = `${window.location.origin}/complete-signup`;
    const googleSignupUrl = `https://hyre.hyrelancer.com/api/google/signup?redirect_url=${encodeURIComponent(frontendUrl)}`;
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
      console.error('Send OTP error:', error);
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
          slug: fp_slug,
          availability: response.data.u_avail || 'Offline',
          u_avail: response.data.u_avail || 'Offline'
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
      console.error('Verify OTP error:', error);
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
      console.error('Resend OTP error:', error);
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
          <div className="w-20 h-20 bg-[#3A599C]/10 rounded-full flex items-center justify-center mt-4 mb-6">
            <svg className="w-12 h-12 text-[#3A599C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{modalContent.title}</h3>
          <p className="text-gray-600 mb-8 px-8 text-center">{modalContent.message}</p>
          <div className="w-full border-t border-gray-100 mb-4"></div>
          <button
            onClick={handleModalOk}
            className="w-full py-4 bg-[#3A599C] text-white font-medium hover:bg-[#2d4577] transition-colors rounded-2xl"
          >
            Continue to Dashboard
          </button>
        </div>
      );
    } else if (modalContent.type === 'email_verification') {
      return (
        <div className="flex flex-col items-center bg-transparent">
          <div className="w-20 h-20 bg-[#3A599C]/10 rounded-full flex items-center justify-center mt-4 mb-6">
            <svg className="w-12 h-12 text-[#3A599C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{modalContent.title}</h3>
          <p className="text-gray-600 mb-4 px-8 text-center">{modalContent.message}</p>
          <p className="text-sm text-gray-500 mb-8 px-8 text-center">
            Verification email sent to: <strong>{modalContent.email}</strong>
          </p>
          <div className="w-full border-t border-gray-100 mb-4"></div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full py-4 bg-[#3A599C] text-white font-medium hover:bg-[#2d4577] transition-colors rounded-2xl"
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
          className="w-full h-11 bg-gray-50 border-2 rounded-xl px-4 text-gray-900 focus:border-[#3A599C] focus:bg-white focus:outline-none transition-all duration-200"
          placeholder="Enter your phone number"
        />
      </div>
      <button
        type="button"
        onClick={handleSendOtp}
        disabled={isPhoneLoading}
        className="flex items-center justify-center h-11 w-full bg-[#3A599C] rounded-xl shadow-sm text-white hover:bg-[#2d4577] transition-all duration-200 font-medium text-sm disabled:opacity-50"
      >
        <MailOutlined className="w-4 h-4 mr-3 text-white" />
        {isPhoneLoading ? 'Sending...' : 'Send OTP'}
      </button>
    </div>
  );

  const renderOtpInput = () => (
    <div className="space-y-4">
      <div className="text-center">
        {otpSuccessMessage && (
          <div className="text-sm font-medium text-[#3A599C] mb-2">
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
            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl border border-gray-300 rounded-lg focus:border-[#3A599C] focus:ring-2 focus:ring-[#3A599C]/20 outline-none"
          />
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={countdown > 0 || isPhoneLoading}
          className={`text-sm ${countdown > 0 || isPhoneLoading ? 'text-gray-400' : 'text-[#3A599C] hover:underline'}`}
        >
          {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
        </button>
      </div>

      <button
        type="button"
        onClick={handleVerifyOtp}
        disabled={isPhoneLoading || otp.join('').length !== 6}
        className="flex items-center justify-center h-11 w-full bg-[#3A599C] text-white rounded-xl shadow-sm hover:bg-[#2d4577] transition-all duration-200 font-medium text-sm disabled:opacity-50"
      >
        {isPhoneLoading ? 'Verifying...' : 'Verify & Login'}
      </button>

      <button
        type="button"
        onClick={() => {
          setPhoneAuthStep('phone');
          setOtp(['', '', '', '', '', '']);
        }}
        className="text-sm text-[#3A599C] hover:underline w-full text-center"
      >
        Change Phone Number
      </button>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row relative overflow-hidden">
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      {/* Full-screen Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/images/LoginBg.mp4" type="video/mp4" />
          {/* Fallback image if video doesn't load */}
          <div/>
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Left Side - Hero Content */}
      <div className="hidden lg:flex lg:flex-1 relative z-10">
        {/* Top Row: Logo and Back to Website */}
        <div className="absolute top-[-60px] left-40 w-full flex items-center justify-between px-12 mb-20 z-20">
          <img
            src="/images/hyrelancerWhite.png"
            alt="hyrelancer logo"
            className="h-66 object-contain"
            style={{ minWidth: 90, marginTop: 0 }}
          />
          <button className="flex items-center gap-2 text-[#F4F4F4] font-bold text-sm hover:opacity-80 transition-opacity mt-0">
            <svg 
              className="w-4 h-4 rotate-360" 
              viewBox="0 0 16 13" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7.13862 0.190622C7.20061 0.250986 7.24978 0.32267 7.28333 0.401574C7.31687 0.480477 7.33414 0.565052 7.33414 0.650467C7.33414 0.735881 7.31687 0.820459 7.28333 0.899363C7.24978 0.978266 7.20061 1.04995 7.13862 1.11031L2.27628 5.85012L15.3334 5.85012C15.5102 5.85012 15.6797 5.9186 15.8047 6.04049C15.9298 6.16238 16 6.3277 16 6.50008C16 6.67245 15.9298 6.83777 15.8047 6.95966C15.6797 7.08155 15.5102 7.15003 15.3334 7.15003L2.27628 7.15003L7.13862 11.8898C7.26371 12.0118 7.33399 12.1772 7.33399 12.3497C7.33399 12.5222 7.26371 12.6876 7.13862 12.8095C7.01354 12.9315 6.84388 13 6.66697 13C6.49007 13 6.32041 12.9315 6.19532 12.8095L0.195518 6.95992C0.133536 6.89956 0.0843648 6.82787 0.0508164 6.74897C0.0172679 6.67007 7.64923e-08 6.58549 7.75108e-08 6.50007C7.85294e-08 6.41466 0.017268 6.33008 0.0508164 6.25118C0.0843648 6.17228 0.133536 6.10059 0.195518 6.04023L6.19532 0.190622C6.25723 0.130192 6.33076 0.0822516 6.41169 0.0495435C6.49262 0.0168343 6.57937 7.84582e-08 6.66697 7.95029e-08C6.75458 8.05476e-08 6.84133 0.0168343 6.92226 0.0495435C7.00319 0.0822516 7.07671 0.130192 7.13862 0.190622Z" fill="currentColor"/>
            </svg>
            <span className="whitespace-nowrap">Back to Website</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-[140px] left-36 max-w-[800px] animate-fade-in">
          <h1 className="text-white text-[56px] font-normal leading-[56px] mb-8">
            {carouselTexts[currentSlide].title.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < carouselTexts[currentSlide].title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-[#F4F4F4] text-base font-bold leading-6 mb-8">
            {carouselTexts[currentSlide].description}
          </p>
          <div className="flex items-center gap-1">
            {carouselTexts.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-[22px] bg-[#3A599C]' : 'bg-[#B0B0B0]'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6 relative z-10 h-full">
        <div className="w-full max-w-[662px] bg-white rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] p-4 sm:p-6 lg:p-8 xl:p-12 animate-fade-in shadow-2xl lg:shadow-2xl max-h-[95vh] overflow-y-auto">
          <div className="w-full max-w-[382px] mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-[500px] sm:min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 sm:gap-4">
              <h2 className="text-[#3A599C] text-2xl sm:text-3xl lg:text-4xl font-normal text-center">
                {activeTab === "signup" ? "Get Started" : "Welcome Back"}
              </h2>
              <p className="text-black text-sm sm:text-base font-bold text-center">
                {activeTab === "signup" 
                  ? "Create your account to begin" 
                  : "Sign in to continue your journey"}
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="relative w-full h-[44px] sm:h-[48px] lg:h-[54px] rounded-[22px] sm:rounded-[24px] lg:rounded-[32px] border border-[#888888] bg-white">
              <div 
                className={`absolute top-[2px] sm:top-[2px] lg:top-[3px] h-10 sm:h-11 lg:h-12 w-[calc(50%-2px)] rounded-[20px] sm:rounded-[22px] lg:rounded-[32px] bg-[#3A599C] shadow-[0_0_1.8px_1px_#3A599C] transition-all duration-300 ${
                  activeTab === "login" ? "left-[2px]" : "left-[calc(50%+2px)]"
                }`}
              ></div>
              <div className="absolute inset-0 flex justify-between items-center px-2 sm:px-3 lg:px-4">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-2 sm:py-3 lg:py-4 rounded-3xl font-bold text-xs sm:text-sm lg:text-base transition-colors ${
                    activeTab === "login" ? "text-white" : "text-[#3A599C]"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 py-2 sm:py-3 lg:py-4 rounded-3xl font-bold text-xs sm:text-sm lg:text-base transition-colors ${
                    activeTab === "signup" ? "text-white" : "text-[#3A599C]"
                  }`}
                >
                  Sign up
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={activeTab === "signup" ? handleSignUpSubmit : handleSignInSubmit} className="flex flex-col gap-4 sm:gap-6 lg:gap-8 flex-1">
              <div className="flex flex-col  sm:gap-4 ">
                {activeTab === "signup" && (
                  <div className="animate-fade-in">
                    <input
                      type="text"
                      placeholder="Name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 rounded-2xl sm:rounded-3xl border border-[#888888] bg-white text-sm sm:text-base text-[#888888] placeholder:text-[#888888] focus:outline-none focus:border-[#3A599C] transition-colors"
                    />
                  </div>
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={activeTab === "signup" ? (formData.email || '') : (formData['signin-username'] || '')}
                  onChange={(e) => handleInputChange(activeTab === "signup" ? 'email' : 'signin-username', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, activeTab === "signup" ? 'email' : 'signin-username')}
                  className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 rounded-2xl sm:rounded-3xl border border-[#888888] bg-white text-sm sm:text-base text-[#888888] placeholder:text-[#888888] focus:outline-none focus:border-[#3A599C] transition-colors"
                />

                {activeTab === "signup" && (
                  <div className="animate-fade-in">
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.mobile || ''}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      maxLength={10}
                      className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 rounded-2xl sm:rounded-3xl border border-[#888888] bg-white text-sm sm:text-base text-[#888888] placeholder:text-[#888888] focus:outline-none focus:border-[#3A599C] transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showPasswordFields[activeTab === "signup" ? 'password' : 'signin-password'] ? "text" : "password"}
                    placeholder="Password"
                    value={activeTab === "signup" ? (formData.password || '') : (formData['signin-password'] || '')}
                    onChange={(e) => handleInputChange(activeTab === "signup" ? 'password' : 'signin-password', e.target.value)}
                    onFocus={() => {
                      if (activeTab === "signup") {
                        setShowPasswordValidation(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowPasswordValidation(false), 200)}
                    className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 pr-10 sm:pr-11 lg:pr-12 rounded-2xl sm:rounded-3xl border border-[#888888] bg-white text-sm sm:text-base text-[#888888] placeholder:text-[#888888] focus:outline-none focus:border-[#3A599C] transition-colors"
                  />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword(activeTab === "signup" ? 'password' : 'signin-password')}
                      className="absolute right-3 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 text-[#6D6D6D] hover:text-[#3A599C] transition-colors"
                    >
                      {showPasswordFields[activeTab === "signup" ? 'password' : 'signin-password'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                  {/* Password Validation Popup */}
                  {activeTab === "signup" && showPasswordValidation && (
                    <div className="absolute left-0 sm:left-[123px] top-[50px] sm:top-[60px] w-[280px] sm:w-[259px] bg-white rounded-[10px] shadow-[0_3px_12.4px_0_rgba(0,0,0,0.24)] p-3 sm:p-4 z-10 animate-fade-in">
                      <p className="text-[#343434] text-xs sm:text-sm mb-3 sm:mb-4">Your password must have:</p>
                      <div className="flex flex-col gap-1 sm:gap-2">
                        {[
                          { text: "At least 8 Characters", met: (formData.password || '').length >= 8 },
                          { 
                            text: "Upper and lowercase characters", 
                            met: /[a-z]/.test(formData.password || '') && /[A-Z]/.test(formData.password || '') 
                          },
                          { text: "At least one number", met: /\d/.test(formData.password || '') },
                        ].map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <svg 
                              className="w-[12px] sm:w-[13.355px] h-[12px] sm:h-[13.355px] flex-shrink-0" 
                              viewBox="0 0 14 14" 
                              fill="none"
                            >
                              <path 
                                fillRule="evenodd" 
                                clipRule="evenodd" 
                                d="M0 6.67742C0 4.90646 0.703512 3.20803 1.95577 1.95577C3.20803 0.703512 4.90646 0 6.67742 0C8.44838 0 10.1468 0.703512 11.3991 1.95577C12.6513 3.20803 13.3548 4.90646 13.3548 6.67742C13.3548 8.44838 12.6513 10.1468 11.3991 11.3991C10.1468 12.6513 8.44838 13.3548 6.67742 13.3548C4.90646 13.3548 3.20803 12.6513 1.95577 11.3991C0.703512 10.1468 0 8.44838 0 6.67742ZM6.29636 9.53535L10.1408 4.72939L9.44632 4.17383L6.16815 8.27021L3.84619 6.33554L3.27639 7.0193L6.29636 9.53535Z" 
                                fill={req.met ? "#43A047" : "#D9D9D9"}
                              />
                            </svg>
                            <span className="text-[#888888] text-xs sm:text-sm">{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {activeTab === "signup" && (
                  <div className="relative animate-fade-in">
                    <input
                      type={showPasswordFields['confirmPassword'] ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword || ''}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 pr-10 sm:pr-11 lg:pr-12 rounded-2xl sm:rounded-3xl border border-[#888888] bg-white text-sm sm:text-base text-[#888888] placeholder:text-[#888888] focus:outline-none focus:border-[#3A599C] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('confirmPassword')}
                      className="absolute right-3 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 text-[#6D6D6D] hover:text-[#3A599C] transition-colors"
                    >
                      {showPasswordFields['confirmPassword'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <TextValidation 
                      isValid={validateConfirmPassword(formData.password || '', formData.confirmPassword || '')} 
                      hasValue={(formData.confirmPassword || '').length > 0}
                      field="confirmPassword"
                    />
                  </div>
                )}

                {activeTab === "login" && (
                  <div className="flex justify-between items-center animate-fade-in">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="w-4 h-4 rounded border border-black flex items-center justify-center">
                        {formData.rememberMe && (
                          <div className="w-2 h-2 bg-[#3A599C] rounded-sm"></div>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.rememberMe || false}
                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                        className="sr-only"
                      />
                      <span className="text-[#343434] text-sm">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setForgotModalMode('forgot-password');
                        setIsForgotModalOpen(true);
                      }}
                      className="text-[#3A599C] font-bold text-base hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {activeTab === "signup" && (
                  <label className="flex items-center gap-2 cursor-pointer animate-fade-in">
                    <div className="w-4 h-4 rounded border border-[#343434] flex items-center justify-center">
                      {formData.agreedToTerms && (
                        <div className="w-2 h-2 bg-[#3A599C] rounded-sm"></div>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms || false}
                      onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      className="sr-only"
                    />
                    <span className="text-[#343434] text-sm">
                      I Agree With{" "}
                      <a href="#" className="text-[#3A599C] underline">
                        Terms & Privacy
                      </a>
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 rounded-2xl sm:rounded-3xl bg-[#3A599C] text-white font-bold text-sm sm:text-base hover:bg-[#2d4577] transition-colors disabled:opacity-50"
              >
                {isLoading ? (activeTab === "signup" ? 'Creating Account...' : 'Signing In...') : (activeTab === "signup" ? "Create Account" : "Login")}
              </button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-[0.5px] bg-[#888888]"></div>
                <span className="text-[#888888] text-sm sm:text-base">or</span>
                <div className="flex-1 h-[0.5px] bg-[#888888]"></div>
              </div>

              <button
                type="button"
                onClick={activeTab === "signup" ? handleGoogleSignUp : handleGoogleSignIn}
                className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 rounded-2xl sm:rounded-3xl border border-[#343434] bg-white flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
                  <path opacity="0.987" fillRule="evenodd" clipRule="evenodd" d="M10.6437 0.104187C11.8778 -0.0347289 12.608 -0.0347289 13.934 0.104187C16.2812 0.454211 18.457 1.54734 20.1469 3.2255C19.005 4.31305 17.878 5.41648 16.7664 6.53547C14.6376 4.71756 12.2613 4.29795 9.63773 5.27665C7.71314 6.16846 6.37297 7.61364 5.6172 9.61219C4.38218 8.6858 3.16324 7.73782 1.96095 6.76871C1.87739 6.7244 1.78196 6.70817 1.6886 6.7224C3.59843 3.01227 6.5829 0.805625 10.642 0.102472" fill="#F44336"/>
                  <path opacity="0.997" fillRule="evenodd" clipRule="evenodd" d="M1.68514 6.72239C1.78159 6.70752 1.87294 6.72296 1.95919 6.76869C3.16148 7.73781 4.38042 8.68578 5.61545 9.61218C5.4211 10.3909 5.29859 11.186 5.24948 11.9875C5.29147 12.7626 5.41346 13.5235 5.61545 14.2701L1.77706 17.3486C0.105526 13.8294 0.0748869 10.2873 1.68514 6.72239Z" fill="#FFC107"/>
                  <path opacity="0.999" fillRule="evenodd" clipRule="evenodd" d="M19.9648 21.077C18.7696 20.0151 17.5184 19.0189 16.2166 18.0929C17.5216 17.1645 18.3136 15.8908 18.5928 14.2719H12.1978V9.79742C15.8858 9.76655 19.5721 9.79799 23.2567 9.89175C23.9558 13.7162 23.1484 17.1645 20.8346 20.2367C20.5594 20.5314 20.268 20.8118 19.9648 21.077Z" fill="#448AFF"/>
                  <path opacity="0.993" fillRule="evenodd" clipRule="evenodd" d="M5.61549 14.2719C7.01127 17.767 9.5702 19.3986 13.2923 19.1665C14.3371 19.0446 15.3389 18.6769 16.2166 18.0929C17.5193 19.0213 18.7687 20.016 19.9648 21.077C18.0697 22.7928 15.6534 23.8108 13.1101 23.9651C12.5323 24.0116 11.9517 24.0116 11.3739 23.9651C7.04134 23.4506 3.8424 21.2451 1.7771 17.3486L5.61549 14.2719Z" fill="#43A047"/>
                </svg>
                <span className="text-[#343434] font-bold text-sm sm:text-base">Continue with Google</span>
              </button>

              {activeTab === "login" && (
                <button
                  type="button"
                  onClick={() => setShowMobileSignIn(true)}
                  className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 rounded-2xl sm:rounded-3xl border border-[#343434] bg-white flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <svg width="20" height="15" className="sm:w-6 sm:h-[18px]" viewBox="0 0 25 19" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M22.925 2.526L13.4555 10.368C13.1864 10.5909 12.8479 10.7129 12.4985 10.7129C12.1491 10.7129 11.8106 10.5909 11.5415 10.368L2.0765 2.526C2.02571 2.67887 1.99988 2.83892 2 3V15C2 15.3978 2.15804 15.7794 2.43934 16.0607C2.72064 16.342 3.10218 16.5 3.5 16.5H21.5C21.8978 16.5 22.2794 16.342 22.5607 16.0607C22.842 15.7794 23 15.3978 23 15V3C23.0006 2.839 22.9753 2.67895 22.925 2.526ZM3.5 0H21.5C22.2956 0 23.0587 0.31607 23.6213 0.87868C24.1839 1.44129 24.5 2.20435 24.5 3V15C24.5 15.7956 24.1839 16.5587 23.6213 17.1213C23.0587 17.6839 22.2956 18 21.5 18H3.5C2.70435 18 1.94129 17.6839 1.37868 17.1213C0.816071 16.5587 0.5 15.7956 0.5 15V3C0.5 2.20435 0.816071 1.44129 1.37868 0.87868C1.94129 0.31607 2.70435 0 3.5 0ZM3.185 1.5L11.549 8.4045C11.8169 8.62576 12.1533 8.74716 12.5007 8.74798C12.8481 8.7488 13.1851 8.62899 13.454 8.409L21.902 1.5H3.185Z" fill="black"/>
                  </svg>
                  <span className="text-[#343434] text-sm sm:text-base">Continue with phone</span>
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Logo and Back Button */}
      <div className="lg:hidden absolute top-4 left-4 z-20">
        <div className="text-white text-xl font-bold">hyrelancer</div>
      </div>
      
      <button className="lg:hidden absolute top-4 right-4 flex items-center gap-2 text-white font-bold text-sm hover:opacity-80 transition-opacity z-20">
        <svg 
          className="w-4 h-4 rotate-180" 
          viewBox="0 0 16 13" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7.13862 0.190622C7.20061 0.250986 7.24978 0.32267 7.28333 0.401574C7.31687 0.480477 7.33414 0.565052 7.33414 0.650467C7.33414 0.735881 7.31687 0.820459 7.28333 0.899363C7.24978 0.978266 7.20061 1.04995 7.13862 1.11031L2.27628 5.85012L15.3334 5.85012C15.5102 5.85012 15.6797 5.9186 15.8047 6.04049C15.9298 6.16238 16 6.3277 16 6.50008C16 6.67245 15.9298 6.83777 15.8047 6.95966C15.6797 7.08155 15.5102 7.15003 15.3334 7.15003L2.27628 7.15003L7.13862 11.8898C7.26371 12.0118 7.33399 12.1772 7.33399 12.3497C7.33399 12.5222 7.26371 12.6876 7.13862 12.8095C7.01354 12.9315 6.84388 13 6.66697 13C6.49007 13 6.32041 12.9315 6.19532 12.8095L0.195518 6.95992C0.133536 6.89956 0.0843648 6.82787 0.0508164 6.74897C0.0172679 6.67007 7.64923e-08 6.58549 7.75108e-08 6.50007C7.85294e-08 6.41466 0.017268 6.33008 0.0508164 6.25118C0.0843648 6.17228 0.133536 6.10059 0.195518 6.04023L6.19532 0.190622C6.25723 0.130192 6.33076 0.0822516 6.41169 0.0495435C6.49262 0.0168343 6.57937 7.84582e-08 6.66697 7.95029e-08C6.75458 8.05476e-08 6.84133 0.0168343 6.92226 0.0495435C7.00319 0.0822516 7.07671 0.130192 7.13862 0.190622Z" fill="currentColor"/>
        </svg>
        <span>Back</span>
      </button>

      {/* Modal */}
      <Modal
        title=""
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        closable={false}
        centered
        className="backdrop-blur-md"
      >
        {renderModalContent()}
      </Modal>

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

      {/* Mobile Phone OTP Modal */}
      {showMobileSignIn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#3A599C]">Phone Authentication</h3>
              <button
                onClick={() => {
                  setShowMobileSignIn(false);
                  setPhoneAuthStep('phone');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="text-gray-500 hover:text-[#3A599C] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-6">
              {phoneAuthStep === 'phone' ? renderPhoneInput() : renderOtpInput()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;