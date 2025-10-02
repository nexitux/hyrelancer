"use client";

import { useState, useEffect } from "react";
import CommentForm from "../components/CommentForm";
import InfoOverview from "../components/InfoOverview";
import PortfolioSection from "../components/PortfolioSection";
import ProfileDetails from "../components/ProfileDetails";
import ProfileHeader from "../components/ProfileHeader";
import ReviewsSection from "../components/ReviewsSection";
import Loader from "../../../../components/Loader/page";
import { capitalizeFirst, capitalizeWords } from "@/lib/utils";

export default function Page({ params }) {
  const slug = params?.slug; // <-- correct place to read dynamic param
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(Boolean(slug)); // show loading only when slug exists
  const [error, setError] = useState(null);

  useEffect(() => {
    // debug: confirm slug presence
    console.log("Profile page slug:", slug);

    if (!slug) {
      setProfileData(null);
      setLoading(false);
      setError("No slug provided");
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://test.hyrelancer.in/api/freelancerProfile/${encodeURIComponent(slug)}`;
        console.log("Fetching profile URL:", url);
        const response = await fetch(url);

        if (!response.ok) {
          const text = await response.text().catch(() => null);
          const msg = `Failed to fetch profile (status ${response.status}) ${text ? "- " + text : ""}`;
          throw new Error(msg);
        }

        const data = await response.json();
        console.log("Profile API response:", data);
        
        // Check if profile is not active (customer profile pending approval)
        if (data.message && data.message === "Please wait for approval.") {
          setError("Please wait for approval.");
          setProfileData(null);
          return;
        }
        
        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile");
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [slug]);

  if (loading) {
    return (
     <Loader/>
    );
  }

  if (error) {
    // Special handling for approval pending message
    if (error === "Please wait for approval.") {
      return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{capitalizeWords("Profile Under Review")}</h2>
              <p className="text-gray-600 mb-6">{capitalizeFirst("This profile is currently under review and will be available once approved by our team.")}</p>
              <p className="text-sm text-gray-500">{capitalizeFirst("Please check back later or contact support if you have any questions.")}</p>
            </div>
          </div>
        </div>
      );
    }

    // Regular error handling
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{capitalizeFirst("Error loading profile:")} {error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {capitalizeFirst("Retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <p className="text-gray-600">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full">
              <ProfileHeader
                profileData={profileData.u_profile}
                userData={profileData.us_data}
                skills={profileData.u_skills}
                languages={profileData.la_list}
              />
            </div>

            <div className="w-full">
              <ProfileDetails
                profileData={profileData.u_profile}
                experience={profileData.u_experi}
                certificates={profileData.u_certi}
                services={profileData.fe_service_list}
                cities={profileData.fe_city_list}
                states={profileData.fe_state_list}
                skills={profileData.u_skills}
              />
            </div>

            <div className="w-full">
              <PortfolioSection
                u_profile={profileData.u_profile}
                u_portfolio={profileData.u_portfolio}
                portfolio_img={profileData.portfolio_img}
                portfolio_vd={profileData.portfolio_vd}
                portfolioEx={profileData.portfolio_ex}
              />
            </div>

            <div className="w-full">
              <ReviewsSection profileData={profileData.u_profile} />
            </div>

            <div className="w-full">
              <CommentForm profileData={profileData.u_profile} />
            </div>
          </div>

          {/* Right Column - Fixed Info Overview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <InfoOverview
                profileData={profileData.u_profile}
                userData={profileData.us_data}
                services={profileData.fe_service_list}
                subCategories={profileData.fe_sub_cate_list}
                cities={profileData.fe_city_list}
                states={profileData.fe_state_list}
                idProof={profileData.u_idproof}
                languages={profileData.la_list}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}