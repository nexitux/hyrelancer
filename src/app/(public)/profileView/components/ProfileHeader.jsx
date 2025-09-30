import React from "react";
import { MapPin, Star, MessageCircle, User, CheckCircle } from "lucide-react";

const ProfileHeader = ({ profileData, userData, skills, languages }) => {
  // Helper functions
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath || imagePath === "0") return null;
    return `https://test.hyrelancer.in/${imagePath.split("--")[0]}`;
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

  const profileImage = getProfileImageUrl(profileData?.fp_img);
  const userLanguages = parseLanguages(profileData?.fp_lang, languages);
  const displayName =
    profileData?.fp_display_name || userData?.name || "Freelancer";
  const isVerified = profileData?.fp_is_verify === "1";
  const isAvailable = profileData?.fp_available === "Available now";

  return (
    <div className="mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 px-8 py-8">
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
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
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
            {userLanguages.length > 0 && (
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-600 mr-2">Languages:</span>
                <span className="text-sm font-medium text-gray-900">
                  {userLanguages.slice(0, 3).join(", ")}
                  {userLanguages.length > 3
                    ? `... +${userLanguages.length - 3} more`
                    : ""}
                </span>
              </div>
            )}

            {/* Rate Information */}
            {profileData?.fp_amt_hour && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Rate: </span>
                <span className="text-blue-600 font-bold">
                  ₹{profileData.fp_amt_hour}/
                  {profileData.fp_amount_for || "Hour"}
                </span>
              </div>
            )}

            {/* Message Button */}
            <button className="group flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-white border-2 border-blue-200 text-blue-700 rounded-xl font-semibold transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm">
              <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Send Message
            </button>
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
