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

  return (
    <div
      ref={sectionRef}
      className="w-full h-[60vh] relative px-4 xl:px-0 text-white flex items-center overflow-hidden"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-fill"
        src="/images/testtt.mp4"
        aria-label="Background video showing professional work environment"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* Content */}
      <div className="relative z-10 w-full mx-auto px-4 text-left"style={{ maxWidth: "1550px" }}>
        {/* Small tagline */}
        <div className={`mb-2 transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <p className="text-sm sm:text-base text-[#3A599C] font-medium">
            Boost Your Working Flow
          </p>
        </div>

        {/* Main Headings */}
        <h1 className={`text-4xl sm:text-4xl md:text-4xl lg:text-4xl font-bold mb-4 leading-tight transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block">Embark On Your Journey To</span>
          <br />
          <span className="inline-block">Success With Hyrelancer!</span>
        </h1>

        {/* Description */}
        <p className={`text-base sm:text-lg md:text-xl text-gray-200 mb-8 max-w-2xl transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          Explore opportunities and unleash your potential today. Start building meaningful connections and achieve your goals with ease.
        </p>

        {/* CTA Button */}
        <div className={`transition-all duration-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
          <button className="px-8 py-4 bg-[#3A599C] hover:bg-[#3A599C]/80 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
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
      `}</style>
    </div>
  );
};

export default VideSection;
