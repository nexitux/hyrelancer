'use client';
import { useState } from 'react';
import { FiLayout, FiMessageSquare, FiUser, FiBriefcase, FiAward, FiShare2, FiFolder, FiKey, FiLogOut, FiUserMinus, FiGrid } from 'react-icons/fi';
import Head from 'next/head';

export default function ChangePassword() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    email: 'hi.avitex@gmail.com',
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
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle password change logic here
      console.log('Password change submitted:', formData);
      // You would typically make an API call here
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your Email..."
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a599c] focus:border-transparent"
                  />
                </div>

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
                    className="w-full py-3 px-4 bg-[#3a599c] text-white font-medium rounded-lg hover:bg-[#2d4373] focus:outline-none focus:ring-2 focus:ring-[#3a599c] focus:ring-offset-2 transition-colors"
                  >
                    Change Password
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