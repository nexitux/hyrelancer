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

const API_BASE = "https://test.hyrelancer.in/api";

export default function InfoOverview({
  profileData,
  userData,
  services,
  subCategories,
  cities,
  states,
  idProof,
}) {
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [working, setWorking] = useState(false);

  // Helper functions
  const getLanguagesDisplay = (langString) => {
    if (!langString) return "Not specified";
    const langs = langString.split(",").filter((lang) => lang.trim());
    return langs.slice(0, 2).join(", ") + (langs.length > 2 ? "..." : "");
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
      url:
        profileData?.fp_Linkdein && profileData?.fp_Linkdein !== "0"
          ? profileData?.fp_Linkdein
          : null,
    },
    {
      name: "Twitter",
      icon: "tw",
      color: "hover:bg-blue-100",
      url:
        profileData?.fp_twitter && profileData?.fp_twitter !== "0"
          ? profileData?.fp_twitter
          : null,
    },
    {
      name: "Facebook",
      icon: "fb",
      color: "hover:bg-blue-100",
      url:
        profileData?.fp_fb && profileData?.fp_fb !== "0" ? profileData?.fp_fb : null,
    },
    {
      name: "Instagram",
      icon: "ig",
      color: "hover:bg-pink-100",
      url:
        profileData?.fp_instagram && profileData?.fp_instagram !== "0"
          ? profileData?.fp_instagram
          : null,
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
      value: getLanguagesDisplay(profileData?.fp_lang),
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
                  className={`w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center text-xs font-medium text-gray-600 transition-all duration-200 ${social.color} hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 cursor-pointer`}
                  title={`Visit ${social.name}`}
                >
                  {social.icon}
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
