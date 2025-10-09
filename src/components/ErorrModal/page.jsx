'use client';
import { useState, useEffect } from 'react';

const ErrorModal = ({ isOpen, onClose, error, type = 'error' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-16 h-16 bg-[#3A599C]/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#3A599C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-16 h-16 bg-[#3A599C]/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#3A599C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="w-16 h-16 bg-[#3A599C]/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#3A599C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-[#3A599C]/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#3A599C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-[#3A599C] hover:bg-[#2d4577]';
      case 'warning':
        return 'bg-[#3A599C] hover:bg-[#2d4577]';
      case 'info':
        return 'bg-[#3A599C] hover:bg-[#2d4577]';
      default:
        return 'bg-[#3A599C] hover:bg-[#2d4577]';
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl max-w-md w-full p-8 transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {getIcon()}
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {type === 'error' ? 'Error' : type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : 'Information'}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error}
          </p>
          
          <button
            onClick={onClose}
            className={`w-full py-3 text-white font-medium rounded-xl transition-colors duration-200 ${getButtonColor()}`}
          >
            {type === 'error' ? 'Try Again' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;