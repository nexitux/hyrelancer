"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQPage = () => {
  const [expandedItems, setExpandedItems] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const headerRef = useRef(null);
  const faqRefs = useRef([]);
  const bannerRef = useRef(null);
  const bannerTextRef = useRef(null);
  const bannerVideoRef = useRef(null);

  const faqs = [
    {
      id: 1,
      question: "How Do I Post A Job Or Find A Freelancer?",
      answer:
        "To post a job or find a freelancer, go to our website's 'Post a Job' section. Provide job details and requirements, set your budget, and wait for qualified freelancers to submit their proposals. You can also browse our freelancer profiles and directly contact professionals that match your needs.",
    },
    {
      id: 2,
      question: "Is There A Fee For Using Your Services?",
      answer:
        "Our platform offers various pricing models. Basic job posting and browsing are free for clients. We charge a small service fee only when you successfully hire a freelancer. Freelancers pay a percentage of their earnings to maintain their profiles and access premium features.",
    },
    {
      id: 3,
      question: "Can I Request Advice Or Support From Your Team?",
      answer:
        "Absolutely! Our customer support team is available 24/7 to help you with any questions or issues. You can reach us through live chat, email, or phone. We also provide extensive documentation, tutorials, and best practices guides to help you succeed on our platform.",
    },
    {
      id: 4,
      question: "How Do I Pay For The Freelancers Or Businesses I Hire?",
      answer:
        "We offer secure payment options including credit cards, PayPal, and bank transfers. All payments are processed through our secure escrow system, ensuring both parties are protected. Funds are released to freelancers only after you approve the completed work.",
    },
    {
      id: 5,
      question: "How Can I Ensure That I Receive Quality Services?",
      answer:
        "We have a comprehensive rating and review system. All freelancers are verified through our screening process. You can view their portfolios, read client reviews, and check their completion rates. We also offer milestone-based payments and dispute resolution services to ensure quality outcomes.",
    },
    {
      id: 6,
      question: "Do I Need To Log In To Access All The Features Of Your Website?",
      answer:
        "While you can browse freelancer profiles and services without logging in, you'll need to create an account to post jobs, communicate with freelancers, make payments, and access your project dashboard. Registration is free and takes just a few minutes.",
    },
  ];

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleKeyDown = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleItem(id);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    faqRefs.current.forEach((faq) => {
      if (faq) {
        observer.observe(faq);
      }
    });

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    if (bannerTextRef.current) {
      observer.observe(bannerTextRef.current);
    }

    if (bannerVideoRef.current) {
      observer.observe(bannerVideoRef.current);
    }

    return () => observer.disconnect();
  }, [isInitialized]);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8  bg-white"style={{ maxWidth: "1850px" }}>
      {/* Main FAQ Section */}
      <section className="flex flex-wrap items-start justify-center gap-16 px-4 sm:px-8 lg:px-20 py-12">
        {/* Left Column - FAQ */}
        <div className="flex flex-col items-start gap-10 flex-1 max-w-2xl">
          {/* Header */}
          <header 
            ref={headerRef}
            data-animate-id="header"
            className={`flex flex-col items-start gap-3 w-full transition-all duration-700 ease-out ${
              visibleElements.has('header')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-blue-500 text-sm font-medium tracking-wide">
              Boost Your Working Flow
            </p>
            <h1 className="text-4xl font-bold text-black leading-tight">
              Frequently Asked Questions
            </h1>
          </header>

          {/* FAQ Items */}
          <div className="flex flex-col items-start gap-0 w-full">
            {faqs.map((faq, index) => {
              const isExpanded = expandedItems[faq.id];

              return (
                <article
                  key={faq.id}
                  ref={(el) => (faqRefs.current[index] = el)}
                  data-animate-id={`faq-${index}`}
                  className={`w-full transition-all duration-700 ease-out ${
                    visibleElements.has(`faq-${index}`)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {isExpanded ? (
                    // Expanded FAQ Item with container
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-4">
                      <button
                        className="flex items-center justify-between w-full cursor-pointer border-none bg-transparent text-left"
                        onClick={() => toggleItem(faq.id)}
                        onKeyDown={(e) => handleKeyDown(e, faq.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`faq-answer-${faq.id}`}
                        type="button"
                      >
                        <h2 className="text-blue-600 font-semibold text-lg leading-relaxed flex-1 pr-4">
                          {faq.question}
                        </h2>

                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      </button>

                      {faq.answer && (
                        <div
                          id={`faq-answer-${faq.id}`}
                          className="transition-all duration-300 ease-in-out pt-4"
                        >
                          <p className="text-black text-base leading-relaxed font-normal pl-0">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Collapsed FAQ Item without container
                    <button
                      className="flex items-center justify-between w-full py-4 cursor-pointer border-none bg-transparent text-left"
                      onClick={() => toggleItem(faq.id)}
                      onKeyDown={(e) => handleKeyDown(e, faq.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`faq-answer-${faq.id}`}
                      type="button"
                    >
                      <h2 className="text-blue-600 font-normal text-lg leading-relaxed flex-1 pr-4">
                        {faq.question}
                      </h2>

                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <ChevronUp className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Right Column - Customer Statistics */}
        <aside className="relative flex-1 h-[550px] max-w-md min-w-[400px]">
          <div className="relative w-full h-full">
            {/* Main Image */}
            <div className="absolute top-16 left-8 w-[320px] h-[350px] bg-gradient-to-br from-orange-100 to-amber-50 rounded-3xl overflow-hidden shadow-xl">
              <img
                className="w-full h-full object-cover"
                alt="Happy customers working together"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop"
              />
            </div>

            {/* Top Right Badge */}
            <div className="absolute top-8 right-0 bg-blue-400/90 backdrop-blur-sm rounded-3xl px-8 py-5 shadow-xl">
              <div className="text-white text-center">
                <div className="text-3xl font-bold">400+</div>
                <div className="text-sm font-medium mt-1">Happy Customers</div>
              </div>
            </div>

            {/* Bottom Left Badge */}
            <div className="absolute bottom-8 left-0 bg-blue-400/90 backdrop-blur-sm rounded-3xl px-8 py-5 shadow-xl">
              <div className="text-white text-center">
                <div className="text-3xl font-bold">400+</div>
                <div className="text-sm font-medium mt-1">Happy Customers</div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default FAQPage;