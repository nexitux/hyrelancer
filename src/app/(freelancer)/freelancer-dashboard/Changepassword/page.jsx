'use client';
import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios'; // Import axios here

export default function ChangePassword() {
  // Add state for messages and loading
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) { // Match backend validation (min:6)
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Clear previous messages
    if (validateForm()) {
      setLoading(true);
      try {
        // Retrieve JWT token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage({ text: 'Authentication token not found. Please log in.', type: 'error' });
          setLoading(false);
          return;
        }

        const backendUrl = 'http://test.hyrelancer.in/api'

        const response = await axios.post(
          `${backendUrl}/changePassword`,
          {
            current_password: formData.oldPassword,
            new_password: formData.newPassword
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // Handle success
        setMessage({ text: response.data.message || 'Password changed successfully!', type: 'success' });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
        setErrors({});

      } catch (error) {
        // Handle API errors
        console.error('Password change error:', error.response?.data);
        if (error.response?.status === 400) {
          setMessage({ text: error.response.data.message || 'Current password is incorrect.', type: 'error' });
        } else if (error.response?.status === 401) {
          setMessage({ text: 'Unauthorized. Please log in again.', type: 'error' });
        } else if (error.response?.data?.errors) {
          // Handle Laravel validation errors
          const apiErrors = error.response.data.errors;
          const newErrors = {};
          if (apiErrors.current_password) newErrors.oldPassword = apiErrors.current_password[0];
          if (apiErrors.new_password) newErrors.newPassword = apiErrors.new_password[0];
          setErrors(newErrors);
        } else {
          setMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Change Password | FreelanHub</title>
        <meta name="description" content="Change your account password" />
        <link rel="shortcut icon" href="/assets/images/fav.png" type="image/x-icon" />
      </Head>

      <div className="min-h-screen bg-gray-50 w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">

          {/* Main Content */}
          <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h2>
                <p className="text-gray-600">Update your account password</p>
              </div>

              {message.text && (
                <div className={`mb-4 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Old Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    placeholder="Old Password..."
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a599c] focus:border-transparent"
                  />
                  {errors.oldPassword && <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="New Password..."
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a599c] focus:border-transparent"
                  />
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm New Password..."
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a599c] focus:border-transparent"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#3a599c] text-white font-medium rounded-lg hover:bg-[#2d4373] focus:outline-none focus:ring-2 focus:ring-[#3a599c] focus:ring-offset-2 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}