'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MdArrowBack, 
  MdEdit, 
  MdDelete, 
  MdShare, 
  MdBookmark,
  MdStar,
  MdPeople,
  MdMoreVert,
  MdCheckCircle,
  MdCancel,
  MdVisibility
} from 'react-icons/md';
import { Base64 } from 'js-base64';

// API configuration and Token Manager
const API_BASE_URL = 'https://hyre.hyrelancer.com/api/admin';
const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }
};

// Helper function to decode Base64 ID
const decodeId = (encodedId) => {
  try {
    return Base64.decode(encodedId);
  } catch (error) {
    console.error("Failed to decode Base64 ID:", error);
    return null;
  }
};

// Helper function to format date from API
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ServiceDetailsPage({ params }) {
  const router = useRouter();
  const { id: encodedId } = params; // Get the encoded ID from the URL

  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const decodedId = encodedId ? decodeId(encodedId) : null;

  const fetchServiceDetails = useCallback(async () => {
    if (!decodedId) {
      setError("Invalid service ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/services/${encodedId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service not found.');
        }
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to fetch service details.');
      }

      const result = await response.json();
      setServiceData(result);
      
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [decodedId, encodedId]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading service details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <p>No service data available.</p>
      </div>
    );
  }
  
  // A helper function to determine the image source
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/1000x400.png?text=No+Image+Available';
    if (imagePath.startsWith('http')) {
      return imagePath; // Return full URL if it's already a link
    }
    return `https://hyre.hyrelancer.com/${imagePath}`; // Prepend base URL
  };


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Breadcrumb and Back Button */}
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => router.back()}
                className="flex gap-2 items-center transition-colors text-slate-600 hover:text-slate-800"
              >
                <MdArrowBack size={20} />
                <span>Back to Services</span>
              </button>
              <div className="text-sm text-slate-500">
                Service &gt; Service Details
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 items-center">
              {/* Bookmark Button (static) */}
              <button 
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MdBookmark size={20} />
              </button>
              {/* Edit Button */}
              <button 
                onClick={() => router.push(`/control/ServicesList/ServiceEdit/${encodedId}`)}
                className="flex gap-2 items-center px-4 py-2 text-blue-600 rounded-lg border border-blue-200 transition-colors hover:bg-blue-50"
              >
                <MdEdit size={16} />
                Edit
              </button>
              <button className="p-2 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                <MdMoreVert size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hero Section */}
            <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
              <div className="relative">
                <img 
                  src={getImageUrl(serviceData.se_img)}
                  alt={serviceData.se_name}
                  className="object-cover w-full h-64"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm bg-white/90 text-slate-800">
                    {/* Assuming you can get category name from se_ca_id */}
                    Category ID: {serviceData.se_ca_id}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex gap-1 items-center px-2 py-1 text-sm font-medium rounded-full backdrop-blur-sm ${
                    serviceData.se_is_active === 1 ? 'bg-green-100/90 text-green-800' : 'bg-red-100/90 text-red-800'
                  }`}>
                    {serviceData.se_is_active === 1 ? <MdCheckCircle size={16} /> : <MdCancel size={16} />}
                    {serviceData.se_is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold text-slate-800">{serviceData.se_name}</h1>
                    <div className="flex gap-4 items-center text-sm text-slate-600">
                      <span>ID: {serviceData.se_id}</span>
                      <span>Slug: {serviceData.se_slug || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="max-w-none prose">
                  <p className="leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: serviceData.se_desc || 'No description provided.' }}>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Service Status */}
            <div className="p-6 bg-white rounded-xl border shadow-sm border-slate-200">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Service Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status</span>
                  <span className={`inline-flex gap-1 items-center px-2 py-1 text-sm font-medium rounded-full ${
                    serviceData.se_is_active === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {serviceData.se_is_active === 1 ? <MdCheckCircle size={14} /> : <MdCancel size={14} />}
                    {serviceData.se_is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Created At</span>
                  <span className="font-medium text-slate-800">{formatDate(serviceData.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Updated At</span>
                  <span className="font-medium text-slate-800">{formatDate(serviceData.updated_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Icon</span>
                  <img src={getImageUrl(serviceData.se_icon)} alt="Service Icon" className="w-10 h-10 object-cover rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}