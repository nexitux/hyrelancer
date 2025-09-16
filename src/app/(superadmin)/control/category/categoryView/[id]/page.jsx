"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  MdArrowBack, 
  MdEdit, 
  MdDelete, 
  MdMoreVert,
  MdCheckCircle,
  MdInfo
} from 'react-icons/md';

// API configuration and Token Manager
const API_BASE_URL = 'https://test.hyrelancer.in/api/admin';
const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }
};

// Helper function to decode Base64 ID
import { Base64 } from 'js-base64';

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

export default function CategoryDetailsPage({ params }) {
  const router = useRouter();
  const { id: encodedId } = params; // Get the encoded ID from the URL

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodedId = encodedId ? decodeId(encodedId) : null;

  const fetchCategoryDetails = useCallback(async () => {
    if (!decodedId) {
      setError("Invalid category ID provided.");
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

      const response = await fetch(`${API_BASE_URL}/category/${encodedId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Category not found.');
        }
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to fetch category details.');
      }

      const result = await response.json();
      setCategoryData(result.data);
      
    } catch (err) {
      console.error('Error fetching category details:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [decodedId, encodedId]);

  useEffect(() => {
    fetchCategoryDetails();
  }, [fetchCategoryDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading category details...</p>
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

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <p>No category data available.</p>
      </div>
    );
  }

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
                <span>Back to Categories</span>
              </button>
              <div className="text-sm text-slate-500">
                Category &gt; Category Details
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 items-center">
              <button 
                onClick={() => router.push(`/control/category/edit-category/${encodedId}`)}
                className="flex gap-2 items-center px-4 py-2 text-blue-600 rounded-lg border border-blue-200 transition-colors hover:bg-blue-50"
              >
                <MdEdit size={16} />
                Edit
              </button>
              {/* <button className="p-2 rounded-lg transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                <MdDelete size={20} />
              </button> */}
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
                {categoryData.sc_img && (
                  <img 
                    src={`https://test.hyrelancer.in/${categoryData.sc_img}`} 
                    alt={categoryData.sc_name}
                    className="object-cover w-full h-64"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex gap-1 items-center px-2 py-1 text-sm font-medium rounded-full backdrop-blur-sm ${
                    categoryData.sc_is_active === 1 ? 'bg-green-100/90 text-green-800' : 'bg-red-100/90 text-red-800'
                  }`}>
                    <MdCheckCircle size={16} />
                    {categoryData.sc_is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold text-slate-800">{categoryData.sc_name}</h1>
                    <div className="flex gap-4 items-center text-sm text-slate-600">
                      <span>ID: {categoryData.sc_id}</span>
                      <span>Slug: {categoryData.sc_slug}</span>
                    </div>
                  </div>
                </div>

                <div className="max-w-none prose" dangerouslySetInnerHTML={{ __html: categoryData.sc_desc || 'No description provided.' }}>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Category Info */}
            <div className="p-6 bg-white rounded-xl border shadow-sm border-slate-200">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Category Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Created Date</span>
                  <span className="font-medium text-slate-800">{formatDate(categoryData.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="font-medium text-slate-800">{formatDate(categoryData.updated_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Active Status</span>
                  <span className={`font-medium ${categoryData.sc_is_active === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {categoryData.sc_is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Icon & Image */}
            <div className="p-6 bg-white rounded-xl border shadow-sm border-slate-200">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Media</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Category Icon</h4>
                  {categoryData.sc_icon ? (
                    <img src={`https://test.hyrelancer.in/${categoryData.sc_icon}`} alt="Category Icon" className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-slate-100 rounded-lg text-sm text-slate-500">No Icon</div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Category Banner</h4>
                  {categoryData.sc_img ? (
                    <img src={`https://test.hyrelancer.in/${categoryData.sc_img}`} alt="Category Banner" className="w-full h-auto object-cover rounded-lg border border-slate-200" />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-slate-100 rounded-lg text-sm text-slate-500">No Banner</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}