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
    <div className="min-h-screen bg-gray-50">
      {/* Back Button & Breadcrumb */}
      <div className="bg-gradient-to-r from-[#3a599c] to-[#2d4373] py-4 shadow-sm">
        <div className="max-w-7xl mx-10">
          <div className="flex items-center space-x-4">
            <Link
              href="/categories"
              className="flex items-center text-[#ffffff] font-medium hover:text-[#2d4373] transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Categories
            </Link>
            <span className="text-white">/</span>
            <Link
              href="/categerylist"
              className="text-[#ffffff] font-medium hover:text-[#2d4373] transition-colors capitalize"
            >
              {categoryName}
            </Link>
            <span className="text-white">/</span>
            <span className="text-white">{subcategoryDetail.sc_name}</span>
          </div>
        </div>
      </div>

      {/* Subcategory Hero Section */}
      <section className="relative min-h-[320px] md:min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-r from-[#3a599c] via-[#4b6cb7] to-[#2d4373] shadow-lg">
        {/* Background Image Overlay */}
        {subcategoryDetail.sc_img && (
          <div className="absolute inset-0">
            <img
              src={`https://backend.hyrelancer.in/${subcategoryDetail.sc_img}`}
              alt={subcategoryDetail.sc_name}
              className="w-full h-full object-cover object-center scale-105 blur-[2px] brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3a599c]/80 via-[#4b6cb7]/60 to-[#2d4373]/80" />
          </div>
        )}
        {/* Decorative Gradient Circles */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg px-4 py-8 md:px-8 md:py-12 w-full text-center border border-white/20">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg tracking-tight">
              {subcategoryDetail.sc_name}
            </h1>
            <p className="text-lg md:text-xl text-white/90 w-full mx-auto mb-2 font-medium drop-shadow-sm">
              {subcategoryDetail.sc_desc?.replace(/<[^>]*>/g, '') || `Explore our premium ${subcategoryDetail.sc_name} services.`}
            </p>
            <div className="mt-6 flex justify-center">
              <span className="inline-block bg-white/20 text-white/90 px-4 py-2 rounded-full text-sm font-semibold shadow-sm border border-white/30 backdrop-blur-sm">
                Discover top-rated services in <span className="font-bold">{subcategoryDetail.sc_name}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Services in {subcategoryDetail.sc_name}</h2>
          <div className="text-sm text-gray-500">
            Showing {subcategoryServices.length} service{subcategoryServices.length !== 1 ? 's' : ''}
          </div>
        </div>

        {subcategoryServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subcategoryServices.map((service, index) => (
              <div key={service.se_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.se_img ? `https://backend.hyrelancer.in/${service.se_img}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'}
                    alt={service.se_name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(index)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isWishlist[index] ? 'bg-white text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'
                      }`}
                  >
                    <FaHeart size={16} />
                  </button>

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 text-gray-900 px-3 py-1.5 rounded-lg font-bold text-sm capitalize">
                    {categoryName}
                  </div>

                  {/* Status Badge */}
                  {service.se_is_active && (
                    <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      Available
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mr-2">
                      {service.se_name}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg flex-shrink-0">
                      <FaStar size={12} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">4.5</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.se_desc?.replace(/<[^>]*>/g, '') || 'Professional service with experienced providers ready to help you.'}
                  </p>



                  {/* Skills/Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="px-3 py-1 bg-[#f0f4ff] text-[#3a599c] text-xs rounded-full font-medium capitalize">
                      {categoryName}
                    </span>
                    <span className="px-3 py-1 bg-[#f0f4ff] text-[#3a599c] text-xs rounded-full font-medium">
                      {subcategoryDetail.sc_name}
                    </span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                      <FaTag size={10} className="inline mr-1" />
                      Featured
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">

                    <div className="flex gap-2">

                      <Link
                        href={`/categerylist/${encodeURIComponent(subcategoryName)}/${service.se_id}`}
                        className="px-4 py-2 bg-[#3a599c] hover:bg-[#2d4373] text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        <FaEye size={14} />
                        View Providers
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

        {/* Additional Information Section */}
        {subcategoryServices.length > 0 && (
          <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose {subcategoryDetail.sc_name} Services?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#f0f4ff] rounded-full flex items-center justify-center">
                    <FaStar className="text-[#3a599c]" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quality Assured</h4>
                  <p className="text-gray-600 text-sm">All service providers are verified and highly rated by customers.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#f0f4ff] rounded-full flex items-center justify-center">
                    <FaClock className="text-[#3a599c]" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quick Response</h4>
                  <p className="text-gray-600 text-sm">Get connected with service providers within minutes of your request.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#f0f4ff] rounded-full flex items-center justify-center">
                    <FaHeart className="text-[#3a599c]" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Satisfaction</h4>
                  <p className="text-gray-600 text-sm">100% satisfaction guarantee with 24/7 customer support.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="mt-16 bg-gradient-to-r from-[#3a599c] to-[#2d4373] rounded-xl shadow-sm p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-6 opacity-90">
            Connect with professional {subcategoryDetail.sc_name.toLowerCase()} service providers in your area.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/post-requirement?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryDetail.sc_name)}`}
              className="px-6 py-3 bg-white text-[#3a599c] rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Post Your Requirement
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-colors font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryDetailPage;