"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";

const LogoutModal = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#3a599c] to-[#2d4678] px-6 py-8 text-center">
          {/* Close Button */}
          {/* <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button> */}
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <LogOut className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* Title */}
          {/* <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Logout Confirmation
          </h2> */}
          
          {/* Subtitle */}
          <p className="text-white/90 text-sm sm:text-base">
            Are you sure you want to logout?
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-base leading-relaxed">
              You will be redirected to the login page and will need to sign in again to access your account.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 px-6 py-3 rounded-xl sm:rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold text-sm sm:text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Cancel
            </button>

            {/* Logout Button */}
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 h-12 px-6 py-3 rounded-xl sm:rounded-2xl bg-[#3a599c] text-white font-semibold text-sm sm:text-base hover:bg-[#2d4678] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500">
            Your account will be securely logout
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LogoutModal;
