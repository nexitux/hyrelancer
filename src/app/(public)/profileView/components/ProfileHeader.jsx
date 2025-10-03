import React, { useState } from "react";
import { MapPin, Star, MessageCircle, User, CheckCircle, Phone } from "lucide-react";
import api from "@/config/api";
import { showSuccessNotification, showErrorNotification } from "@/utils/notificationService";

const ProfileHeader = ({ profileData, userData, skills, languages }) => {
  // State for loading and button states
  const [isRequestingContact, setIsRequestingContact] = useState(false);

  // Helper functions
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "0") return null;
    return `https://backend.hyrelancer.in/${imagePath.split("--")[0]}`;
  };

  const parseLanguages = (langString, langList) => {
    if (!langString || !langList) return [];
    const langArray = langString.split(",").filter((lang) => lang.trim());
    return langArray
      .map((lang) => {
        const foundLang = langList.find(
          (l) => l.la_language.toLowerCase() === lang.toLowerCase()
        );
        return foundLang ? foundLang.la_language : lang;
      })
      .filter(Boolean);
  };

  const getLocationDisplay = () => {
    // You can enhance this with actual city/state data if available
    return profileData?.fp_working_location || "Location not specified";
  };

  const getRating = () => {
    // TODO: This should come from reviews data when available
    return null; // No rating available
  };

  const getReviewCount = () => {
    // TODO: This should come from reviews data when available
    return 0; // No reviews available
  };

  // API call to request contact details
  const handleRequestContactDetails = async () => {
    // Get freelancer ID from profile data
    const freelancerId = profileData?.fp_u_id;
    
    if (!freelancerId) {
      showErrorNotification("Unable to identify the freelancer. Please try again.");
      return;
    }

    setIsRequestingContact(true);
    
    try {
      const requestData = {
        sc_message_id: 1, // Default message ID as per API spec
        sc_request_receive_id: freelancerId, // Freelancer's user ID
        sc_request_send_message: "Hi, Please share your contact details."
      };

      const response = await api.post('/share-contact/send', requestData);
      
      if (response.data.status === 'success') {
        showSuccessNotification(response.data.message || "Contact request sent successfully!");
      } else {
        showErrorNotification(response.data.message || "Failed to send contact request.");
      }
    } catch (error) {
      console.error('Error requesting contact details:', error);
      if (error.response?.data?.message) {
        showErrorNotification(error.response.data.message);
      } else {
        showErrorNotification("Failed to send contact request. Please try again.");
      }
    } finally {
      setIsRequestingContact(false);
    }
  };

  const profileImage = getProfileImageUrl(profileData?.fp_img);
  const userLanguages = parseLanguages(profileData?.fp_lang, languages);
  const displayName =
    profileData?.fp_display_name || userData?.name || "Freelancer";
  const isVerified = profileData?.fp_is_verify === "1";
  const isAvailable = profileData?.fp_available === "Available now";

  return (
    <div className="mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-[#3e5a9a]/5 via-white to-[#3e5a9a]/5 px-8 py-8">
        <div className="flex items-start space-x-6">
          {/* Profile Image */}
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            {/* Fallback avatar */}
            <div
              className={`w-24 h-24 rounded-2xl bg-gray-200 flex items-center justify-center shadow-md border-2 border-white ${
                profileImage ? "hidden" : "flex"
              }`}
            >
              <User className="w-8 h-8 text-gray-400" />
            </div>

            {/* Verification Badge */}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1">
                <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {displayName}
              </h1>
              {isVerified && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Verified
                </span>
              )}
              {/* Online Status */}
              {isAvailable && (
                <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{profileData.fp_available}</span>
                </div>
              )}
            </div>

            {/* Headline */}
            {profileData?.fp_headline && (
              <p className="text-gray-600 font-medium mb-3">
                {profileData.fp_headline}
              </p>
            )}

            {/* Location & Rating */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                <span className="text-sm font-medium">
                  {getLocationDisplay()}
                </span>
              </div>
              {getRating() && getReviewCount() > 0 ? (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-semibold text-gray-900">
                    {getRating()}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({getReviewCount()} reviews)
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Star className="w-4 h-4 text-gray-300 mr-1" />
                  <span className="text-sm">
                    No reviews yet
                  </span>
                </div>
              )}
            </div>

            {/* Skills Preview */}
            {skills && skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={skill.fs_id || index}
                    className="px-3 py-1 bg-[#3e5a9a]/10 text-[#3e5a9a] text-xs font-medium rounded-full"
                  >
                    {skill.fs_skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    +{skills.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Languages */}
            {/* {userLanguages.length > 0 && (
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-600 mr-2">Languages:</span>
                <span className="text-sm font-medium text-gray-900">
                  {userLanguages.slice(0, 3).join(", ")}
                  {userLanguages.length > 3
                    ? `... +${userLanguages.length - 3} more`
                    : ""}
                </span>
              </div>
            )} */}

            {/* Rate Information */}
            {profileData?.fp_amt_hour && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Rate: </span>
                <span className="text-[#3e5a9a] font-bold">
                  ₹{profileData.fp_amt_hour}/
                  {profileData.fp_amount_for || "Hour"}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="group flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-white border-2 border-[#3e5a9a]/30 text-[#3e5a9a] rounded-xl font-semibold transition-all duration-200 hover:bg-[#3e5a9a]/5 hover:border-[#3e5a9a]/50 hover:shadow-sm">
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Send Message
              </button>
              
              <button 
                onClick={handleRequestContactDetails}
                disabled={isRequestingContact}
                className="group flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-[#3e5a9a] text-white rounded-xl font-semibold transition-all duration-200 hover:bg-[#2d4a7a] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone className={`w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200 ${isRequestingContact ? 'animate-pulse' : ''}`} />
                {isRequestingContact ? 'Requesting...' : 'Get Contact Details'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="px-8 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
          About Me
        </h2>
        <div 
          className="text-gray-700 leading-relaxed text-sm"
          dangerouslySetInnerHTML={{
            __html: profileData?.fp_desc ||
              "This freelancer is available for professional services. Contact them to discuss your project requirements and get started."
          }}
        />

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          {profileData?.fp_completing_time && (
            <div>
              <span className="text-sm font-semibold text-gray-600">
                Completion Time:{" "}
              </span>
              <span className="text-sm text-gray-900">
                {profileData.fp_completing_time}
              </span>
            </div>
          )}

          {profileData?.fp_payment_methode && (
            <div>
              <span className="text-sm font-semibold text-gray-600">
                Payment:{" "}
              </span>
              <span className="text-sm text-gray-900">
                {profileData.fp_payment_methode}
              </span>
            </div>
          )}

          {profileData?.fp_ex_year && (
            <div>
              <span className="text-sm font-semibold text-gray-600">
                Experience:{" "}
              </span>
              <span className="text-sm text-gray-900">
                {profileData.fp_ex_year} years
              </span>
            </div>
          )}

          {profileData?.fp_occupation && profileData.fp_occupation !== "0" && (
            <div>
              <span className="text-sm font-semibold text-gray-600">
                Occupation:{" "}
              </span>
              <span className="text-sm text-gray-900">
                {profileData.fp_occupation}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
