"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  ArrowLeft,
  Calendar,
  Globe,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import adminApi from "@/config/adminApi";
import { useParams, useRouter } from "next/navigation";

const PortfolioDisplayPage = ({ isApprovalMode = false }) => {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id ? decodeURIComponent(params.id) : null;

  // State management
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch portfolio and skills data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get(`/getFeUPortfolio/${userId}`);

      // Normalize response data
      const { fe_skills, fe_porfolio, fe_po_img } = response.data;

      const formatImageUrl = (url) => {
        if (!url) return null;

        // Clean the URL first (remove -- suffix if present)
        const cleanUrl = url.split("--")[0];

        // Convert to absolute URL if it's a relative path
        if (!cleanUrl.startsWith('http')) {
          return `https://test.hyrelancer.in/${cleanUrl.replace(/^\/+/, "")}`;
        }

        return cleanUrl;
      };

      if (fe_porfolio?.length > 0 || fe_skills?.length > 0) {
        // Process portfolio data
        const processedPortfolio = fe_porfolio.map((portfolio) => {
          // Get images for this portfolio
          const portfolioImages = fe_po_img.filter(
            (img) =>
              img.fpoi_fpo_id === portfolio.fpo_id &&
              img.fpoi_type !== "Video" &&
              img.fpoi_is_active === "1"
          );

          // Get videos for this portfolio
          const portfolioVideos = fe_po_img.filter(
            (img) =>
              img.fpoi_fpo_id === portfolio.fpo_id &&
              img.fpoi_type === "Video" &&
              img.fpoi_is_active === "1"
          );

          return {
            id: portfolio.fpo_id,
            title: portfolio.fpo_title,
            description: portfolio.fpo_desc,
            mainImage: formatImageUrl(portfolio.fpo_img),
            images: portfolioImages.map((img) => ({
              id: img.fpoi_id,
              name: img.fpoi_path?.split("--")[1] || "image",
              url: formatImageUrl(img.fpoi_path),
            })),
            videos: portfolioVideos.map((vid) => ({
              id: vid.fpoi_id,
              url: vid.fpoi_path,
            })),
            createdAt: portfolio.created_at,
          };
        });

        const processedSkills = fe_skills.map((s) => s.fs_skill);

        setUserData({
          portfolio: processedPortfolio,
          skills: processedSkills,
        });
      } else {
        setUserData({
          portfolio: [],
          skills: [],
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load portfolio data. Please try again.";
      setError(errorMessage);
      setUserData({
        portfolio: [],
        skills: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize data fetch
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchUserData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isApprovalMode ? "Portfolio Review" : "Portfolio & Skills"}
                </h1>
                <p className="text-sm text-gray-500">
                  {isApprovalMode 
                    ? "Review freelancer's portfolio and skills" 
                    : "View portfolio items and skills"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Skills Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Skills & Expertise</h2>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {userData?.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No skills information available</p>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Portfolio Items</h2>
            </div>

            {userData?.portfolio?.length > 0 ? (
              <div className="space-y-6">
                {userData.portfolio.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Portfolio Item Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Image */}
                    {item.mainImage && (
                      <div className="p-4 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Main Image</span>
                        </div>
                        <div className="rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={item.mainImage}
                            alt={item.title}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <div className="p-4 bg-white border-b border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                        <div
                          className="prose prose-sm max-w-none text-gray-600"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>
                    )}

                    {/* Additional Images */}
                    {item.images?.length > 0 && (
                      <div className="p-4 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Additional Images ({item.images.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {item.images.map((img, imgIdx) => (
                            <div key={img.id || imgIdx} className="rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={img.url}
                                alt={img.name || `Image ${imgIdx + 1}`}
                                className="w-full h-24 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {item.videos?.length > 0 && (
                      <div className="p-4 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                          <Play className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Videos ({item.videos.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {item.videos.map((video, videoIdx) => (
                            <div key={video.id || videoIdx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <Play className="w-4 h-4 text-blue-600" />
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm truncate flex-1"
                              >
                                {video.url}
                              </a>
                              <Globe className="w-4 h-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8">
                <div className="text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Items</h3>
                  <p className="text-gray-500">
                    {isApprovalMode 
                      ? "This freelancer hasn't added any portfolio items yet." 
                      : "No portfolio items have been added yet."
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDisplayPage;