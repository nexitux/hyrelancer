'use client';
import { useState, useEffect,useRef } from 'react';
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
  const [isSignUpMode, setIsSignUpMode] = useState(false);
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
  const otpRefs = useRef([]);

  const { validation: passwordValidation, isValid: isPasswordValid } = usePasswordValidation(formData.password || '');

  // Phone OTP states
  const [showMobileSignIn, setShowMobileSignIn] = useState(false); // New state to toggle mobile sign in
  const [phoneAuthStep, setPhoneAuthStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Changed to 6 digits
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState(''); // New state for success message
  const [showPasswordFields, setShowPasswordFields] = useState({
    'signin-password': false,
    password: false,
    confirmPassword: false
  });

  const toggleShowPassword = (fieldKey) => {
    setShowPasswordFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Create your own courses',
    },
    {
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Work Near Home – Freelance in your community',
    },
    {
      image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Diverse Opportunities – Across various industries',
    },
    {
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Earn on Your Terms – Set your own schedule',
    },
    {
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Hyrelancer: Your Talent Marketplace',
    },
    {
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Empowering Freelancers, Driving Growth',
    },
  ];

  const captions = [
    'Discover freelance opportunities right in your community.',
    'Choose from a variety of projects across different industries.',
    'Set your own rates and create a flexible schedule.',
    'Hyrelancer connects businesses with top-tier freelancers across a wide range of industries, helping companies quickly find and collaborate with the right talent.',
    'We empower freelancers by providing a platform to showcase their skills and connect with clients. Hyrelancer is more than a job board - it is a community fostering growth and success.',
    'Join thousands of professionals who have found their perfect freelance opportunities through our platform.',
  ];

  // --- START of Google Login Integration ---
  useEffect(() => {
    const handleGoogleLoginRedirect = async () => {
      // Use window.location.search instead of location.search
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get('token');
      const googleId = queryParams.get('user_googleid');
      const urlError = queryParams.get('error');

      if (token && googleId) {
        setIsLoading(true);
        dispatch(loginStart());
        try {
          const backendUrl = 'https://test.hyrelancer.in/api';
          const response = await api.get(
            `${backendUrl}/getDatatByGoogleId?google_id=${googleId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );

          const data = response.data;
          dispatch(loginSuccess({
            user: data.user,
            token: data.token,
            userType: data.user.user_type,
            slug: data.fp_slug
          }));

          // REMOVED: Let AuthWrapper handle the redirect
          // const redirectPath = getRedirectPath(data.user);
          // router.push(redirectPath);

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
        const errorMessage = decodeURIComponent(urlError);
        dispatch(loginFailure(errorMessage));
        setErrorModalContent(errorMessage);
        setShowErrorModal(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleGoogleLoginRedirect();
  }, [dispatch]);
  // --- END of Google Login Integration ---

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

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
      console.log("Login API Response:", response);

      // Handle successful login with verified email
      if (response.data && response.data.access_token) {
        localStorage.setItem('suppressAutoRedirect', '1');

        dispatch(loginSuccess({
          user: response.data.user,
          token: response.data.access_token,
          userType: response.data.user.user_type,
          slug: response.data.fp_slug
        }));

        console.log("Login API Response:", response);
        console.log("Slug from response:", response.data.fp_slug);

        localStorage.setItem('token', response.data.access_token);

        // Show success modal without automatic redirect
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

        // Handle email not verified case with resend option
        if (errorData.error && errorData.error.toLowerCase().includes('email not verified')) {
          if (errorData.resend_available && errorData.email) {
            // Show resend email modal
            setRegisteredEmail(errorData.email);
            setShowEmailModal(true);
          } else {
            // Show generic email verification error
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

    // Perform password validation checks
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
        send_email: true // Add this flag to trigger email sending
      });

      if (response.data && response.data.message) {
        setRegisteredEmail(formData.email);
        setShowEmailModal(true);

        showSuccessNotification('Registration successful! Please check your email for verification.');

        // Reset form and switch to login after modal
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

        // Handle specific validation errors
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
    // if (modalContent.redirectPath) {
    //   router.push(modalContent.redirectPath);
    // }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
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
    window.location.href = 'https://test.hyrelancer.in/api/google/login';
  };

  const handleGoogleSignUp = () => {
    // Redirect to Google signup with callback to complete-signup page
    const frontendUrl = `${window.location.origin}/complete-signup`;
    const googleSignupUrl = `https://test.hyrelancer.in/api/google/signup?redirect_url=${encodeURIComponent(frontendUrl)}`;
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
      console.log('Send OTP API Response data:', response.data);

      if (isBackendSuccess(response.data)) {
        // success path
        setPhoneAuthStep('otp');
        setCountdown(30);
        setOtpSuccessMessage(response.data.message || 'OTP has been sent successfully.');
        setShowErrorModal(false);       // ensure any open error modal is closed
        // focus first otp input after small delay so DOM updates
        setTimeout(() => {
          const el = document.getElementById('otp-0');
          if (el) el.focus();
        }, 50);
      } else {
        // server returned a non-standard "success" text or something else - treat as error
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
    // allow only digits
    if (!/^\d*$/.test(value)) return;

    // keep a single digit per box
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // move focus to next input (use refs for reliability)
    if (value && index < otpRefs.current.length - 1) {
      // small timeout helps on some mobile keyboards
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

      // if current box has a digit, clear it
      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
        return;
      }

      // otherwise move focus to previous box
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
      console.log('Verify OTP API Response data:', response.data);

      if (isBackendSuccess(response.data) || (response.data.status && response.data.status.toString().toLowerCase() === 'success')) {
        const { user, token, fp_slug } = response.data;
        dispatch(loginSuccess({
          user: user,
          token: token,
          userType: user.user_type,
          slug: fp_slug
        }));

        localStorage.setItem('token', token);
        // const redirectPath = getRedirectPath(user);

        setModalContent({
          type: 'success',
          title: 'Login Successful!',
          message: 'Welcome back to Hyrelancer',
          // redirectPath
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
      console.log('Resend OTP API Response data:', response.data);

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
            Continue to Dashboard
          </button>
        </div>
      );
    } else if (modalContent.type === 'email_verification') {
      return (
        <div className="flex flex-col items-center bg-transparent">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mt-4 mb-6">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="w-full py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors rounded-2xl"
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
        {/* Render success message here */}
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

  return (
    <main className="min-h-screen flex items-center justify-center p-2 sm:p-4 lg:p-8 bg-gradient-to-br from-slate-100 via-gray-50 to-blue-50 relative">
      <Image
        src="/images/login-bg.jpg"
        alt="Background"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        priority
        quality={80}
        className="z-0"
      />

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

      <div className="w-full max-w-7xl min-h-[600px] h-auto lg:h-[900px] rounded-xl sm:rounded-2xl lg:rounded-[3.3rem] bg-white bg-opacity-90 backdrop-blur-md shadow-xl border border-white border-opacity-35 relative overflow-hidden">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="p-4 sm:p-6">
            {/* Mobile Carousel */}
            <div className="mb-6">
              <div className="h-48 sm:h-56 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
                {slides.map((slide, index) => (
                  <img
                    key={index}
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'
                      }`}
                  />
                ))}

                {/* Mobile Navigation Arrows */}
                <button
                  onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Mobile Content */}
              <div className="text-center mt-4 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {captions[currentSlide]}
                </p>

                {/* Mobile Dot Indicators */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index
                        ? 'w-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg'
                        : 'bg-gray-300/60 hover:bg-gray-400/60'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Forms */}
            {!isSignUpMode ? (
              // Mobile Sign In Form
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#3a599c] mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      className={`w-full h-12 sm:h-14 bg-gray-50/80 border-2 rounded-xl px-4 sm:px-6 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${errors.email ? 'border-red-300 bg-red-50' : 'border-transparent'
                        }`}
                      required
                      onFocus={() => handleFocus('signin-username')}
                      onBlur={handleBlur}
                      onChange={(e) => handleInputChange('signin-username', e.target.value)}
                      placeholder=" "
                    />
                    {!(focusedField === 'signin-username' || (formData && formData['signin-username'])) && (
                      <label className={`absolute left-4 sm:left-6 transition-all duration-300 pointer-events-none ${isFieldActive('signin-username')
                        ? 'top-0 text-xs text-gray-500 font-medium'
                        : 'top-1/2 -translate-y-1/2 text-gray-400'
                        }`}>
                        Username or Email
                      </label>
                    )}
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                  </div>

                  <div className="relative">
                    <input
                      type={showPasswordFields['signin-password'] ? 'text' : 'password'}
                      className={`w-full h-12 sm:h-14 bg-gray-50/80 border-2 rounded-xl px-4 sm:px-6 pr-12 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${errors.password ? 'border-red-300 bg-red-50' : 'border-transparent'
                        }`}
                      required
                      onFocus={() => handleFocus('signin-password')}
                      onBlur={handleBlur}
                      onChange={(e) => handleInputChange('signin-password', e.target.value)}
                      placeholder=" "
                    />

                    {/* eye toggle */}
                    <button
                      type="button"
                      aria-label={showPasswordFields['signin-password'] ? 'Hide password' : 'Show password'}
                      onClick={() => toggleShowPassword('signin-password')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPasswordFields['signin-password'] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {!(focusedField === 'signin-password' || (formData && formData['signin-username'])) && (
                      <label className={`absolute left-4 sm:left-6 transition-all duration-300 pointer-events-none ${isFieldActive('signin-username')
                        ? 'top-0 text-xs text-gray-500 font-medium'
                        : 'top-1/2 -translate-y-1/2 text-gray-400'
                        }`}>
                        Password
                      </label>
                    )}
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
                  </div>


                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalMode('forgot-password'); // ensure correct mode
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
                    className="w-full h-12 sm:h-14 bg-[#3d5999] text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#3d5999' }}
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

                  {/* Mobile Social Login */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Google Sign In Button (same size as Sign In button) */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      aria-label="Sign in with Google"
                      className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                    >
                      <GoogleOutlined className="w-4 h-4 mr-3" />
                      Sign in with Google
                    </button>

                    {/* Phone Authentication Logic */}
                    {!showMobileSignIn ? (
                      <button
                        type="button"
                        onClick={() => setShowMobileSignIn(true)}
                        className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                      >
                        <MailOutlined className="w-4 h-4 mr-3 text-white" />
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
              // Mobile Sign Up Form
              <div className="max-w-md mx-auto">
                <div className="flex flex-col items-center justify-center mb-6">
                  {/* <div className="rounded-xl flex items-center justify-center mx-auto mb-4">
                    <img
                      src="/images/logo.jpg"
                      alt="Hyrelancer Logo"
                      className="w-8 h-8 object-contain"
                    />
                  </div> */}
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#3a599c] mb-2">Get Started</h2>
                  <p className="text-gray-600 text-sm">Create your account to begin</p>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  {[
                    { field: 'name', label: 'Full Name', type: 'text' },
                    { field: 'email', label: 'Email Address', type: 'email' },
                    { field: 'mobile', label: 'Mobile Number', type: 'tel' },
                    { field: 'password', label: 'Password', type: 'password' },
                    { field: 'confirmPassword', label: 'Confirm Password', type: 'password' }
                  ].map(({ field, label, type }) => (
                    <div key={field}>
                      <div className="relative">
                        {(field === 'password' || field === 'confirmPassword') ? (
                          <>
                            <input
                              type={showPasswordFields[field] ? 'text' : 'password'}
                              className={`w-full h-12 bg-gray-50 border-2 rounded-lg px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-200 pr-12 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-transparent'
                                }`}
                              required
                              onFocus={() => handleFocus(field)}
                              onBlur={handleBlur}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              value={formData[field] || ''}
                              placeholder=" "
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
                          <input
                            type={type}
                            className={`w-full h-12 bg-gray-50 border-2 rounded-lg px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-200 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-transparent'
                              }`}
                            required
                            onFocus={() => handleFocus(field)}
                            onBlur={handleBlur}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            value={formData[field] || ''}
                            placeholder=" "
                          />
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

                      {/* Conditionally render the checklist for the password field */}
                      {field === 'password' && formData.password && (
                        <div className="mt-2">
                          <ValidationChecklist validation={passwordValidation} />
                        </div>
                      )}
                      {/* Conditionally render the confirm password error */}
                      {field === 'confirmPassword' && errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.confirmPassword) ? errors.confirmPassword[0] : errors.confirmPassword}</p>
                      )}
                      {/* Conditionally render the password error */}
                      {field === 'password' && errors.password && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>
                      )}
                      {/* Render other field errors */}
                      {field !== 'password' && field !== 'confirmPassword' && errors[field] && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</p>
                      )}
                    </div>
                  ))}


                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  {/* Social Signup Options */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                    </div>
                  </div>

                  {/* Google Sign Up Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    aria-label="Sign up with Google"
                    className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                  >
                    <GoogleOutlined className="w-4 h-4 mr-3" />
                    Sign up with Google
                  </button>

                  {/* Sign up with Mobile -> open shared modal in signup mode */}
                  {/* <button
                    type="button"
                    onClick={() => {
                      setForgotModalMode('signup');           // open modal in signup mode
                      setIsForgotModalOpen(true);             // show modal
                      // optionally prefill modal mobile input if user typed it in form
                      if (formData.mobile) {
                        // if your modal accepts initialMobile prop this will prefill it
                        // (we pass initialMobile when rendering the modal below)
                      }
                    }}
                    className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm mt-3"
                  >
                    <MailOutlined className="w-4 h-4 mr-3 text-gray-500" />
                    Sign up with Mobile
                  </button> */}

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

        {/* Desktop Layout */}
        <div className="hidden absolute inset-5 lg:flex">
          {/* Forms Section */}
          <div className={`relative h-full w-[45%] transition-transform duration-500 ease-in-out ${isSignUpMode ? 'translate-x-[122%]' : ''
            }`}>
            {/* Sign In Form */}
            <div className={`absolute w-full h-full transition-opacity duration-300 ${!isSignUpMode ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}>
              <div className="h-full flex flex-col justify-center">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#3a599c] mb-3">Welcome Back</h2>
                  <p className="text-gray-600 text-lg">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-6 max-w-sm mx-auto w-full">
                  <div className="relative">
                    <input
                      type="text"
                      className={`w-full h-14 bg-gray-50/80 border-2 rounded-2xl px-6 text-gray-900 text-lg focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm ${errors.email ? 'border-red-300 bg-red-50' : 'border-transparent'
                        }`}
                      required
                      onFocus={() => handleFocus('signin-username')}
                      onBlur={handleBlur}
                      onChange={(e) => handleInputChange('signin-username', e.target.value)}
                      placeholder=" "
                    />
                    {!(
                      focusedField === 'signin-username' ||
                      (formData && formData['signin-username'])
                    ) && (
                        <label className={`absolute left-6 transition-all duration-300 pointer-events-none ${isFieldActive('signin-username')
                          ? 'top-0 text-sm text-gray-500 font-medium'
                          : 'top-1/2 -translate-y-1/2 text-gray-400 text-lg'
                          }`}>
                          Username or Email
                        </label>
                      )}
                    {errors.email && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.email) ? errors.email[0] : errors.email}</p>}
                  </div>

                  <div className="relative">
                    <input
                      type={showPasswordFields['signin-password'] ? 'text' : 'password'}
                      className={`w-full h-14 bg-gray-50/80 border-2 rounded-2xl px-6 text-gray-900 text-lg focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-300 shadow-sm pr-12 ${errors.password ? 'border-red-300 bg-red-50' : 'border-transparent'
                        }`}
                      required
                      onFocus={() => handleFocus('signin-password')}
                      onBlur={handleBlur}
                      onChange={(e) => handleInputChange('signin-password', e.target.value)}
                      placeholder=" "
                    />

                    <button
                      type="button"
                      aria-label={showPasswordFields['signin-password'] ? 'Hide password' : 'Show password'}
                      onClick={() => toggleShowPassword('signin-password')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPasswordFields['signin-password'] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>

                    {!(focusedField === 'signin-password' || (formData && formData['signin-password'])) && (
                      <label className={`absolute left-6 transition-all duration-300 pointer-events-none ${isFieldActive('signin-password')
                        ? 'top-3 text-sm text-gray-500 font-medium'
                        : 'top-1/2 -translate-y-1/2 text-gray-400 text-lg'
                        }`}>
                        Password
                      </label>
                    )}
                    {errors.password && <p className="text-red-500 text-sm mt-1">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>}
                  </div>


                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotModalMode('forgot-password'); // ensure correct mode
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
                    className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-600">
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
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Google Sign In Button (matches sign-in size) */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      aria-label="Sign in with Google"
                      className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <GoogleOutlined className="w-4 h-4 mr-3" />
                      Sign in with Google
                    </button>

                    {/* Phone Authentication Logic */}
                    {!showMobileSignIn ? (
                      <button
                        type="button"
                        onClick={() => setShowMobileSignIn(true)}
                        className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MailOutlined className="w-4 h-4 mr-3 text-white" />
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
            </div>

            {/* Sign Up Form */}
            <div className={`absolute w-full h-full transition-opacity duration-300 ${isSignUpMode ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}>
              <div className="h-full flex flex-col justify-center">
                <div className="flex flex-col items-center justify-center mb-8">
                  {/* <div className=" to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <img
                      src="/images/logo.jpg"
                      alt="Hyrelancer Logo"
                      className="w-14 h-14 object-contain"
                    />
                  </div> */}
                  <h2 className="text-2xl font-semibold text-[#3a599c] mb-2">Get Started</h2>
                  <p className="text-gray-600">Create your account to begin</p>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-4 max-w-sm mx-auto w-full">
                  {[
                    { field: 'name', label: 'Full Name', type: 'text' },
                    { field: 'email', label: 'Email Address', type: 'email' },
                    { field: 'mobile', label: 'Mobile Number', type: 'tel' },
                    { field: 'password', label: 'Password', type: 'password' },
                    { field: 'confirmPassword', label: 'Confirm Password', type: 'password' }
                  ].map(({ field, label, type }) => (
                    <div key={field}>
                      <div className="relative">
                        {(field === 'password' || field === 'confirmPassword') ? (
                          <>
                            <input
                              type={showPasswordFields[field] ? 'text' : 'password'}
                              className={`w-full h-12 bg-gray-50 border-2 rounded-lg px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-200 pr-12 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-transparent'
                                }`}
                              required
                              onFocus={() => handleFocus(field)}
                              onBlur={handleBlur}
                              onChange={(e) => handleInputChange(field, e.target.value)}
                              value={formData[field] || ''}
                              placeholder=" "
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
                          <input
                            type={type}
                            className={`w-full h-12 bg-gray-50 border-2 rounded-lg px-4 text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none transition-all duration-200 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-transparent'
                              }`}
                            required
                            onFocus={() => handleFocus(field)}
                            onBlur={handleBlur}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            value={formData[field] || ''}
                            placeholder=" "
                          />
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

                      {/* Conditionally render the checklist for the password field */}
                      {field === 'password' && formData.password && (
                        <div className="mt-2">
                          <ValidationChecklist validation={passwordValidation} />
                        </div>
                      )}
                      {/* Conditionally render the confirm password error */}
                      {field === 'confirmPassword' && errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.confirmPassword) ? errors.confirmPassword[0] : errors.confirmPassword}</p>
                      )}
                      {/* Conditionally render the password error */}
                      {field === 'password' && errors.password && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p>
                      )}
                      {/* Render other field errors */}
                      {field !== 'password' && field !== 'confirmPassword' && errors[field] && (
                        <p className="text-red-500 text-xs mt-1">{Array.isArray(errors[field]) ? errors[field][0] : errors[field]}</p>
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  {/* Social Signup Options */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                    </div>
                  </div>

                  {/* Google Sign Up Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    aria-label="Sign up with Google"
                    className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <GoogleOutlined className="w-4 h-4 mr-3" />
                    Sign up with Google
                  </button>

                  {/* Sign up with Mobile -> open shared modal in signup mode */}
                  {/* <button
                    type="button"
                    onClick={() => {
                      setForgotModalMode('signup');
                      setIsForgotModalOpen(true);
                    }}
                    className="flex items-center justify-center h-12 sm:h-14 w-full bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium text-sm mt-4"
                  >
                    <MailOutlined className="w-4 h-4 mr-3 text-gray-500" />
                    Sign up with Mobile
                  </button> */}


                  <p className="text-center text-gray-600 text-sm mt-3">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUpMode(false)}
                      className="text-gray-900 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Carousel Section */}
          <div
            className={`relative h-full w-[55%] backdrop-blur-sm border border-white/20 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between p-8 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${isSignUpMode ? 'translate-x-[-81.8%]' : ''
              }`}
          >
            <Image
              src="/images/login2-bg.jpg"
              alt="Background"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
              quality={80}
              className="z-0"
            />
            {/* Modern Image Slider with Gradient Overlay */}
            <div className="h-[400px] rounded-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
              {slides.map((slide, index) => (
                <img
                  key={index}
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100' : 'opacity-0'
                    }`}
                />
              ))}

              {/* Slide Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Modern Content Area */}
            <div className="text-center space-y-6 px-4">
              <div className="h-10 overflow-hidden relative">
                <div
                  className="transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]"
                  style={{ transform: `translateY(-${currentSlide * 2.5}rem)` }}
                >
                  {slides.map((slide, index) => (
                    <h2
                      key={index}
                      className="text-3xl font-bold text-gray-900 mb-2"
                    >
                      {slide.title}
                    </h2>
                  ))}
                </div>
              </div>

              <div className="h-16 overflow-hidden relative">
                <div
                  className="transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]"
                  style={{ transform: `translateY(-${currentSlide * 4}rem)` }}
                >
                  {captions.map((caption, index) => (
                    <p key={index} className="text-gray-600 mb-4 leading-relaxed">
                      {caption}
                    </p>
                  ))}
                </div>
              </div>

              {/* Modern Dot Indicators */}
              <div className="flex justify-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index
                      ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg'
                      : 'bg-gray-300/60 hover:bg-gray-400/60'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      < ErrorModal
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

      {/* Forgot Password / Signup Modal (mode controlled by forgotModalMode) */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => {
          setIsForgotModalOpen(false);
          // reset mode to default so next open is predictable
          setForgotModalMode('forgot-password');
        }}
        mode={forgotModalMode}
        // only prefill when modal is in signup mode (avoid accidental prefill for forgot-password)
        initialMobile={forgotModalMode === 'signup' ? (formData.mobile || '') : ''}
      />
    </main>
  );
};

export default AuthForm;