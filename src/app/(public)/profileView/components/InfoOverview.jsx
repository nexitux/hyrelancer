"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  MapPin,
  DollarSign,
  Calendar,
  Globe,
  User,
} from "lucide-react";

const API_BASE = "https://backend.hyrelancer.in/api";

export default function InfoOverview({
  profileData,
  userData,
  services,
  subCategories,
  cities,
  states,
  idProof,
  languages,
}) {
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [working, setWorking] = useState(false);

  // Helper functions
  const getLanguagesDisplay = () => {
    if (!languages || languages.length === 0) return "Not specified";
    const langNames = languages.map((lang) => lang.la_language);
    return langNames.slice(0, 2).join(", ") + (langNames.length > 2 ? "..." : "");
  };

  const getServicesDisplay = () => {
    if (!services || services.length === 0) return "Not specified";
    const serviceNames = services.map((service) => service.se_name);
    return serviceNames.slice(0, 2).join(", ") + (serviceNames.length > 2 ? "..." : "");
  };

  const getLocationDisplay = () => {
    if (!cities || cities.length === 0) return "Not specified";
    const cityNames = cities.map((city) => city.cit_name);
    const stateNames = states?.map((state) => state.s_name) || [];

    if (cityNames.length > 0 && stateNames.length > 0) {
      return `${cityNames[0]}, ${stateNames[0]}`;
    }
    return cityNames[0] || "Not specified";
  };

  const getRateDisplay = () => {
    if (!profileData?.fp_amt_hour) return "Contact for pricing";
    const rate = profileData.fp_amt_hour;
    const rateFor = profileData.fp_amount_for || "Hour";
    return `₹${rate}/${rateFor}`;
  };

  // Only include social entries that have a usable URL (not null, empty or '0')
  const socialIcons = [
    {
      name: "LinkedIn",
      icon: "in",
      color: "hover:bg-blue-100",
      url: profileData?.fp_Linkdein && profileData?.fp_Linkdein !== "0" ? profileData?.fp_Linkdein : null,
    },
    {
      name: "Twitter",
      icon: "tw",
      color: "hover:bg-blue-100",
      url: profileData?.fp_twitter && profileData?.fp_twitter !== "0" ? profileData?.fp_twitter : null,
    },
    {
      name: "Facebook",
      icon: "fb",
      color: "hover:bg-blue-100",
      url: profileData?.fp_fb && profileData?.fp_fb !== "0" ? profileData?.fp_fb : null,
    },
    {
      name: "Instagram",
      icon: "ig",
      color: "hover:bg-pink-100",
      url: profileData?.fp_instagram && profileData?.fp_instagram !== "0" ? profileData?.fp_instagram : null,
    },
    {
      name: "YouTube",
      icon: "yt",
      color: "hover:bg-red-100",
      url: profileData?.fp_youtube && profileData?.fp_youtube !== "0" ? profileData?.fp_youtube : null,
    },
    {
      name: "Website",
      icon: "web",
      color: "hover:bg-gray-100",
      url: profileData?.fp_Website && profileData?.fp_Website !== "0" ? profileData?.fp_Website : null,
    },
  ].filter((s) => !!s.url);

  const infoItems = [
    {
      label: "Display Name:",
      value: profileData?.fp_display_name || userData?.name || "N/A",
      icon: User,
    },
    {
      label: "Services:",
      value: getServicesDisplay(),
      icon: FileText,
    },
    {
      label: "Location:",
      value: getLocationDisplay(),
      icon: MapPin,
    },
    {
      label: "Rate:",
      value: getRateDisplay(),
      icon: DollarSign,
    },
    {
      label: "Experience:",
      value: profileData?.fp_ex_year ? `${profileData.fp_ex_year} Years` : "Not specified",
      icon: Calendar,
    },
    {
      label: "Language:",
      value: getLanguagesDisplay(),
      icon: Globe,
    },
    {
      label: "Available:",
      value: profileData?.fp_available || "Not specified",
      icon: User,
    },
  ];

  // Option A: simple browser-driven download
  const handleDownload = () => {
    if (!profileData?.fp_slug) {
      alert("Profile slug not available");
      return;
    }

    setWorking(true);
    try {
      const apiUrl = `${API_BASE}/FeelancerPDF/${encodeURIComponent(profileData.fp_slug)}`;
      // Open in a new tab/window — browser will handle the download if backend sends proper headers
      window.open(apiUrl, "_blank");
    } catch (err) {
      console.error("Download fallback error:", err);
      alert("Unable to start download. Please try again.");
    } finally {
      // small delay so the spinner shows briefly
      setTimeout(() => setWorking(false), 5000);
    }
  };

  return (
    <div className="mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Info Overview</h2>
      </div>

      {/* Info Items */}
      <div className="px-6 py-4 space-y-4">
        {infoItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200">
                  <IconComponent size={14} className="text-gray-600 group-hover:text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
              </div>
              <span
                className="text-sm font-semibold text-gray-900 text-right max-w-32 truncate"
                title={item.value}
              >
                {item.value}
              </span>
            </div>
          );
        })}

        {/* Social Media Section (only show if any social exists) */}
        {socialIcons.length > 0 && (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gray-50">
                <ExternalLink size={14} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Socials:</span>
            </div>
            <div className="flex gap-2">
              {socialIcons.map((social, index) => (
                <button
                  key={index}
                  onMouseEnter={() => setHoveredSocial(index)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  onClick={() => {
                    if (social.url) window.open(social.url, "_blank");
                  }}
                  className={`w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-xs font-medium text-gray-600 transition-all duration-200 ${social.color} hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 cursor-pointer`}
                  title={`Visit ${social.name}`}
                >
                  {social.icon === "in" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  {social.icon === "tw" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  )}
                  {social.icon === "fb" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  {social.icon === "ig" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.297h-1.297V6.394h1.297v1.297zm-2.594 0H12.39V6.394h1.295v1.297zm-2.594 0H9.796V6.394h1.295v1.297z"/>
                    </svg>
                  )}
                  {social.icon === "yt" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  )}
                  {social.icon === "web" && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="px-6 py-5 bg-white border-t border-gray-100">
        <button
          onClick={handleDownload}
          disabled={working}
          className="w-full px-6 py-3 bg-[#3e5a9a] hover:bg-[#3e5a9d] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <Download size={16} />
            {working ? "Preparing CV..." : `Download ${profileData?.fp_display_name || "Freelancer"}'s CV`}
          </span>
        </button>
      </div>

      {/* Decorative Bottom Element */}
      <div className="h-1 bg-[#3e5a9a]"></div>
    </div>
  );
}
