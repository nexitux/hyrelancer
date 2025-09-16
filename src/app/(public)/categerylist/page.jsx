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
        {/* Back Button */}
        <div className="bg-gradient-to-r from-[#3a599c] to-[#2d4373] py-4 shadow-sm">
          <div className="max-w-7xl mx-10 ">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center text-[#ffffff] font-medium hover:text-[#2d4373] transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Categories
              </Link>
              <span className="text-white">/</span>
              <span className="text-white capitalize">{categoryName}</span>
            </div>
          </div>
        </div>

        {/* Category Hero Section */}
        <div className="relative h-80 overflow-hidden bg-gradient-to-r from-[#3a599c] to-[#2d4373]">
          <div className="absolute inset-0 flex items-center bg-red-20 justify-center">
            <div className="text-center text-white px-4">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold uppercase">{categoryName.charAt(0)}</span>
                </div>
              </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categorySubcategories.map((subcategory, index) => {
              return (
                <div key={subcategory.sc_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Subcategory Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={subcategory.sc_img ? `https://test.hyrelancer.in/${subcategory.sc_img}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'}
                      alt={subcategory.sc_name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(index)}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isWishlist[index] ? 'bg-white text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <FaHeart size={16} />
                    </button>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 text-gray-900 px-3 py-1.5 rounded-lg font-bold text-sm capitalize">
                      {categoryName}
                    </div>

                    {/* Subcategory Icon Overlay */}
                    {subcategory.sc_icon && (
                      <div className="absolute bottom-3 left-3 w-12 h-12 bg-white/90 rounded-lg p-2">
                        <img 
                          src={`https://test.hyrelancer.in/${subcategory.sc_icon}`}
                          alt={subcategory.sc_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Subcategory Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mr-2">
                        {subcategory.sc_name}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <FaStar size={12} className="text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">4.5</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {subcategory.sc_desc?.replace(/<[^>]*>/g, '') || `Discover amazing ${subcategory.sc_name} services and professionals.`}
                    </p>
                    
                    {/* Skills/Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="px-3 py-1 bg-[#f0f4ff] text-[#3a599c] text-xs rounded-full font-medium capitalize">
                        {categoryName}
                      </span>
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium">
                        {getServiceCount(subcategory.sc_id)} services
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/categerylist/${encodeURIComponent(subcategory.sc_name)}`}
                          className="px-4 py-2 bg-[#3a599c] hover:bg-[#2d4373] text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                        >
                          <FaEye size={14} />
                          View More
                          <FaChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        

          {/* Additional Information Section */}
          <div className="mt-16 bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
                Why Choose {categoryName} Services?
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
                    <FaEye className="text-[#3a599c]" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Wide Selection</h4>
                  <p className="text-gray-600 text-sm">Choose from {categorySubcategories.length} different subcategories to find exactly what you need.</p>
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
        </div>
      </div>
    );
  };

  export default CategoryDetailPage;