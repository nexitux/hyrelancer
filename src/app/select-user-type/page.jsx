'use client';
import "../../styles/globals.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserTie, FaBusinessTime, FaArrowRight, FaCheck } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '@/hooks/useAuth';
import ErrorModal from '../../components/ErorrModal/page';
import Image from 'next/image';

export default function SelectUserTypePage() {
  const [selectedType, setSelectedType] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({});
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
        console.log('✅ User type submission successful, showing success modal');
        
        // Show success modal first
        setSuccessModalContent({
          type: 'success',
          title: 'Welcome to Hyrelancer!',
          message: `You've successfully selected ${selectedType === 'freelancer' ? 'Freelancer' : 'Customer'} account type.`,
          userType: selectedType
        });
        setShowSuccessModal(true);
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

  const handleSuccessModalOk = () => {
    setShowSuccessModal(false);
    
    // Handle redirect based on user type selection
    const userType = selectedType.toLowerCase();
    
    if (userType === 'freelancer') {
      console.log('👨‍💼 Redirecting freelancer to registration');
      router.replace('/registration/profile-setup');
    } else if (userType === 'client') {
      console.log('👔 Redirecting customer to home');
      router.replace('/');
    }
  };

  const renderSuccessModalContent = () => {
    return (
      <div className="flex flex-col items-center bg-transparent">
        <div className="w-20 h-20 bg-[#3A599C]/10 rounded-full flex items-center justify-center mt-4 mb-6">
          <svg className="w-12 h-12 text-[#3A599C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">{successModalContent.title}</h3>
        <p className="text-gray-600 mb-8 px-8 text-center">{successModalContent.message}</p>
        <div className="w-full border-t border-gray-100 mb-4"></div>
        <button
          onClick={handleSuccessModalOk}
          className="w-full py-4 bg-[#3A599C] text-white font-medium hover:bg-[#2d4577] transition-colors rounded-2xl"
        >
          Continue to Dashboard
        </button>
      </div>
    );
  };

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
        {/* Top Row: Logo */}
        <div className="absolute top-8 left-8 w-full flex items-center px-12 mb-20 z-20">
          <img
            src="/images/hyrelancerWhite.png"
            alt="hyrelancer logo"
            className="h-16 object-contain"
            style={{ minWidth: 90, marginTop: 0 }}
          />
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-[140px] left-36 max-w-[800px] animate-fade-in">
          <h1 className="text-white text-[56px] font-normal leading-[56px] mb-8">
            Choose Your Path
            <br />
            <span className="text-[#3A599C]">Start Your Journey</span>
          </h1>
          <p className="text-[#F4F4F4] text-base font-bold leading-6 mb-8">
            Whether you're looking to offer your skills or find talented professionals, 
            Hyrelancer provides the perfect platform to connect and grow your business.
          </p>
        </div>
      </div>

      {/* Right Side - Selection Form */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6 relative z-10 h-full">
        <div className="w-full max-w-[662px] bg-white rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] p-4 sm:p-6 lg:p-8 xl:p-12 animate-fade-in shadow-2xl lg:shadow-2xl max-h-[95vh] overflow-y-auto">
          <div className="w-full max-w-[382px] mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 min-h-[500px] sm:min-h-[600px]">
            <ToastContainer position="top-center" />

            <ErrorModal
              isOpen={showErrorModal}
              onClose={() => setShowErrorModal(false)}
              error={errorModalContent}
              type="error"
            />

            {/* Success Modal */}
            {showSuccessModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6">
                  {renderSuccessModalContent()}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col items-center gap-2 sm:gap-4">
              <h2 className="text-[#3A599C] text-2xl sm:text-3xl lg:text-4xl font-normal text-center">
                Welcome to Hyrelancer
              </h2>
              <p className="text-black text-sm sm:text-base font-bold text-center">
                How would you like to use our platform?
              </p>
            </div>

            {/* Selection Cards */}
            <div className="space-y-4 sm:space-y-6">
              {/* Freelancer Card */}
              <div
                className={`relative p-5 sm:p-6 border-2 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300 ${
                  selectedType === 'freelancer'
                    ? 'border-[#3A599C] bg-[#3A599C]/5 shadow-lg'
                    : 'border-[#888888] hover:border-[#3A599C] hover:shadow-md'
                }`}
                onClick={() => setSelectedType('freelancer')}
              >
                <div className="flex items-center">
                  <div className={`p-3 sm:p-4 mr-4 rounded-xl transition-colors duration-300 ${
                    selectedType === 'freelancer' ? 'bg-[#3A599C]/10' : 'bg-gray-100'
                  }`}>
                    <FaUserTie className={`${selectedType === 'freelancer' ? 'text-[#3A599C]' : 'text-gray-600'}`} size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 transition-colors duration-300">
                      Freelancer
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 transition-colors duration-300">
                      I want to offer my services
                    </p>
                  </div>
                  <div
                    className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                      selectedType === 'freelancer'
                        ? 'border-[#3A599C] bg-[#3A599C]'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedType === 'freelancer' && <FaCheck className="text-white text-xs sm:text-sm" />}
                  </div>
                </div>
                {selectedType === 'freelancer' && (
                  <div className="absolute -bottom-2 -right-2 bg-[#3A599C] text-white p-2 rounded-full transition-all duration-300 shadow-lg">
                    <FaArrowRight size={16} />
                  </div>
                )}
              </div>

              {/* Customer Card */}
              <div
                className={`relative p-5 sm:p-6 border-2 rounded-2xl sm:rounded-3xl cursor-pointer transition-all duration-300 ${
                  selectedType === 'client'
                    ? 'border-[#3A599C] bg-[#3A599C]/5 shadow-lg'
                    : 'border-[#888888] hover:border-[#3A599C] hover:shadow-md'
                }`}
                onClick={() => setSelectedType('client')}
              >
                <div className="flex items-center">
                  <div className={`p-3 sm:p-4 mr-4 rounded-xl transition-colors duration-300 ${
                    selectedType === 'client' ? 'bg-[#3A599C]/10' : 'bg-gray-100'
                  }`}>
                    <FaBusinessTime className={`${selectedType === 'client' ? 'text-[#3A599C]' : 'text-gray-600'}`} size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 transition-colors duration-300">
                      Customer
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 transition-colors duration-300">
                      I want to hire freelancers
                    </p>
                  </div>
                  <div
                    className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                      selectedType === 'client'
                        ? 'border-[#3A599C] bg-[#3A599C]'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedType === 'client' && <FaCheck className="text-white text-xs sm:text-sm" />}
                  </div>
                </div>
                {selectedType === 'client' && (
                  <div className="absolute -bottom-2 -right-2 bg-[#3A599C] text-white p-2 rounded-full transition-all duration-300 shadow-lg">
                    <FaArrowRight size={16} />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedType || isLoading}
              className="w-full h-10 sm:h-11 lg:h-12 px-4 sm:px-5 lg:px-6 rounded-2xl sm:rounded-3xl bg-[#3A599C] text-white font-bold text-sm sm:text-base hover:bg-[#2d4577] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleSubmit}
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

            {/* Footer Text */}
            <div className="text-center text-sm text-gray-500 transition-colors duration-300">
              You can change this later in your account settings
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Logo */}
      <div className="lg:hidden absolute top-4 left-4 z-20">
        <div className="text-white text-xl font-bold">hyrelancer</div>
      </div>
    </div>
  );
}