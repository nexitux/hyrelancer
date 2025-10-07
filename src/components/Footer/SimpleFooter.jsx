"use client";

import React from 'react';
import Image from 'next/image';

const SimpleFooter = () => {
  return (
    <footer className="w-full px-6 py-4 text-white bg-black">
      <div className="mx-auto max-w-7xl">
        {/* Footer Bottom - Only Copyright and Powered By */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex flex-col gap-4 justify-between items-center text-sm text-gray-400 md:flex-row">
            <div>©2025 Hyrelancer. All Rights Reserved.</div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500 mb-1 text-center w-full">Powered by</span>
              <div className="flex items-center justify-center gap-2 w-full">
                <Image src="/images/Nexit.png" alt="Powered by Company" width={100} height={30} className="h-6 w-auto object-contain mx-auto" />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <a href="#" className="transition-colors hover:text-white">Terms Of Services</a>
              <span className="hidden text-gray-600 md:inline">|</span>
              <a href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
