"use client";

import { useState, useEffect } from "react";
import CommentForm from "../components/CommentForm";
import InfoOverview from "../components/InfoOverview";
import PortfolioSection from "../components/PortfolioSection";
import ProfileDetails from "../components/ProfileDetails";
import ProfileHeader from "../components/ProfileHeader";
import ReviewsSection from "../components/ReviewsSection";
import Loader from "../../../../components/Loader/page";

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
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile: {error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
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
              />
            </div>

            <div className="w-full">
              <PortfolioSection
                portfolio={profileData.u_portfolio}
                portfolioImages={profileData.portfolio_img}
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}