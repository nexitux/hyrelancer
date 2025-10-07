"use client";

import { useState } from 'react';
import { FileText, Download, ExternalLink, MapPin, DollarSign, Calendar, Globe, User } from 'lucide-react';

export default function InfoOverview({ 
  profileData, 
  userData, 
  services, 
  subCategories, 
  cities, 
  states, 
  idProof 
}) {
  const [hoveredSocial, setHoveredSocial] = useState(null);

  // Helper functions
  const getLanguagesDisplay = (langString) => {
    if (!langString) return 'Not specified';
    const langs = langString.split(',').filter(lang => lang.trim());
    return langs.slice(0, 2).join(', ') + (langs.length > 2 ? '...' : '');
  };

  const getServicesDisplay = () => {
    if (!services || services.length === 0) return 'Not specified';
    const serviceNames = services.map(service => service.se_name);
    return serviceNames.slice(0, 2).join(', ') + (serviceNames.length > 2 ? '...' : '');
  };

  const getLocationDisplay = () => {
    if (!cities || cities.length === 0) return 'Not specified';
    const cityNames = cities.map(city => city.cit_name);
    const stateNames = states?.map(state => state.s_name) || [];
    
    if (cityNames.length > 0 && stateNames.length > 0) {
      return `${cityNames[0]}, ${stateNames[0]}`;
    }
    return cityNames[0] || 'Not specified';
  };

  const getRateDisplay = () => {
    if (!profileData?.fp_amt_hour) return 'Contact for pricing';
    const rate = profileData.fp_amt_hour;
    const rateFor = profileData.fp_amount_for || 'Hour';
    return `₹${rate}/${rateFor}`;
  };

  const socialIcons = [
    { 
      name: 'LinkedIn', 
      icon: 'in', 
      color: 'hover:bg-blue-100',
      url: profileData?.fp_Linkdein !== '0' ? profileData?.fp_Linkdein : null
    },
    { 
      name: 'Twitter', 
      icon: 'tw', 
      color: 'hover:bg-blue-100',
      url: profileData?.fp_twitter !== '0' ? profileData?.fp_twitter : null
    },
    { 
      name: 'Facebook', 
      icon: 'fb', 
      color: 'hover:bg-blue-100',
      url: profileData?.fp_fb !== '0' ? profileData?.fp_fb : null
    },
    { 
      name: 'Instagram', 
      icon: 'ig', 
      color: 'hover:bg-blue-100',
      url: profileData?.fp_instagram !== '0' ? profileData?.fp_instagram : null
    }
  ];

  const infoItems = [
    { 
      label: 'Display Name:', 
      value: profileData?.fp_display_name || userData?.name || 'N/A', 
      icon: User 
    },
    { 
      label: 'Services:', 
      value: getServicesDisplay(), 
      icon: FileText 
    },
    { 
      label: 'Location:', 
      value: getLocationDisplay(), 
      icon: MapPin 
    },
    { 
      label: 'Rate:', 
      value: getRateDisplay(), 
      icon: DollarSign 
    },
    { 
      label: 'Experience:', 
      value: profileData?.fp_ex_year ? `${profileData.fp_ex_year} Years` : 'Not specified', 
      icon: Calendar 
    },
    { 
      label: 'Language:', 
      value: getLanguagesDisplay(profileData?.fp_lang), 
      icon: Globe 
    },
    { 
      label: 'Available:', 
      value: profileData?.fp_available || 'Not specified', 
      icon: User 
    }
  ];

  const handleDownload = () => {
    console.log('Downloading CV PRO...');
    // Handle CV download logic here
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
              <span className="text-sm font-semibold text-gray-900 text-right max-w-32 truncate" title={item.value}>
                {item.value}
              </span>
            </div>
          );
        })}

        {/* Social Media Section */}
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
                  if (social.url) {
                    window.open(social.url, '_blank');
                  }
                }}
                className={`w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center text-xs font-medium text-gray-600 transition-all duration-200 ${social.color} hover:border-blue-300 hover:text-blue-600 transform hover:scale-105 ${!social.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={social.url ? `Visit ${social.name}` : `${social.name} not provided`}
                disabled={!social.url}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File Downloads Section */}
      <div className="px-6 py-4 space-y-3 bg-gray-50 border-t border-gray-100">
        {/* ID Proof Files */}
        {idProof && idProof.length > 0 && idProof.slice(0, 2).map((proof, index) => (
          <div key={proof.fi_id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {proof.fi_type}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  ID: {proof.fi_number?.substring(0, 8)}...
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                ID
              </div>
              <button 
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                onClick={() => {
                  if (proof.fi_img) {
                    window.open(`https://hyre.hyrelancer.com/${proof.fi_img.split('--')[0]}`, '_blank');
                  }
                }}
                disabled={!proof.fi_img}
              >
                <Download size={14} className="text-gray-600" />
              </button>
            </div>
          </div>
        ))}

        {/* Placeholder files if no ID proof */}
        {(!idProof || idProof.length === 0) && (
          <>
            {/* PDF File Placeholder */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group opacity-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors duration-200">
                  <FileText size={16} className="text-red-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">FILE_NAME_PDF</div>
                  <div className="text-sm font-semibold text-gray-900">PDF</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">PDF</div>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200" disabled>
                  <Download size={14} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* DOC File Placeholder */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 group opacity-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">FILE_NAME_DOC</div>
                  <div className="text-sm font-semibold text-gray-900">DOC</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">DOC</div>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200" disabled>
                  <Download size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Download Button */}
      <div className="px-6 py-5 bg-white border-t border-gray-100">
        <button
          onClick={handleDownload}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center gap-2">
            <Download size={16} />
            Contact {profileData?.fp_display_name || 'Freelancer'}
          </span>
        </button>
      </div>

      {/* Decorative Bottom Element */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500"></div>
    </div>
  );
}