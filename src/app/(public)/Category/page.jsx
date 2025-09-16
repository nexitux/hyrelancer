"use client"
import { useState, useEffect } from 'react';
import { ChevronRight } from "lucide-react";
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
              image: item.sc_img ? `https://test.hyrelancer.in/${item.sc_img}` : '/images/placeholder.jpg',
              category: item.get_ca_data?.ca_name || 'freelancer'
            }));
          
          // Get only the first 4 categories
          setCategories(filteredCategories.slice(0, 4));
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              Discover Our Services
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              Premium services curated for your needs
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full max-w-[180px] sm:max-w-[200px]">
                <div className="aspect-[4/3] w-full bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mt-2 animate-pulse"></div>
              </div>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Discover Our Services
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Premium services curated for your needs
          </p>
        </div>

        {/* Cards - Only showing 4 categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
          {categories.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 w-full max-w-[180px] sm:max-w-[200px] lg:max-w-none"
            >
              <div className="aspect-[4/3] w-full relative">
                <Image 
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5">
                <h3 className="text-sm sm:text-base font-semibold text-white">{item.title}</h3>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs text-blue-100 font-medium">Explore services</span>
                  <ChevronRight className="w-3 h-3 text-blue-100 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Button - Keep the "View All Categories" link */}
        <div className="mt-8 sm:mt-12 text-center">
          <a
            href="/categerylist"
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2.5 bg-[#3a599c] text-white rounded-full text-xs sm:text-sm font-medium hover:bg-[#344e86] transition-colors shadow-sm"
          >
            View All Categories
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
}