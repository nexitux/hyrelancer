"use client"
import { useState, useEffect } from 'react';
import { ChevronRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import api from '../../../config/api';

export default function BrowseCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/getSiteData');
        
        if (response.data && response.data.sc_list) {
          // Filter out categories with null images and transform the data
          const filteredCategories = response.data.sc_list
            .filter(item => item.sc_img !== null)
            .map(item => ({
              id: item.sc_id,
              title: item.sc_name,
              image: item.sc_img ? `https://hyre.hyrelancer.com/${item.sc_img}` : '/images/placeholder.jpg',
              category: item.get_ca_data?.ca_name || 'freelancer'
            }));
          
          // Get only the first 8 categories for 2x4 grid
          setCategories(filteredCategories.slice(0, 8));
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch categories');
        setLoading(false);
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-12">
            <div className="text-center lg:text-left mb-4 lg:mb-0">
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto lg:mx-0 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto lg:mx-0 animate-pulse"></div>
            </div>
            <div className="text-center lg:text-right">
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto lg:mx-0 animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/3] w-full bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-8 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#3a599c] text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-8 sm:py-16">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8"style={{ maxWidth: "1550px" }}>
        {/* Heading */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 sm:mb-12">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h4 className="text-sm text-[#3A599C] mb-2 text-bold">Boost Your Working Flow</h4>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Discover Our <br /> Services
            </h2>
          </div>
          <div className="text-center lg:text-right">
            <p className="text-sm sm:text-base text-[#000] max-w-md lg:max-w-none">
              Premium services <br/>curated for your needs
            </p>
          </div>
        </div>

        {/* Cards - 2x4 Grid Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-12">
          {categories.map((item, index) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl "
            >
              <div className="aspect-[3/2] w-full relative p-6">
                <Image 
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Arrow Icon - appears on hover */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-[#3A599C]" />
                  </div>
                </div>
              </div>
              
              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm sm:text-base leading-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Button - View All Categories */}
        <div className="mt-8 sm:mt-12 text-center">
          <a
            href="/categerylist"
            className="inline-flex items-center px-6 py-3 bg-[#3A599C] text-white rounded-full text-sm font-medium hover:bg-[#3A599C] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            View All Categories
            <ChevronRight className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}