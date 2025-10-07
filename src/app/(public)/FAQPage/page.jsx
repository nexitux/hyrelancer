"use client";
import { FiArrowRight } from "react-icons/fi";

import { useState } from "react";
import Image from "next/image";

// Add CSS styles for rotating border animation
const styles = `
  @keyframes rotate {
    100% {
      transform: rotate(1turn);
    }
  }

  .faq-item {
    position: relative;
    border-radius: 16px;
    transition: all 0.5s ease;
  }

  .faq-item.open {
    position: relative;
    z-index: 0;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      z-index: -1;
      left: -50%;
      top: -50%;
      width: 200%;
      height: 200%;
      background-color: #3A599C;
      background-repeat: no-repeat;
      background-size: 50% 50%, 50% 50%;
      background-position: 0 0, 100% 0, 100% 100%, 0 100%;
      background-image: linear-gradient(#3A599C, #3A599C), linear-gradient(white, white), linear-gradient(#3A599C, #3A599C), linear-gradient(white, white);
      animation: rotate 4s linear infinite;
    }
    
    &::after {
      content: '';
      position: absolute;
      z-index: -1;
      left: 2px;
      top: 2px;
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      background: white;
      border-radius: 14px;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const faqData = [
  {
    question: "How Do I Post A Job Or Find A Freelancer?",
    answer:
      "To post a job or find a freelancer, go to our website's 'Post a Job' section. Provide job details and requirements, set your budget, and wait for qualified freelancers to submit their proposals. You can also browse our freelancer profiles and directly contact professionals that match your needs.",
  },
  {
    question: "Is There A Fee For Using Your Services?",
  },
  {
    question: "Can I Request Advice Or Support From Your Team?",
  },
  {
    question: "How Do I Pay For The Freelancers Or Businesses I Hire?",
  },
  {
    question: "How Can I Ensure That I Receive Quality Services?",
  },
  {
    question: "Do I Need To Log In To Access All The Features Of Your Website?",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-3 sm:px-12 lg:px-20 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-12">
          {/* FAQ Section */}
          <div className="flex flex-col gap-12 flex-1 w-full">
            {/* Header */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <p className="text-brand-primary font-bold text-[#3A599C] leading-6">
                  Boost Your Working Flow
                </p>
                <h1 className="text-brand-secondary font-bold text-4xl leading-9">
                  Frequently Asked Questions
                </h1>
              </div>
            </div>

            {/* FAQ List */}
            <div className="flex flex-col gap-6">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className={`faq-item ${
                    openIndex === index
                      ? "open p-4 sm:px-8 sm:py-4"
                      : "px-8 py-0"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex justify-between items-center w-full gap-4 py-4"
                  >
                    <span
                      className={`flex-1 text-left text-[#3A599C] text-base leading-6 ${openIndex === index
                        ? "font-urbanist font-bold"
                        : "font-bold"
                        }`}
                    >
                      {faq.question}
                    </span>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#F4F4F4] flex-shrink-0 transition-transform ${openIndex === index ? "" : "-rotate-40"
                        }`}
                    >
                      <FiArrowRight size={20} color="#3A599C" />
                    </div>
                  </button>
                  {openIndex === index && faq.answer && (
                    <div className="pb-4 pt-0">
                      <p className="text-brand-secondary font-bold text-base leading-6">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image Section */}
          <div className="relative flex-1 w-full h-[500px] lg:h-[696px] hidden lg:block">
            <Image
              src="https://api.builder.io/api/v1/image/assets/TEMP/0b234fbb397431465df98949968090a5d02c929d?width=668"
              alt="Happy customers working together"
              width={334}
              height={378}
              className="absolute w-[434px] h-[378px] rounded-[23px] object-cover left-[111px] top-[236px]"
            />

            {/* Top Right Badge */}
            <div className="absolute left-[407px] top-[202px] inline-flex px-6 py-6 justify-center items-center gap-1.5 rounded-[35px] border border-white/[0.01] bg-[#3A599C]/45 shadow-[0_2px_11.4px_0_rgba(58,89,156,0.20)] backdrop-blur-[5.8px]">
              <div className="text-white text-center font-normal text-[35px] leading-[35px]">
                400+
              </div>
              <div className="text-white font-bold text-[15px] leading-[22px]">
                Happy Customers
              </div>
            </div>

            {/* Bottom Left Badge */}
            <div className="absolute left-0 top-[512px] flex w-[196px] h-[163px] px-6 py-6 flex-col justify-center items-center gap-1.5 rounded-[35px] border border-white/[0.01] bg-[#3A599C]/45 /44 shadow-[0_2px_11.4px_0_rgba(58,89,156,0.20)] backdrop-blur-[5.8px]">
              <div className="text-white text-center font-normal text-[35px] leading-[35px]">
                400+
              </div>
              <div className="text-white font-bold text-[15px] leading-[22px]">
                Happy Customers
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
