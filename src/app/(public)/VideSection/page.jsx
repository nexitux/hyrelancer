"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay } from "react-icons/fa6";
import banner from "../../../../public/images/banner2.png";

const VideSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef(null);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.8 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePlayClick = () => console.log('Video play clicked');

  return (
    <div
      ref={sectionRef}
      className="w-full h-100 bg-fixed bg-cover bg-center relative px-4 xl:px-0 text-white flex items-center overflow-hidden"
      style={{ backgroundImage: `url('${banner.src}')` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3e5a9a]/10 via-transparent to-[#3e5a9a]/10 animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 text-left">
        {/* Play Button */}
        <div className="mb-7 relative">
          <button
            onClick={handlePlayClick}
            className={`group relative w-13 h-13 md:w-15 md:h-15 bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer transition-all duration-500 hover:bg-[#3e5a9a] hover:scale-110 active:scale-95 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
            >
            <div className="absolute inset-0 rounded-full bg-[#3e5a9a]/80 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-[#3e5a9a]/60 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <FaPlay className="w-5 h-5 md:w-6 md:h-6 ml-0.5 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-full bg-[#3e5a9a] opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          </button>
        </div>

        {/* Headings */}
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 leading-tight transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block">Embark On Your Journey To</span>
          <br />
          <span className="inline-block font-bold">Success With Hyrelancer!</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-sm sm:text-base md:text-lg text-gray-200 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          Explore opportunities and unleash your potential today.
        </p>

        {/* CTA Button */}
        <div className={`mt-6 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <button className="group px-6 py-3 bg-[#3e5a9a] text-white rounded-lg font-semibold hover:bg-[#2d4373] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
            <span className="flex items-center justify-center gap-2">
              Get Started Now
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VideSection;
