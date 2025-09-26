"use client";
import React, { useState, useEffect } from "react";
import {
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  TwitterOutlined,
  YoutubeFilled,
  GlobalOutlined,
  ShareAltOutlined
} from "@ant-design/icons";
import { Spin, Alert, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import adminApi from "@/config/adminApi";

const socialPlatforms = [
  {
    key: "fp_fb",
    name: "Facebook",
    icon: <FacebookFilled className="text-blue-600" />,
    color: "bg-blue-50 border-blue-100 hover:border-blue-500",
  },
  {
    key: "fp_twitter",
    name: "Twitter",
    icon: <TwitterOutlined className="text-sky-400" />,
    color: "bg-sky-50 border-sky-100 hover:border-sky-400",
  },
  {
    key: "fp_instagram",
    name: "Instagram",
    icon: <InstagramFilled className="text-pink-500" />,
    color: "bg-pink-50 border-pink-100 hover:border-pink-500",
  },
  {
    key: "fp_Linkdein",
    name: "LinkedIn",
    icon: <LinkedinFilled className="text-blue-700" />,
    color: "bg-blue-50 border-blue-100 hover:border-blue-600",
  },
  {
    key: "fp_youtube",
    name: "YouTube",
    icon: <YoutubeFilled className="text-red-600" />,
    color: "bg-red-50 border-red-100 hover:border-red-500",
  },
  {
    key: "fp_pinterest",
    name: "Pinterest",
    icon: <GlobalOutlined className="text-red-500" />,
    color: "bg-red-50 border-red-100 hover:border-red-400",
  },
  {
    key: "fp_Website",
    name: "Website",
    icon: <GlobalOutlined className="text-green-600" />,
    color: "bg-green-50 border-green-100 hover:border-green-500",
  },
];

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

export default function SocialDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socialData, setSocialData] = useState([]);

  const safeString = (v) => {
    if (v === undefined || v === null) return "";
    try { return String(v); } catch { return ""; }
  };

  const formatUrlForDisplay = (url) => {
    const s = safeString(url).trim();
    if (!s) return "";
    // try to make it parseable: if missing protocol, prepend https://
    let candidate = s;
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = "https://" + candidate;
    }
    try {
      const u = new URL(candidate);
      // return host + (path but avoid long query)
      return u.hostname + (u.pathname && u.pathname !== "/" ? u.pathname : "");
    } catch {
      // If parsing still fails, just return original string
      return s;
    }
  };

  const fetchSocialData = async () => {
    if (!userId) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.get(`/getFeUsocial/${userId}`);
      // axios sometimes nests response.data.data — handle both
      const responseData = response?.data?.data ?? response?.data ?? response;

      // useful debug: uncomment to inspect shape in console
      // console.log("social api response:", response, responseData);

      const socialInfo = responseData?.fp_social;
      if (!socialInfo || typeof socialInfo !== "object") {
        setSocialData([]);
        return;
      }

      const formattedData = Object.entries(socialInfo)
        .filter(([key, value]) => {
          // only include keys we care about
          const platformDef = socialPlatforms.find((p) => p.key === key);
          if (!platformDef) return false;

          const s = safeString(value).trim();
          if (!s) return false;
          if (s === "0") return false; // your API uses "0" for empty
          return true;
        })
        .map(([key, value]) => {
          const platform = socialPlatforms.find((p) => p.key === key);
          const url = safeString(value).replace(/\\\//g, "/"); // fix escaped slashes if any
          return {
            platform: platform?.name || key,
            url,
            icon: platform?.icon,
            color: platform?.color,
            key: platform?.key,
          };
        });

      setSocialData(formattedData);
    } catch (err) {
      console.error("Error fetching social data:", err);
      if (err.response?.status === 401) {
        TokenManager.clearToken();
        setError("Unauthorized. Redirecting to login...");
        setTimeout(() => router.push("/admin/login"), 1200);
        return;
      }
      setError(err.message || "Failed to load social media data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSocialData();
  }, [userId]);


  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center py-16">
            <Spin size="large" />
            <div className="ml-4">
              <p className="text-gray-600 mb-2">Loading social profiles...</p>
              <p className="text-sm text-gray-500">Fetching social media links</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <Alert
              message="Error Loading Social Data"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                type="primary"
                onClick={fetchSocialData}
              >
                Retry
              </Button>
              <Button
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShareAltOutlined className="text-blue-600 text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Social Profiles</h1>
              <p className="text-sm text-gray-500">Connected social media accounts and websites</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Social Profiles Grid */}
          {socialData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialData.map((profile, index) => (
                <a
                  key={index}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-4 rounded-lg border ${profile.color} hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm">
                    <span className="text-xl">{profile.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 mb-1">{profile.platform}</p>
                    <p
                      className="text-gray-500 text-sm truncate"
                      title={profile.url}
                    >
                      {formatUrlForDisplay(profile.url)}
                    </p>
                  </div>
                  <div className="text-gray-400 text-xs">
                    Visit →
                  </div>
                </a>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="mb-4">
                <ShareAltOutlined className="text-4xl text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                No social profiles connected
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                This user hasn't added any social media links or website URLs yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}