"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import banner from "../../../../public/images/banner1.webp";


const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(-1);
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const headerRef = useRef(null);
  const faqRefs = useRef([]);
  const bannerRef = useRef(null);
  const bannerTextRef = useRef(null);

  const faqs = [
    {
      question: "How Do I Post A Job Or Find A Freelancer?",
      answer:
        "To post a job or find a freelancer, go to our website's 'Post a Job' section. Provide job details and requirements, set your budget, and wait for qualified freelancers to submit their proposals. You can also browse our freelancer profiles and directly contact professionals that match your needs.",
    },
    {
      question: "Is There A Fee For Using Your Services?",
      answer:
        "Our platform offers various pricing models. Basic job posting and browsing are free for clients. We charge a small service fee only when you successfully hire a freelancer. Freelancers pay a percentage of their earnings to maintain their profiles and access premium features.",
    },
    {
      question: "Can I Request Advice Or Support From Your Team?",
      answer:
        "Absolutely! Our customer support team is available 24/7 to help you with any questions or issues. You can reach us through live chat, email, or phone. We also provide extensive documentation, tutorials, and best practices guides to help you succeed on our platform.",
    },
    {
      question: "How Do I Pay For The Freelancers Or Businesses I Hire?",
      answer:
        "We offer secure payment options including credit cards, PayPal, and bank transfers. All payments are processed through our secure escrow system, ensuring both parties are protected. Funds are released to freelancers only after you approve the completed work.",
    },
    {
      question: "How Can I Ensure That I Receive Quality Services?",
      answer:
        "We have a comprehensive rating and review system. All freelancers are verified through our screening process. You can view their portfolios, read client reviews, and check their completion rates. We also offer milestone-based payments and dispute resolution services to ensure quality outcomes.",
    },
    {
      question: "Do I Need To Log In To Access All The Features Of Your Website?",
      answer:
        "While you can browse freelancer profiles and services without logging in, you'll need to create an account to post jobs, communicate with freelancers, make payments, and access your project dashboard. Registration is free and takes just a few minutes.",
    },
  ];

  // Initialize after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (!isInitialized) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.dataset.animateId]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px',
      }
    );

    // Observe header
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    // Observe FAQ items
    faqRefs.current.forEach((faq) => {
      if (faq) {
        observer.observe(faq);
      }
    });

    // Observe banner
    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    // Observe banner text
    if (bannerTextRef.current) {
      observer.observe(bannerTextRef.current);
    }

    return () => observer.disconnect();
  }, [isInitialized]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-15">
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto py-5 sm:py-10">
        {/* Header */}
        <div 
          ref={headerRef}
          data-animate-id="header"
          className={`text-center mb-10 sm:mb-12 transition-all duration-700 ease-out ${
            visibleElements.has('header')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            We're Here to Provide Answers and Support Every Step of the Way
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              ref={(el) => (faqRefs.current[index] = el)}
              data-animate-id={`faq-${index}`}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-700 ease-out ${
                visibleElements.has(`faq-${index}`)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <button
                className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 sm:px-6 pb-5">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div
        ref={bannerRef}
        data-animate-id="banner"
        className={`relative bg-cover bg-center rounded-xl overflow-hidden mt-16 transition-all duration-700 ease-out ${
          visibleElements.has('banner')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
        style={{ 
          backgroundImage: `url(${banner.src})`,
          transitionDelay: '800ms'
        }}
      >
        <div className="bg-black/30 absolute inset-0 z-0" />

        <div className="relative z-10 w-full px-6 sm:px-10 md:px-16 py-14 sm:py-16 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10">
          {/* Text */}
          <div 
            ref={bannerTextRef}
            data-animate-id="banner-text"
            className={`text-white w-full lg:w-1/2 text-center md:text-left transition-all duration-700 ease-out ${
              visibleElements.has('banner-text')
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-8'
            }`}
            style={{ transitionDelay: '1200ms' }}
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3">
              Embrace Independence
            </h2>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">
              Start Your Freelance Journey Now
            </h3>
            <p className="text-sm sm:text-base text-blue-100 mb-6">
              Connect with your Designer in minutes
            </p>
            <button className="bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-100 transition-colors shadow-md cursor-pointer">
              Become A Freelancer
            </button>
          </div>

          {/* Spacer or image slot */}
          <div className="w-full lg:w-1/2 hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;