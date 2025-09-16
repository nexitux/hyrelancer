'use client'
import { FaGoogle, FaLinkedin, FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SocialLoginButtons = () => {
  const handleSocialLogin = (provider) => {
    toast.info(`Login with ${provider} coming soon`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleSocialLogin('Google')}
          className="flex justify-center items-center px-4 py-2 bg-red-50 rounded-lg border border-red-200 transition-all duration-200 hover:bg-red-100 hover:scale-105"
        >
          <FaGoogle className="text-red-500" />
        </button>
        <button
          onClick={() => handleSocialLogin('LinkedIn')}
          className="flex justify-center items-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-200 hover:bg-blue-100 hover:scale-105"
        >
          <FaLinkedin className="text-blue-600" />
        </button>
        <button
          onClick={() => handleSocialLogin('GitHub')}
          className="flex justify-center items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:bg-gray-100 hover:scale-105"
        >
          <FaGithub className="text-gray-700" />
        </button>
      </div>
      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="px-3 text-sm text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">
          or continue with email
        </span>
        <hr className="flex-grow border-gray-300" />
      </div>
    </div>
  );
};

export default SocialLoginButtons;