"use client";
// pages/reset-password.jsx (or app/reset-password/page.jsx for App Router)

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Define your API base URL here for consistency
const API_BASE_URL = 'https://test.hyrelancer.in/api';

// Custom hook for password validation (No changes needed)
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

// Password Input Component (No changes needed)
const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onTogglePassword,
  error,
  success
}) => {
  const borderColor = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : success
      ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
      : 'border-gray-300 focus:ring-[#3a599c] focus:border-[#3a599c]';

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 ${borderColor}`}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3a599c] focus:ring-offset-2 rounded-md p-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

// Validation Checklist Component (No changes needed)
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

// Main Reset Password Component - Now reads URL params
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for email/token from URL
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [mobile, setMobile] = useState(null);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  // Existing state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const { validation, isValid: isNewPasswordValid } = usePasswordValidation(newPassword);
  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const isFormValid = isNewPasswordValid && passwordsMatch;

  // Effect to read token and email from URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');
    const mobileFromUrl = searchParams.get('mobile');

    if (tokenFromUrl && emailFromUrl) {
      // Email/token reset flow
      setToken(tokenFromUrl);
      setEmail(emailFromUrl);
    } else {
      // Try reading mobile from sessionStorage first (set by modal)
      let mobileFromSession = null;
      try {
        mobileFromSession = sessionStorage.getItem('resetMobile');
      } catch (e) {
        console.warn('sessionStorage unavailable:', e);
      }

      if (mobileFromSession) {
        setMobile(mobileFromSession);
      } else if (mobileFromUrl) {
        // backward-compatibility if mobile was passed via URL (not recommended)
        setMobile(mobileFromUrl);
      } else {
        // No token/email/mobile found — this page expects to be reached after OTP
        console.log("Token/email/mobile not found. The user should start the forgot-password flow again.");
      }
    }
  }, [searchParams]);


  const handleSubmit = async () => {
    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setIsTokenInvalid(false);

    // Differentiates between the email/token flow and the original flow
    if (token && email) {
      // === EMAIL/TOKEN RESET FLOW ===
      try {
        const response = await fetch(`${API_BASE_URL}/reset-password/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            token,
            password: newPassword,
            password_confirmation: confirmPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSubmitSuccess(true);
        } else {
          // Check for specific "invalid token" message from backend
          if (data.message && data.message.toLowerCase().includes('token')) {
            setIsTokenInvalid(true);
          }
          setSubmitError(data.message || 'An unexpected error occurred.');
        }
      } catch (error) {
        setSubmitError(error.message || 'Network error occurred. Please check your connection.');
      } finally {
        setIsSubmitting(false);
      }

    } else {
      // === ORIGINAL (MOBILE/OTP) FLOW ===
      // This logic is preserved exactly as it was.
      if (!mobile) {
        setSubmitError('Session expired or missing mobile number. Please request a new OTP.');
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/forgot-password/new-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile: mobile,           // <-- include mobile in body as backend expects
            password: newPassword,
          }),
        });

        const data = await response.json();

        if (response.ok && (data.status === 'success' || data.status === 'ok' || data.status === 1)) {
          // clear stored mobile after success
          try {
            sessionStorage.removeItem('resetMobile');
          } catch (e) {
            console.warn('sessionStorage unavailable while clearing:', e);
          }
          setSubmitSuccess(true);
        } else {
          setSubmitError(data.message || 'An unexpected error occurred.');
        }
      } catch (error) {
        setSubmitError(error.message || 'Network error occurred. Please check your connection.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Countdown and redirect effect (no changes needed)
  useEffect(() => {
    if (submitSuccess) {
      const timer = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);

      const redirectTimer = setTimeout(() => {
        router.push('/Login');
      }, 3000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimer);
      };
    }
  }, [submitSuccess, router]);

  const newPasswordError = newPassword && !isNewPasswordValid
    ? 'Password does not meet all requirements'
    : '';

  const confirmPasswordError = confirmPassword && !passwordsMatch
    ? 'Passwords do not match'
    : '';

  // Invalid Token Screen
  if (isTokenInvalid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-6">This password reset link is no longer valid. Please request a new one.</p>
          <Link href="/forgot-password" className="w-full inline-block bg-[#3a599c] text-white font-medium rounded-lg py-3 px-6 hover:brightness-90 transition-all duration-200">
            Request a New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  // Success Screen (No changes needed)
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-4">Your password has been updated successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to login page in <span className="font-bold text-lg text-blue-600">{countdown}</span> seconds...</p>
        </div>
      </div>
    );
  }

  // Main Form Render (mostly unchanged)
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-center min-h-screen px-8">
        <div className="w-full max-w-7xl flex items-center">
          <div className="w-3/5 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <Image
                src="/images/hero-illustration.png"
                alt="Team collaboration illustration"
                width={600}
                height={400}
                className="w-full h-auto max-w-2xl"
                priority
              />
            </div>
          </div>

          <div className="w-2/5 flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create new password</h1>
                <p className="text-gray-600">Please create a strong password for your account.</p>
                {(email || mobile) && (
                  <p className="text-sm text-blue-700 mt-2">
                    Resetting password for: <span className="font-medium">{email ? email : `+91 ${mobile}`}</span>
                  </p>
                )}              </div>

              <div className="space-y-6">
                <PasswordInput
                  id="new-password"
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter your new password"
                  showPassword={showNewPassword}
                  onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                  error={newPasswordError}
                  success={newPassword && isNewPasswordValid}
                />
                {newPassword && (
                  <ValidationChecklist validation={validation} />
                )}
                <PasswordInput
                  id="confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm your new password"
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  error={confirmPasswordError}
                  success={passwordsMatch}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full bg-[#3a599c] text-white font-medium rounded-lg py-3 px-6 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[#3a599c]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? 'Updating password...' : 'Update password'}
                </button>
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        <div className="flex-shrink-0 py-8 px-4 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10">
              <Image
                src="/images/hero-illustration.png"
                alt="Team collaboration illustration"
                width={400}
                height={267}
                className="w-full h-auto max-w-sm"
                priority
              />
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 pb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mx-auto max-w-sm">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">Create new password</h1>
              <p className="text-gray-600 text-sm">Please create a strong password for your account.</p>
              {(email || mobile) && (
                <p className="text-sm text-blue-900 mt-2">
                  Resetting for: <span className="font-medium">{email ? email : `+91 ${mobile}`}</span>
                </p>
              )}
            </div>

            <div className="space-y-5">
              <PasswordInput
                id="new-password-mobile"
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter your new password"
                showPassword={showNewPassword}
                onTogglePassword={() => setShowNewPassword(!showNewPassword)}
                error={newPasswordError}
                success={newPassword && isNewPasswordValid}
              />
              {newPassword && (
                <ValidationChecklist validation={validation} />
              )}
              <PasswordInput
                id="confirm-password-mobile"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm your new password"
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                error={confirmPasswordError}
                success={passwordsMatch}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="w-full h-12 bg-[#3a599c] text-white font-medium rounded-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-[#3a599c]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? 'Updating password...' : 'Update password'}
              </button>
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {submitError && `Error: ${submitError}`}
        {submitSuccess && 'Password updated successfully'}
      </div>
    </div>
  );
}

// Export a default component that includes the Suspense wrapper for convenience
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}