'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import banner from '../../../../../public/images/breadcrumb_service.webp';
import Image from 'next/image';

const cities = [
  'Las Vegas, USA',
  'Cape Town, South Africa',
  'Sydney, Australia',
  'Tokyo, Japan',
];

const categories = [
  'Graphic & Design',
  'Writing',
  'Videos',
  'Digital Marketing',
];

export default function Banner() {
  const [city, setCity] = useState('City, State or Zip');
  const [category, setCategory] = useState('All Categories');
  const [openDropdown, setOpenDropdown] = useState(null); // 'city' or 'category' or null

  const cityRef = useRef(null);
  const categoryRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityRef.current && !cityRef.current.contains(event.target) &&
        categoryRef.current && !categoryRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="breadcrumb relative">
      {/* Background Image */}
      <div className="breadcrumb_inner relative lg:py-20 py-14 overflow-visible">
        <div className="breadcrumb_bg absolute top-0 left-0 w-full h-full z-0">
          <div className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800"></div>
          {/* Replace this div with your Image component */}
          <div className="absolute inset-0 bg-blue-600 opacity-80"></div>

          <Image
            src={banner}
            alt="breadcrumb_service"
            fill
            className="w-full h-full object-cover"
            priority
          />

        </div>

        {/* Content */}
        <div className="container flex items-center justify-center relative h-full z-[2]">
          <div className="breadcrumb_content flex flex-col items-start justify-center xl:w-[1000px] lg:w-[848px] md:w-5/6 w-full h-full text-white">


            <h3 className="text-3xl font-semibold mt-2 animate animate_top" style={{ '--i': 2 }}>
              Services Default
            </h3>

            {/* Search Form */}

          </div>
        </div>
      </div>
    </div>
  );
}