"use client";

import React from "react";

export const FeatureCard = () => {
  return (
    <section className="flex flex-col items-center gap-2.5 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative self-stretch w-full flex-[0_0_auto]">
      {/* Background decorative element - Responsive */}
      <div className="absolute top-[calc(50.00%-_291px)] left-[calc(50.00%-_721px)] w-[1442px] h-[583px] opacity-20 pointer-events-none z-0 hidden lg:block">
        <div className="w-full h-full bg-gradient-to-r from-blue-400/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div
        className="flex flex-col lg:flex-row w-full items-center gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-12 relative flex-[0_0_auto] bg-[#375a9f] rounded-[16px] sm:rounded-[24px] lg:rounded-[32px] overflow-hidden"
        style={{
          maxWidth: "1550px",
        }}
      >
        {/* Pattern Background Layer - Responsive */}
        <div 
          className="absolute top-0 right-0 bottom-0 left-auto opacity-20 pointer-events-none hidden lg:block"
          style={{
            backgroundImage: "url('/images/pattern.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "right center",
            right: 0,
            left: "840px",
            width: "60%",
            maxWidth: "none",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right",
          }}
        ></div>
        
        {/* Video Section - Responsive */}
        <div className="relative w-full sm:w-[280px] md:w-[320px] lg:w-[369px] h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] rounded-lg overflow-hidden z-10 flex-shrink-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            src="/images/hyrelancer animation.mp4"
            aria-label="Freelance journey animation"
            poster="/images/hyrelancerMain.png"
          />
        </div>

        <div className="flex flex-col items-start justify-center gap-4 sm:gap-6 relative flex-1 grow z-10 lg:pl-8 text-center lg:text-left">
          <div className="flex flex-col items-start gap-4 sm:gap-6 relative self-stretch w-full flex-[0_0_auto]">
            <h1 className="relative text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-center lg:text-left leading-tight">
              Embrace Independence
              <br />
              Start Your Freelance Journey Now
            </h1>

            <p className="relative self-stretch font-body font-[number:var(--body-font-weight)] text-white text-[length:var(--body-font-size)] tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] [font-style:var(--body-font-style)] text-base sm:text-lg text-center lg:text-left">
              Connect with your Designer in minutes
            </p>

            {/* Background decorative element - Responsive */}
            <div className="absolute top-[calc(50.00%-_168px)] left-[calc(50.00%-_776px)] w-[1150px] h-[432px] opacity-10 hidden lg:block">
              <div className="w-full h-full bg-gradient-to-r from-blue-300/20 to-transparent rounded-full blur-3xl"></div>
            </div>
          </div>

          <button
            className="inline-flex h-[45px] sm:h-[50px] items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-4 relative rounded-2xl sm:rounded-3xl border border-solid border-white bg-transparent cursor-pointer transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#375a9f] self-center lg:self-start"
            type="button"
            aria-label="Become A Freelancer"
          >
            <span className="relative w-fit font-body text-white text-[length:var(--body-font-size)] tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] whitespace-nowrap [font-style:var(--body-font-style)] font-medium text-sm sm:text-base">
              Become A Freelancer
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeatureCard;