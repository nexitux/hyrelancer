// src/app/categerylist/page.jsx
"use client"
import { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaHeart,
  FaStar,
  FaEye,
  FaChevronRight
} from 'react-icons/fa';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../config/api';

const CategoryDetailPage = () => {
  const params = useParams();
  const categoryName = decodeURIComponent(params.category || 'freelancer');
  const [isWishlist, setIsWishlist] = useState([]);
  const [services, setServices] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/getSiteData');

        // Handle potential API response structure variations
        const scList = response.data?.sc_list || [];
        const seList = response.data?.se_list || [];

        setSubCategories(scList);
        setServices(seList);

        // Initialize wishlist state
        setIsWishlist(Array(scList.length).fill(false));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const toggleWishlist = (index) => {
    const newWishlist = [...isWishlist];
    newWishlist[index] = !newWishlist[index];
    setIsWishlist(newWishlist);
  };

  // Find the subcategories that belong to this category
  const categorySubcategories = subCategories.filter(subcat =>
    subcat.get_ca_data?.ca_name?.toLowerCase() === categoryName.toLowerCase()
  );

  // Get services count for each subcategory
  const getServiceCount = (sc_id) => {
    return services.filter(service => service.se_sc_id === sc_id).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a599c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#3a599c] text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If category not found, show 404
  if (categorySubcategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Not Found</h1>
          <p className="text-gray-600 mb-6">
            The category "{categoryName}" does not exist or has no subcategories.
          </p>
          <Link
            href="/categories"
            className="px-4 py-2 bg-[#3a599c] text-white rounded-lg hover:bg-[#2d4373] transition-colors"
          >
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category Hero Section (with banner background to match home) */}
      <div className="relative h-60 md:h-[220px] overflow-hidden">
        {/* Background Banner Image with graceful fallback choices */}
        <div className="absolute inset-0">
          <img
            src="/images/banner2.webp"
            alt="Category banner"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay to ensure text readability similar to home style */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(58,89,156,0.35)_0%,rgba(0,0,0,0.55)_100%)]"></div>

        {/* Breadcrumbs and Back Button inside banner */}
        <div className="absolute top-0 left-0 w-full px-4 md:px-0 z-10">
          <div className="max-w-7xl mx-auto pt-5">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-white font-medium hover:text-[#FCD535] transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Categories
              </Link>
              <span className="text-white">/</span>
              <span className="text-white capitalize">{categoryName}</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold capitalize mb-4">{categoryName}</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Explore our premium {categoryName} services and subcategories.
            </p>
            <div className="mt-6">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                {categorySubcategories.length} categories Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 capitalize">
          Subcategories in {categoryName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-0">
          {categorySubcategories.map((subcategory, index) => {
            const bgImage = subcategory.sc_img ? `https://hyre.hyrelancer.com/${subcategory.sc_img}` : '/images/USER1.png';
            return (
              <article
                key={subcategory.sc_id}
                className="group relative w-full h-[380px] rounded-[23.29px] border-b-[5px] border-solid border-[#3a599c] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Gradient Overlay to match home card */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(58,89,156,0)_59%,rgba(58,89,156,0.88)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(58,89,156,0.7)_0%,rgba(58,89,156,0.95)_100%)] transition-all duration-700"></div>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(index)}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${isWishlist[index] ? 'bg-white text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'
                    }`}
                  aria-label="Toggle wishlist"
                >
                  <FaHeart size={16} />
                </button>

                {/* Content - Bottom Left like home */}
                <div className="absolute bottom-0 left-0 p-6 z-10 transition-all duration-500 group-hover:bottom-[90px]">
                  <div className="flex flex-col items-start gap-1 relative">
                    <h3 className="font-sub-head font-semibold text-white text-2xl tracking-[0px] leading-7 transition-all duration-300 line-clamp-2">
                      {subcategory.sc_name}
                    </h3>
                    <p className="font-normal text-white/90 text-sm tracking-[0px] leading-6 mb-1 transition-all duration-300 line-clamp-2">
                      {subcategory.sc_desc?.replace(/<[^>]*>/g, '') || `Discover amazing ${subcategory.sc_name} services and professionals.`}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100">
                      <span className="px-3 py-1 bg-transparent border border-white text-white text-xs rounded-full font-normal">
                        {categoryName}
                      </span>
                      <span className="px-3 py-1 bg-transparent border border-white text-white text-xs rounded-full font-normal">
                        {getServiceCount(subcategory.sc_id)} services
                      </span>
                    </div>

                    {/* View More CTA */}
                    <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-3 transition-all duration-500">
                      <Link
                        href={`/categerylist/${encodeURIComponent(subcategory.sc_name)}`}
                        className="inline-flex h-[38px] items-center justify-center gap-2.5 px-5 py-2 bg-white rounded-3xl border border-solid text-[#3a599c] font-medium text-sm transition-all duration-300 hover:scale-105 hover:bg-[#f8f9fa] hover:shadow-lg"
                      >
                        <FaEye size={14} />
                        View More
                        <FaChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Category badge and optional icon */}
                

              </article>
            );
          })}
        </div>



        {/* Removed Additional Information Section as requested */}
      </div>
    </div>
  );
};

export default CategoryDetailPage;