import React, { useState } from "react";
import Image from "next/image";

const FreelancerListing = () => {
  const categories = [
    { id: 1, label: "Developers", active: true },
    { id: 2, label: "Designers", active: false },
    { id: 3, label: "Physcolagist & Phsychaiartists", active: false },
    { id: 4, label: "Makeup Artists", active: false },
    { id: 5, label: "Phtographers & Videographers", active: false },

  ];

  const freelancers = [
    {
      id: 1,
      name: "John Doe",
      role: "Javascript Developer",
      verified: true,
      image: "/images/USER1.png",
      skills: ["Devops", "Javascript", "jit"]
    },
    {
      id: 2,
      name: "Jakob George",
      role: "Java Developer",
      verified: true,
      image: "/images/USER2.png",
      skills: ["Devops", "Javascript", "jit"]
    },
    {
      id: 3,
      name: "Arya Subramanyan",
      role: "Python",
      verified: true,
      image: "/images/USER3.png",
      skills: ["Devops", "Javascript", "jit"]
    },
  ];

  const [activeCategory, setActiveCategory] = useState(1);

  return (
    <div className="flex flex-col w-full max-w-[1440px] mx-auto items-center gap-12 px-4 py-12 relative">
      {/* Header Section */}
      <header className="flex flex-col w-full items-center gap-2 relative">
        <p className="font-body font-semibold text-variable-collection-PRIMARY-COLOR text-base text-center tracking-[0px] leading-6">
          Boost Your Working Flow
        </p>
        <h1 className="font-head-2 font-medium text-variable-collection-secondary-color-duplicate text-4xl text-center tracking-[0px] leading-9">
          Explore Freelancers
        </h1>
      </header>

      {/* Main Content Section */}
      <section className="flex flex-col items-start gap-6 relative w-full">
        {/* Category Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-4 px-4 py-0 relative w-full" role="navigation" aria-label="Freelancer categories">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`category-button-hover inline-flex items-center justify-center gap-2.5 px-4 py-3 relative rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                activeCategory === category.id
                  ? "bg-[#3a599c] text-white shadow-md"
                  : "bg-[#3a599c1f] text-[#3a599c] hover:bg-[#3a599c2f]"
              }`}
              aria-pressed={activeCategory === category.id}
            >
              <span className="font-top font-normal text-sm relative w-fit tracking-[0px] leading-6 whitespace-nowrap">
                {category.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Freelancer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4">
          {/* Freelancer Cards */}
          {freelancers.map((freelancer, index) => (
            <article
              key={freelancer.id}
              className="freelancer-card-hover group relative w-full h-[380px] rounded-[23.29px] border-b-[5px] border-solid border-[#3a599c] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              style={{
                backgroundImage: `url(${freelancer.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Gradient Overlay - Transitions from light to dark covering full card */}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(58,89,156,0)_59%,rgba(58,89,156,0.88)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(58,89,156,0.7)_0%,rgba(58,89,156,0.95)_100%)] transition-all duration-700"></div>
              
              {/* Content - Bottom Left Positioning */}
              <div className="absolute bottom-0 left-0 p-6 z-10 transition-all duration-500 group-hover:bottom-[90px]">
                <div className="flex flex-col items-start gap-1 relative">
                  {/* Name - Always visible */}
                  <h2 className="font-sub-head font-semibold text-white text-2xl tracking-[0px] leading-7 transition-all duration-300">
                    {freelancer.name}
                  </h2>
                  
                  {/* Role - Always visible */}
                  <p className="font-normal text-white text-sm tracking-[0px] leading-6 mb-1 transition-all duration-300">
                    {freelancer.role}
                  </p>
                  
                  {/* Verified Badge - Only visible on hover */}
                  {freelancer.verified && (
                    <div className="flex items-center gap-2 max-h-0 opacity-0 overflow-hidden group-hover:max-h-10 group-hover:opacity-100 group-hover:mt-2 group-hover:mb-2 transition-all duration-500">
                      <div className="relative w-4 h-4 bg-[#34c759] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-normal text-[#34c759] text-xs tracking-[0px] leading-6 whitespace-nowrap">
                        Verified Expert In Engineering
                      </span>
                    </div>
                  )}
                  
                  {/* Expertise Label - Only visible on hover */}
                  <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-10 group-hover:opacity-100 group-hover:mt-1 group-hover:mb-1 transition-all duration-500 delay-75">
                    <p className="font-normal text-white text-sm tracking-[0px] leading-6">
                      Expertise
                    </p>
                  </div>
                  
                  {/* Skills Tags - Only visible on hover */}
                  {freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100  ">
                      {freelancer.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-transparent border border-white text-white text-xs rounded-full font-normal transition-all duration-300 hover:bg-white hover:text-black"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}

          {/* Call-to-Action Card */}
          <aside className="cta-card-hover group relative w-full h-[380px] rounded-[23.29px] border-b-[7px] border-solid border-[#3a599c] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-[#3a599c] group-hover:bg-[#2c4a7a] transition-colors duration-300"></div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-100 pointer-events-none overflow-hidden flex items-center justify-center">
              <img
                src="/images/pattern.png"
                alt="Background pattern"
                className="w-full h-full object-cover"
                draggable="false"
                style={{
                  objectFit: "fill",
                  objectPosition: "center",
                  opacity: 0.18,
                  // The following ensures the pattern is centered and scaled like the image
                  width: "100%",
                  height: "100%",
                  minWidth: "100%",
                  minHeight: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-start justify-center gap-6 p-6">
              <div className="flex flex-col items-start gap-4 relative w-full">
                <p className="font-body font-semibold text-white text-base tracking-[0px] leading-6 group-hover:text-[#f0f0f0] transition-colors duration-300">
                  Discover top-rated professionals ready to bring your ideas to life!
                </p>
                
                <div className="flex flex-col items-start gap-2 relative w-full">
                  <p className="font-normal text-[#f4f4f4] text-xs tracking-[0px] leading-4 opacity-94 group-hover:text-white group-hover:opacity-100 transition-all duration-all duration-300">
                    With thousands of verified freelancers, the right talent for your project is just a click away.
                  </p>
                </div>
              </div>
              
              <button className="inline-flex h-[38px] items-center justify-center gap-2.5 px-7 py-3 relative bg-white rounded-3xl border border-solid transition-all duration-300 hover:scale-105 hover:bg-[#f8f9fa] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#3a599c] group-hover:shadow-xl">
                <span className="font-body font-semibold text-[#3a599c] text-base relative w-fit tracking-[0px] leading-6 whitespace-nowrap group-hover:text-[#2c4a7a] transition-colors duration-300">
                  Explore Freelancers
                </span>
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default FreelancerListing;