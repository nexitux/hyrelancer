"use client";
import React, { useState, useEffect, useRef } from 'react';


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
      { threshold: 0.3 }
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

  return (
    <div
      ref={sectionRef}
      className="w-full h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] xl:h-[70vh] relative px-4 sm:px-6 lg:px-8 xl:px-0 text-white flex items-center overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        src="/images/testtt.mp4"
        aria-label="Background video showing professional work environment"
        poster="/images/banner.png"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 sm:bg-black/70 z-0"></div>

      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left" style={{ maxWidth: "1550px" }}>
        {/* Small tagline */}
        <div className={`mb-2 sm:mb-3 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs sm:text-sm md:text-base text-[#3A599C] font-medium">
            Boost Your Working Flow
          </p>
        </div>

        {/* Main Headings */}
        <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block">Embark On Your Journey To</span>
          <br />
          <span className="inline-block">Success With Hyrelancer!</span>
        </h1>

        {/* Description */}
        <p className={`text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto sm:mx-0 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          Explore opportunities and unleash your potential today. Start building meaningful connections and achieve your goals with ease.
        </p>

        {/* CTA Button */}
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[#3A599C] hover:bg-[#3A599C]/80 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-sm sm:text-base">
            Get Started Now
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
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in-up { 
          animation: fade-in-up 1s ease-out forwards; 
        }
      `}</style>
    </div>
  );
};

export default VideSection;
