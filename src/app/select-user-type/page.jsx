'use client';
import "../../styles/globals.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserTie, FaBusinessTime, FaArrowRight, FaCheck } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '@/hooks/useAuth';
import ErrorModal from '../../components/ErorrModal/page';

export default function SelectUserTypePage() {
  const [selectedType, setSelectedType] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');
  const { submitUserType, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      setErrorModalContent('Please select a user type to continue');
      setShowErrorModal(true);
      return;
    }

    try {
      console.log('🚀 Submitting user type:', selectedType);
      const result = await submitUserType(selectedType);

      if (result.success) {
        console.log('✅ User type submission successful, handling redirect');
        
        // Handle redirect based on user type selection
        const userType = selectedType.toLowerCase();
        
        if (userType === 'freelancer') {
          console.log('👨‍💼 Redirecting freelancer to registration');
          // For freelancers, they typically need to complete registration first
          router.replace('/registration/profile-setup');
        } else if (userType === 'customer') {
          console.log('👔 Redirecting customer to dashboard');
          // For customers, go directly to dashboard
          router.replace('/customer-dashboard');
        }
      } else {
        console.error('❌ User type submission failed:', result.error);
        setErrorModalContent(result.error || 'Failed to submit user type. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('❌ Unexpected error during user type submission:', error);
      setErrorModalContent('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
    }
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="p-8 w-full max-w-md bg-white rounded-2xl shadow-xl dark:bg-gray-800 transition-all duration-300">
        <ToastContainer position="top-center" />

        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          error={errorModalContent}
          type="error"
        />

        <div className="text-center mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
            Welcome to Hyrelancer
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
            How would you like to use our platform?
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-8 space-y-4">
            {/* Freelancer Card */}
            <div
              className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedType === 'freelancer'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 dark:border-gray-700 hover:shadow-sm'
              }`}
              onClick={() => setSelectedType('freelancer')}
            >
              <div className="flex items-center">
                <div className="p-3 mr-4 bg-blue-100 rounded-xl dark:bg-blue-900/50 transition-colors duration-300">
                  <FaUserTie className="text-blue-600 dark:text-blue-400" size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300">
                    Freelancer
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    I want to offer my services
                  </p>
                </div>
                <div
                  className={`ml-auto h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                    selectedType === 'freelancer'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedType === 'freelancer' && <FaCheck className="text-white text-xs" />}
                </div>
              </div>
              {selectedType === 'freelancer' && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full transition-all duration-300">
                  <FaArrowRight size={14} />
                </div>
              )}
            </div>

            {/* Customer Card */}
            <div
              className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedType === 'client'
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 dark:border-gray-700 hover:shadow-sm'
              }`}
              onClick={() => setSelectedType('client')}
            >
              <div className="flex items-center">
                <div className="p-3 mr-4 bg-purple-100 rounded-xl dark:bg-purple-900/50 transition-colors duration-300">
                  <FaBusinessTime className="text-purple-600 dark:text-purple-400" size={22} />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300">
                    Customer
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    I want to hire freelancers
                  </p>
                </div>
                <div
                  className={`ml-auto h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                    selectedType === 'client'
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {selectedType === 'client' && <FaCheck className="text-white text-xs" />}
                </div>
              </div>
              {selectedType === 'client' && (
                <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-1 rounded-full transition-all duration-300">
                  <FaArrowRight size={14} />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedType || isLoading}
            className={`px-6 py-3 w-full font-medium text-white rounded-xl shadow-md transition-all duration-300 ${
              selectedType === 'freelancer'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                : selectedType === 'client'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                : 'bg-gray-400 dark:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center justify-center">
              {isLoading ? (
                <>
                  <div className="mr-2 w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  {isHovered && selectedType && (
                    <span className="ml-2 transition-all duration-300">
                      <FaArrowRight />
                    </span>
                  )}
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
          You can change this later in your account settings
        </div>
      </div>
    </div>
  );
}