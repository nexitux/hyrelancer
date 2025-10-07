"use client";

import { useState, useEffect } from 'react';
import CommentForm from './components/CommentForm';
import InfoOverview from './components/InfoOverview';
import PortfolioSection from './components/PortfolioSection';
import ProfileDetails from './components/ProfileDetails';
import ProfileHeader from './components/ProfileHeader';
import ReviewsSection from './components/ReviewsSection';

export default function Page({ params }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = params;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://hyre.hyrelancer.com/api/freelancerProfile/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfileData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
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
            
            {/* Profile Header */}
            <div className="w-full">
              <ProfileHeader 
                profileData={profileData.u_profile}
                userData={profileData.us_data}
                skills={profileData.u_skills}
                languages={profileData.la_list}
              />
            </div>
            
            {/* Profile Details */}
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
            
            {/* Portfolio Section */}
            <div className="w-full">
              <PortfolioSection 
                portfolio={profileData.u_portfolio}
                portfolioImages={profileData.portfolio_img}
                portfolioEx={profileData.portfolio_ex}
              />
            </div>
            
            {/* Reviews Section */}
            <div className="w-full">
              <ReviewsSection profileData={profileData.u_profile} />
            </div>
            
            {/* Comment Form */}
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