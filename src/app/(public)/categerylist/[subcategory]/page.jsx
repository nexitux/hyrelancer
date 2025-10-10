// src/app/categerylist/[subcategory]/page.js
"use client"
import { useState, useEffect } from 'react';
import {
  FaArrowLeft,
  FaHeart,
  FaStar,
  FaEye,
  FaMapMarkerAlt,
  FaClock,
  FaTag
} from 'react-icons/fa';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../../config/api';

const SubcategoryDetailPage = () => {
  const params = useParams();
  const subcategoryName = decodeURIComponent(params.subcategory);
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
        setSubCategories(response.data.sc_list);
        setServices(response.data.se_list);

        // Initialize wishlist state based on services length
        setIsWishlist(Array(response.data.se_list.length).fill(false));
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

  // Find the subcategory by name (case-insensitive)
  const subcategoryDetail = subCategories.find(sc =>
    sc.sc_name.toLowerCase() === subcategoryName.toLowerCase()
  );

  // Get category name from subcategory detail
  const categoryName = subcategoryDetail?.get_ca_data?.ca_name || 'freelancer';

  // Filter services by subcategory ID
  const subcategoryServices = subcategoryDetail
    ? services.filter(service => service.se_sc_id === subcategoryDetail.sc_id)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a599c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subcategory details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center  justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#3a599c] text-white rounded-lg hover:bg-[#2d4373] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If subcategory not found, show 404
  if (!subcategoryDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Not Found</h1>
          <p className="text-gray-600 mb-6">
            The subcategory "{subcategoryName}" does not exist.
          </p>
          <Link
            href="/categerylist"
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
      {/* Subcategory Hero Section (match category banner) */}
      <div className="relative h-60 md:h-[220px] overflow-hidden">
        {/* Background Banner Image */}
        <div className="absolute inset-0">
          <img
            src="/images/banner2.webp"
            alt="Subcategory banner"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay */}
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
              <Link
                href="/categerylist"
                className="text-white capitalize hover:text-[#FCD535] transition-colors"
              >
                {categoryName}
              </Link>
              <span className="text-white">/</span>
              <span className="text-white capitalize">{subcategoryDetail.sc_name}</span>
            </div>
          </div>
        </div>

        {/* Centered Title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold capitalize mb-4">{subcategoryDetail.sc_name}</h1>
            <p className="text-xl max-w-2xl mx-auto">
              {subcategoryDetail.sc_desc?.replace(/<[^>]*>/g, '') || `Explore our premium ${subcategoryDetail.sc_name} services.`}
            </p>
            <div className="mt-6">
              <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                {subcategoryServices.length} services Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Services in {subcategoryDetail.sc_name}</h2>
          <div className="text-sm text-gray-500">
            Showing {subcategoryServices.length} service{subcategoryServices.length !== 1 ? 's' : ''}
          </div>
        </div>

        {subcategoryServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-0">
            {subcategoryServices.map((service, index) => {
              const bgImage = service.se_img ? `https://hyre.hyrelancer.com/${service.se_img}` : '/images/USER1.png';
              return (
                <article
                  key={service.se_id}
                  className="group relative w-full h-[380px] rounded-[23.29px] border-b-[5px] border-solid border-[#3a599c] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(58,89,156,0)_59%,rgba(58,89,156,0.88)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(58,89,156,0.7)_0%,rgba(58,89,156,0.95)_100%)] transition-all duration-700"></div>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(index)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${isWishlist[index] ? 'bg-white text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
                    aria-label="Toggle wishlist"
                  >
                    <FaHeart size={16} />
                  </button>

                  {/* Content - Bottom Left */}
                  <div className="absolute bottom-0 left-0 p-6 z-10 transition-all duration-500 group-hover:bottom-[90px]">
                    <div className="flex flex-col items-start gap-1 relative">
                      <h3 className="font-sub-head font-semibold text-white text-2xl tracking-[0px] leading-7 transition-all duration-300 line-clamp-2">
                        {service.se_name}
                      </h3>
                      <p className="font-normal text-white/90 text-sm tracking-[0px] leading-6 mb-1 transition-all duration-300 line-clamp-2">
                        {service.se_desc?.replace(/<[^>]*>/g, '') || 'Professional service with experienced providers ready to help you.'}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100">
                        <span className="px-3 py-1 bg-transparent border border-white text-white text-xs rounded-full font-normal capitalize">
                          {categoryName}
                        </span>
                        <span className="px-3 py-1 bg-transparent border border-white text-white text-xs rounded-full font-normal">
                          {subcategoryDetail.sc_name}
                        </span>
                        {service.se_is_active && (
                          <span className="px-3 py-1 bg-green-500/20 border border-green-400 text-white text-xs rounded-full font-normal">
                            Available
                          </span>
                        )}
                      </div>

                      {/* View Providers CTA */}
                      <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-3 transition-all duration-500">
                        <Link
                          href={`/categerylist/${encodeURIComponent(subcategoryName)}/${service.se_id}`}
                          className="inline-flex h-[38px] items-center justify-center gap-2.5 px-5 py-2 bg-white rounded-3xl border border-solid text-[#3a599c] font-medium text-sm transition-all duration-300 hover:scale-105 hover:bg-[#f8f9fa] hover:shadow-lg"
                        >
                          <FaEye size={14} />
                          View Providers
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FaEye size={24} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No services available</h3>
            <p className="text-gray-600 mb-6">There are currently no services in this subcategory. Check back later!</p>
            <Link
              href="/categerylist"
              className="px-6 py-2 bg-[#3a599c] text-white rounded-lg hover:bg-[#2d4373] transition-colors font-medium"
            >
              Explore Other Categories
            </Link>
          </div>
        )}

        {/* Removed Additional Information and CTA sections to match category list */}
      </div>
    </div>
  );
};

export default SubcategoryDetailPage;