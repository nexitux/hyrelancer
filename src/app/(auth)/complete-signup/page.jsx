"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { User, Mail, Phone, ArrowLeft, RefreshCcw } from 'lucide-react';
import api from '@/config/api';
import ErrorModal from '../../../components/ErorrModal/page';
import { loginSuccess } from '@/redux/slices/authSlice';

const CompleteSignupPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    
    const getMobileNumber = () => {
        try {
            const sessionMobile = sessionStorage.getItem('signupMobile');
            if (sessionMobile) {
                return sessionMobile;
            }
        } catch (e) {
            console.warn('sessionStorage unavailable:', e);
        }
        return searchParams.get('mobile');
    };
    
    const mobileNumber = getMobileNumber();
    
    // Check for Google signup parameters
    const googleId = searchParams.get('user_googleid');
    const googleEmail = searchParams.get('user_email');

    const [formData, setFormData] = useState({
        name: '',
        email: googleEmail || '',
        mobile: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalContent, setErrorModalContent] = useState('');

    // Redirect back if no mobile number and not a Google signup - but only check once on mount
    useEffect(() => {
        if (!mobileNumber && !googleId) {
            router.push('/Login');
        }
    }, []); // Remove mobileNumber and router from dependencies

    // Clear sessionStorage when component unmounts or after successful registration
    useEffect(() => {
        return () => {
            // Only clear if registration was not successful
            if (!formData.name && !formData.email) {
                try {
                    sessionStorage.removeItem('signupMobile');
                } catch (e) {
                    console.warn('sessionStorage unavailable:', e);
                }
            }
        };
    }, [formData.name, formData.email]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Mobile number validation (required for Google signup users)
        if (!mobileNumber && !formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!mobileNumber && formData.mobile.trim() && !/^\d{10}$/.test(formData.mobile.trim())) {
            newErrors.mobile = 'Please enter a valid 10-digit mobile number';
        }

        return newErrors;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const requestData = {
                name: formData.name.trim(),
                email: formData.email.trim()
            };
            
            // Add mobile number (from session or form input)
            if (mobileNumber) {
                requestData.mobile = mobileNumber;
            } else if (formData.mobile.trim()) {
                requestData.mobile = formData.mobile.trim();
            }
            
            // Add Google ID if available (for Google signup)
            if (googleId) {
                requestData.google_id = googleId;
            }
            
<<<<<<< HEAD
            const response = await api.post('https://backend.hyrelancer.in/api/google-register', requestData);
=======
            const response = await api.post('https://test.hyrelancer.in/api/google-register', requestData);
>>>>>>> 1229b14338b0244eb33d706807434741c3807c15

            console.log('Complete signup response:', response.data);
            console.log('User data from registration:', response.data.user);
            console.log('User type from registration:', response.data.user?.user_type);

            // Store all user data in Redux immediately after successful registration
            // For new Google signups, ensure user_type is null so they go to select-user-type page
            const userData = {
                user: {
                    ...(response.data.user || {
                        google_id: googleId,
                        name: formData.name,
                        email: response.data.email || formData.email,
                        mobile: formData.mobile || mobileNumber
                    }),
                    user_type: null // Force null for new signups to ensure they select user type
                },
                token: response.data.token,
                userType: null, // Force null for new signups
                slug: response.data.fp_slug || null
            };

            console.log('📦 Complete signup - storing user data:', userData);

            // Store data in localStorage FIRST (before Redux dispatch)
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                console.log('✅ Token stored in localStorage');
            }

            if (userData.user) {
                localStorage.setItem('user', JSON.stringify(userData.user));
                console.log('✅ User data stored in localStorage');
            }

            // Don't store userType for new signups - force them to select
            localStorage.setItem('userType', '');
            console.log('✅ UserType cleared for new signup');

            if (userData.slug) {
                localStorage.setItem('slug', userData.slug);
                console.log('✅ Slug stored in localStorage');
            }

            // Now dispatch to Redux
            dispatch(loginSuccess(userData));
            console.log('✅ User data dispatched to Redux from complete-signup');

            // Verify localStorage after storing
            console.log('🔍 Verifying localStorage after complete-signup:');
            console.log('Token:', !!localStorage.getItem('token'));
            console.log('User:', !!localStorage.getItem('user'));
            console.log('UserType:', localStorage.getItem('userType'));
            console.log('Slug:', localStorage.getItem('slug'));

            // Clear sessionStorage after successful registration
            try {
                sessionStorage.removeItem('signupMobile');
            } catch (e) {
                console.warn('sessionStorage unavailable:', e);
            }

            // Success - redirect back to Login page with Google parameters
            // This will trigger the handleGoogleLoginRedirect function which handles authorization
            // Add a small delay to ensure localStorage operations complete
            setTimeout(() => {
                if (response.data.token && googleId) {
                    const redirectUrl = `/Login?token=${encodeURIComponent(response.data.token)}&user_googleid=${encodeURIComponent(googleId)}&from_signup=true`;
                    console.log('🔄 Redirecting to Login page for authorization (from signup):', redirectUrl);
                    router.push(redirectUrl);
                } else {
                    // Fallback: redirect to Login page
                    console.log('🔄 Fallback redirect to Login page');
                    router.push('/Login?from_signup=true');
                }
            }, 100); // Small delay to ensure localStorage operations complete
            
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                
                // Handle specific "already registered" errors with modal
                if (errorData.errors) {
                    const backendErrors = {};
                    Object.keys(errorData.errors).forEach(key => {
                        backendErrors[key] = errorData.errors[key][0];
                    });
                    
                    // Check for already registered email
                    if (backendErrors.email && backendErrors.email.toLowerCase().includes('already')) {
                        setErrorModalContent('This email is already registered. Please use a different email or try logging in.');
                        setShowErrorModal(true);
                        return; // Don't set form errors, just show modal
                    } else if (backendErrors.mobile && backendErrors.mobile.toLowerCase().includes('already')) {
                        setErrorModalContent('This phone number is already registered. Please use a different number.');
                        setShowErrorModal(true);
                        return; // Don't set form errors, just show modal
                    }
                    
                    setErrors(backendErrors);
                } else if (errorData.status === 'error') {
                    // Check if it's an already registered error
                    if (errorData.message && errorData.message.toLowerCase().includes('already')) {
                        setErrorModalContent(errorData.message);
                        setShowErrorModal(true);
                    } else {
                        setErrors({ general: errorData.message });
                    }
                } else {
                    setErrors({ general: errorData.message || 'Failed to complete registration. Please try again.' });
                }
            } else {
                setErrors({ general: 'Network error. Please check your connection and try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!mobileNumber && !googleId) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                    <p className="text-gray-600">Just a few more details to get you started</p>
                </div>

                {/* Mobile Number Display or Google Signup Info */}
                {mobileNumber ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-green-700 font-medium">Verified Mobile Number</p>
                                <p className="text-green-800 font-semibold">+91 {mobileNumber}</p>
                            </div>
                        </div>
                    </div>
                ) : googleId ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Google Account Connected</p>
                                <p className="text-blue-800 font-semibold">{googleEmail}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Form */}
                <div className="space-y-6">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full name"
                                className={`w-full h-12 bg-gray-50 border ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-300 focus:ring-blue-100'} focus:ring-2 focus:bg-white rounded-xl pl-12 pr-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200`}
                            />
                        </div>
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>


                    {/* Mobile Number Field (only show for Google signup users) */}
                    {!mobileNumber && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                                    placeholder="Enter your 10-digit mobile number"
                                    maxLength={10}
                                    className={`w-full h-12 bg-gray-50 border ${errors.mobile ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-blue-300 focus:ring-blue-100'} focus:ring-2 focus:bg-white rounded-xl pl-12 pr-4 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200`}
                                />
                            </div>
                            {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCcw className="w-4 h-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            'Complete Registration'
                        )}
                    </button>
                </div>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push('/Login')}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-2 mx-auto transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </div>
            </div>
            
            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                error={errorModalContent}
                type="error"
            />
        </div>
    );
};

export default CompleteSignupPage;