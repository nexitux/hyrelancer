'use client'
import { useState } from 'react';
import FormInput from './FormInput';
import SocialLoginButtons from './SocialLoginButtons';
import useAuth from '@/hooks/useAuth'
import { capitalizeFirst, capitalizeWords } from '@/lib/utils';
const AuthForm = ({ isLogin, toggleAuthMode }) => {
  const { isLoading, errors, handleRegister, handleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!isLogin && !formData.mobile.trim()) newErrors.mobile = 'Phone number is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!isLogin && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords don't match";
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isLogin) {
      await handleLogin({
        email: formData.email,
        password: formData.password,
      });
    } else {
      await handleRegister(formData);
    }
  };

  return (
    <div className="flex overflow-y-auto justify-center items-center p-8 w-full rounded-r-2xl lg:w-1/2">
      <div className="w-full max-w-md">
        <div className="text-center transition-all duration-500 ease-in-out lg:text-left">
          <h2 className="mb-2 text-3xl font-extrabold text-gray-900 transition-all duration-300 dark:text-white">
            {isLogin ? capitalizeWords('Welcome Back') : capitalizeWords('Join Our Freelance Community')}
          </h2>
          <p className="mb-8 text-gray-600 transition-all duration-300 dark:text-gray-300">
            {isLogin ? capitalizeFirst('Sign in to access your account') : capitalizeFirst('Create your account to start finding jobs')}
          </p>
        </div>

        <SocialLoginButtons />

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <FormInput
              label={capitalizeWords("Full Name")}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
              required
            />
          )}

          <FormInput
            label={capitalizeWords("Email Address")}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            required
          />

          {!isLogin && (
            <FormInput
              label={capitalizeWords("Phone Number")}
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              error={errors.mobile}
              placeholder="+1 (555) 123-4567"
              required
            />
          )}

          <FormInput
            label={capitalizeFirst("Password")}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            placeholder="••••••••"
            required
          />

          {!isLogin && (
            <FormInput
              label="Confirm Password"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              error={errors.confirm_password}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              placeholder="••••••••"
              required
            />
          )}

          {isLogin && (
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center items-center px-4 py-3 w-full text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="mr-2 w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Register'
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={toggleAuthMode}
            className="ml-1 font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;