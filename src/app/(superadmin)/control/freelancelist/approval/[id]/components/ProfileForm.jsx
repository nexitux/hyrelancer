"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Edit, ArrowLeft } from "lucide-react";

const TokenManager = {
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  },
  clearToken: () => {
    if (typeof window !== "undefined") localStorage.removeItem("adminToken");
  },
};

export default function ProfileDisplay() {
  const params = useParams();
  const router = useRouter();
  const userIdBase64 = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Fetch profile when id available
  useEffect(() => {
    if (!userIdBase64) {
      setLoading(false);
      setError("Missing id in route.");
      return;
    }

    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://test.hyrelancer.in/api/admin/getFeUProfile/${userIdBase64}`;
        const token = TokenManager.getToken();

        const res = await fetch(url, {
          method: "GET",
          headers: { 
            "Accept": "application/json", 
            ...(token ? { Authorization: `Bearer ${token}` } : {}) 
          },
        });

        const text = await res.text();
        let data;
        try { 
          data = text ? JSON.parse(text) : null; 
        } catch (e) { 
          data = text; 
        }

        if (!res.ok) {
          console.warn("Profile fetch failed", res.status, data);
          if (res.status === 401) {
            TokenManager.clearToken();
            setError("Unauthorized. Redirecting to login...");
            router.push("/admin/login");
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        if (!cancelled) {
          if (data && data.u_profile) {
            setProfile(data.u_profile);
            
            // Handle image URL
            if (data.u_profile.fp_img && data.u_profile.fp_img !== "0") {
              let imageUrl = data.u_profile.fp_img;
              
              // Handle the double filename issue from API
              if (imageUrl.includes('--')) {
                imageUrl = imageUrl.split('--')[0];
              }
              
              // Ensure proper URL construction
              if (!imageUrl.startsWith('http')) {
                imageUrl = `https://test.hyrelancer.in/${imageUrl.replace(/^\/+/, "")}`;
              }
              
              setImagePreviewUrl(imageUrl);
            }
          } else {
            setError("Profile not found");
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to fetch profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [userIdBase64, router]);

  // If id missing show helpful UI
  if (!userIdBase64) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Missing profile id in the URL. Make sure this page is accessed at a route like <code className="bg-yellow-100 px-1 rounded">/.../MTUz</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">No profile data found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract languages from profile
  const languages = (profile.fp_lang || "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with actions */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">User Profile</h1>
              <p className="text-sm text-gray-500">View freelancer profile</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image and Basic Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="mb-4">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Profile"
                      className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-gray-100 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-32 h-32 bg-gray-100 rounded-full mx-auto flex items-center justify-center ${imagePreviewUrl ? 'hidden' : 'flex'}`}
                  >
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {profile.fp_display_name && profile.fp_display_name !== "0" 
                    ? profile.fp_display_name 
                    : "No display name"
                  }
                </h2>
                
                {profile.fp_headline && profile.fp_headline !== "0" && (
                  <p className="text-sm text-gray-600 mb-4">{profile.fp_headline}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {profile.fp_available || "Not specified"}
                    </span>
                  </div>
                  {profile.fp_completing_time && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">Completing time:</span>
                      <span>{profile.fp_completing_time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Languages Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.length > 0 ? (
                    languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No languages specified</span>
                  )}
                </div>
              </div>

              {/* About Me Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">About Me</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: profile.fp_desc && profile.fp_desc !== "0"
                        ? profile.fp_desc
                        : "<p class='text-gray-500 italic'>No description provided</p>"
                    }}
                  />
                </div>
              </div>

              {/* Additional Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Method */}
                {profile.fp_payment_methode && profile.fp_payment_methode !== "0" && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h4>
                    <p className="text-gray-900">{profile.fp_payment_methode}</p>
                  </div>
                )}

                {/* Amount Type */}
                {profile.fp_amount_for && profile.fp_amount_for !== "0" && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Amount For</h4>
                    <p className="text-gray-900">{profile.fp_amount_for}</p>
                  </div>
                )}

                {/* Amount per Hour */}
                {profile.fp_amt_hour && profile.fp_amt_hour !== "0" && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Amount per Hour</h4>
                    <p className="text-gray-900">{profile.fp_amt_hour}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}