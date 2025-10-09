"use client";

import React from 'react';
import Image from 'next/image';

const SimpleFooter = () => {
  return (
    <footer className="w-full bg-[#3636368F]">
      <div className="mx-auto max-w-full px-3 py-2">
        {/* Separator line */}
        <div className="w-full h-px bg-gray-600 mb-6 mt-2"></div>
        
        {/* Main footer bar */}
        <div 
          className="rounded-full px-12 py-4 backdrop-blur-md border border-white/10 shadow-lg"
          style={{ backgroundColor: '#3636368F' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white gap-4">
            {/* Left - Copyright */}
            <div className="text-center md:text-left">
              Copyright © All Rights Reserved.2025
            </div>
            
            {/* Center - Powered by */}
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <div className="flex items-center gap-1">
             
                <Image
                  src="/images/Nexit.png"
                  alt="NEXIT Logo"
                  width={32}
                  height={16}
                  className="h-8 w-8 object-contain ml-1"
                />
              </div>
   
            </div>
            
            {/* Right - Navigation links */}
            <div className="flex gap-6 items-center text-center md:text-right">
              <a href="#" className="transition-colors hover:text-gray-300">Content Privacy</a>
              <a href="/privacy-policy" className="transition-colors hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-gray-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;
