"use client";

import React, { useState } from "react";

export default function WorkFlow() {
  const [activeTab, setActiveTab] = useState("provider");

  const providerSteps = [
    {
      number: "1",
      title: "Create a Profile",
      description: "Showcase your skills and portfolio.",
      image: "/images/service/1.webp",
    },
    {
      number: "2",
      title: "Find Projects",
      description: "Get matched or search for jobs that fit you.",
      image: "/images/service/2.webp",
    },
    {
      number: "3",
      title: "Start Working",
      description: "Collaborate with clients and deliver quality work.",
      image: "/images/service/3.webp",
    },
  ];

  const seekerSteps = [
    {
      number: "1",
      title: "Post Your Project",
      description: "Describe your project and requirements.",
      image: "/images/service/4.webp",
    },
    {
      number: "2",
      title: "Review Proposals",
      description: "Compare freelancer proposals and portfolios.",
      image: "/images/service/5.webp",
    },
    {
      number: "3",
      title: "Hire & Collaborate",
      description: "Select the best match and work together.",
      image: "/images/service/6.webp",
    },
  ];

  const steps = activeTab === "provider" ? providerSteps : seekerSteps;

  return (
    <section className="flex flex-col w-full max-w-full mx-auto items-start gap-12 px-4 py-12 relative bg-[#F4F4F4]">
      <header className="flex flex-col items-center gap-8 relative self-stretch w-full">
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
          <p className="relative self-stretch mt-[-1.00px] font-body font-[number:var(--body-font-weight)] text-[#3A599C] text-[length:var(--body-font-size)] text-center tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] [font-style:var(--body-font-style)]">
            Boost Your Working Flow
          </p>

          <h1 className="relative self-stretch font-head-2 font-[number:var(--head-2-font-weight)] text-gray-800 text-[length:var(--head-2-font-size)] text-center tracking-[var(--head-2-letter-spacing)] leading-[var(--head-2-line-height)] [font-style:var(--head-2-font-style)]">
            How Hyrelancer Works for
          </h1>
        </div>

        <div
          className="relative w-[326px] h-[54px] bg-white rounded-[32px] overflow-hidden border-[0.5px] border-solid border-gray-300"
          role="tablist"
        >
          <div
            className="absolute top-[3px] left-[3px] w-[167px] h-12 bg-[#3A599C] rounded-[32px] shadow-[1.8px_1.8px_1.8px_1.8px_#3a599c] transition-transform duration-300 ease-in-out"
            style={{
              transform:
                activeTab === "seeker" ? "translateX(156px)" : "translateX(0)",
            }}
            aria-hidden="true"
          />

          <div className="inline-flex items-center absolute top-[3px] left-0">
            <button
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 relative flex-[0_0_auto] rounded-3xl transition-colors duration-300"
              onClick={() => setActiveTab("provider")}
              role="tab"
              aria-selected={activeTab === "provider"}
              aria-controls="provider-panel"
            >
              <span
                className="relative w-fit mt-[-0.50px] font-body font-[number:var(--body-font-weight)] text-[length:var(--body-font-size)] tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] whitespace-nowrap [font-style:var(--body-font-style)] transition-colors duration-300"
                style={{
                  color:
                    activeTab === "provider"
                      ? "white"
                      : "#3a599c",
                }}
              >
                Service Provider
              </span>
            </button>

            <button
              className="inline-flex h-12 items-center justify-center gap-2.5 px-6 py-4 relative flex-[0_0_auto] rounded-3xl transition-colors duration-300"
              onClick={() => setActiveTab("seeker")}
              role="tab"
              aria-selected={activeTab === "seeker"}
              aria-controls="seeker-panel"
            >
              <span
                className="relative w-fit font-body font-[number:var(--body-font-weight)] text-[length:var(--body-font-size)] tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] whitespace-nowrap [font-style:var(--body-font-style)] transition-colors duration-300"
                style={{
                  color:
                    activeTab === "seeker"
                      ? "white"
                      : "#3a599c",
                }}
              >
                Service Seeker
              </span>
            </button>
          </div>
        </div>

        <p className="relative w-full max-w-[616px] font-body-bold font-[number:var(--body-regular-font-weight)] text-[#000] text-[length:var(--body-regular-font-size)] text-center tracking-[var(--body-regular-letter-spacing)] leading-[var(--body-regular-line-height)] [font-style:var(--body-regular-font-style)]">
          {activeTab === "provider" 
            ? "Finding the right projects has never been easier. Our simple process ensures you connect with the right opportunities quickly and securely."
            : "Finding the right freelancer has never been easier. Our simple process ensures you connect with the right talent quickly and securely."
          }
        </p>
      </header>

      <div
        className="flex items-start justify-center w-full px-4 lg:px-8 py-0"
        role="tabpanel"
        id={`${activeTab}-panel`}
      >
        <div className="relative w-full "style={{ maxWidth: "1500px" }}>
          <div className="flex items-center justify-between gap-8 lg:gap-12 xl:gap-16">
            {steps.map((step, index) => (
              <React.Fragment key={`${activeTab}-${step.number}`}>
                <article
                  className="flex flex-col items-center gap-8 transition-all duration-500 ease-in-out animate-fade-up flex-1 max-w-[320px]"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                  }}
                >
                  <div
                    className="relative w-full h-[170px] rounded-2xl shadow-[0px_4px_20px_#3a599c26] bg-white border border-gray-300 transition-transform duration-300 hover:scale-105 overflow-hidden"
                    role="img"
                    aria-label={`${step.title} illustration`}
                  >
                    <img
                      src={step.image}
                      alt={`${step.title} illustration`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col items-center relative">
                    <div
                      className="relative h-[72px] [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-200 text-[136.7px] text-left tracking-[0] leading-[136.7px] whitespace-nowrap transition-opacity duration-300"
                      style={{ left: "110px" }}
                      aria-hidden="true"
                    >
                      {step.number}
                    </div>

                    <div className="flex flex-col items-center gap-4 relative -mt-16">
                      <h2 className="relative font-body font-[number:var(--body-font-weight)] text-gray-800 text-[length:var(--body-font-size)] text-center tracking-[var(--body-letter-spacing)] leading-[var(--body-line-height)] [font-style:var(--body-font-style)]">
                        {step.title}
                      </h2>

                      <p className="relative font-body-regular font-[number:var(--body-regular-font-weight)] text-gray-800 text-[length:var(--body-regular-font-size)] text-center tracking-[var(--body-regular-letter-spacing)] leading-[var(--body-regular-line-height)] [font-style:var(--body-regular-font-style)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </article>

                {index < steps.length - 1 && (
                  <div
                    className="flex items-center justify-center h-[2px] flex-shrink-0 transition-opacity duration-500"
                    style={{ 
                      opacity: activeTab === "provider" ? 1 : 0.7,
                      width: 'clamp(60px, 8vw, 120px)'
                    }}
                    aria-hidden="true"
                  >
                    <div className="flex items-center h-full w-full relative">
                      {/* Left dot */}
                      <div className="w-2 h-2 bg-gray-400 rounded-full absolute left-0 top-1/2 -translate-y-1/2"></div>
                      {/* Line */}
                      <div className="flex-1 h-[2px] bg-gray-400 mx-2"></div>
                      {/* Right dot with custom position */}
                      <div className="w-2 h-2 bg-gray-400 rounded-full absolute right-0 top-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}