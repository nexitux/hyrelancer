"use client";
import React, { useState, useEffect } from "react";
import {
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  TwitterOutlined,
  YoutubeFilled,
  GlobalOutlined,
  EditOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { message } from "antd"; // Import message for notifications
import { useParams } from "next/navigation";
import adminApi from "@/config/adminApi";



const socialPlatforms = [
  {
    key: "fp_fb",
    name: "Facebook",
    placeholder: "https://www.facebook.com/yourprofile",
    icon: <FacebookFilled className="text-blue-600" />,
    color: "bg-blue-50 border-blue-100",
    hoverColor: "hover:border-blue-500",
  },
  {
    key: "fp_twitter",
    name: "Twitter",
    placeholder: "https://twitter.com/yourhandle",
    icon: <TwitterOutlined className="text-sky-400" />,
    color: "bg-sky-50 border-sky-100",
    hoverColor: "hover:border-sky-400",
  },
  {
    key: "fp_instagram",
    name: "Instagram",
    placeholder: "https://instagram.com/yourprofile",
    icon: <InstagramFilled className="text-pink-500" />,
    color: "bg-pink-50 border-pink-100",
    hoverColor: "hover:border-pink-500",
  },
  {
    key: "fp_Linkdein",
    name: "LinkedIn",
    placeholder: "https://linkedin.com/in/yourprofile",
    icon: <LinkedinFilled className="text-blue-700" />,
    color: "bg-blue-50 border-blue-100",
    hoverColor: "hover:border-blue-600",
  },
  {
    key: "fp_youtube",
    name: "YouTube",
    placeholder: "https://youtube.com/yourchannel",
    icon: <YoutubeFilled className="text-red-600" />,
    color: "bg-red-50 border-red-100",
    hoverColor: "hover:border-red-500",
  },
  {
    key: "fp_pinterest",
    name: "Pinterest",
    placeholder: "https://pinterest.com/yourprofile",
    icon: <GlobalOutlined className="text-red-500" />, // Changed for variety
    color: "bg-red-50 border-red-100",
    hoverColor: "hover:border-red-400",
  },
  {
    key: "fp_Website",
    name: "Website",
    placeholder: "https://yourwebsite.com",
    icon: <GlobalOutlined className="text-green-600" />,
    color: "bg-green-50 border-green-100",
    hoverColor: "hover:border-green-500",
  },
];

const AdminSocialTab = ({ onBack, userName = "User" }) => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [socialData, setSocialData] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [error, setError] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const params = useParams();
  const userId = params?.id ? decodeURIComponent(params.id) : null;

  const calculateProgress = () => {
    const formElements = document.querySelectorAll('form input[name^="fp_"]');
    if (formElements.length === 0) return 0;
    const filled = Array.from(formElements).filter(
      (input) => input.value && input.value.trim() !== ""
    );
    return Math.round((filled.length / socialPlatforms.length) * 100);
  };

  const fetchSocialData = async () => {
    if (!userId) {
      setError("User ID is missing.");
      setDataLoading(false);
      setIsEditing(true);
      return;
    }
    try {
      setDataLoading(true);
      setError(null);

      const response = await adminApi.get(`/getFeUsocial/${userId}`);
      const responseData = response.data;

      if (responseData && responseData.fp_social) {
        const socialInfo = responseData.fp_social;
        const socialFields = {
          fp_fb: socialInfo.fp_fb || "",
          fp_Linkdein: socialInfo.fp_Linkdein || "",
          fp_twitter: socialInfo.fp_twitter || "",
          fp_pinterest: socialInfo.fp_pinterest || "",
          fp_instagram: socialInfo.fp_instagram || "",
          fp_youtube: socialInfo.fp_youtube || "",
          fp_Website: socialInfo.fp_Website || "",
        };

        setInitialData(socialFields);

        const formattedData = Object.entries(socialFields)
          .filter(([_, value]) => value && value.trim() !== "" && value !== "0")
          .map(([key, value]) => {
            const platform = socialPlatforms.find((p) => p.key === key);
            return {
              platform: platform?.name || key,
              url: value,
              icon: platform?.icon,
              color: platform?.color,
            };
          });

        setSocialData(formattedData);

        if (formattedData.length === 0) {
          setIsEditing(true);
        }
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching social data:", error);
      setError("Failed to load social media data. " + error.message);
      setIsEditing(true);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialData();
  }, [userId]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => setProgressPercent(calculateProgress()), 100);
    }
  }, [isEditing, initialData]);

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    if (!userId) {
      message.error("Cannot save: User ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const isNew = Object.values(initialData).every((val) => !val || val === "0");
      const status = isNew ? "new" : "old";

      const payload = {
        ...values,
        fp_u_id: userId,
        is_status: status,
      };

      const response = await adminApi.post('/storeFeUSocial', payload);

      message.success(response.data.message || "Social links saved successfully!");
      
      await fetchSocialData(); // Re-fetch data to sync UI
      setIsEditing(false);     // Switch back to view mode

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      console.error("Error saving social data:", err);
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = () => {
    setProgressPercent(calculateProgress());
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    onFinish(values);
  };

  const toggleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const cancelEdit = () => {
    if (socialData && socialData.length > 0) {
      setIsEditing(false);
    } else {
      message.info("Please add at least one social link to save.");
    }
    setError(null);
  };

  if (dataLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Social Profiles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShareAltOutlined className="text-blue-600 text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEditing ? `Edit ${userName}'s Social Links` : `${userName}'s Social Profiles`}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditing ? "Update social media handles" : "Manage connected social profiles"}
                </p>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftOutlined />
                Back
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {socialPlatforms.map((platform) => (
                  <div key={platform.key} className="mb-0">
                    <div
                      className={`flex items-center gap-4 p-3 rounded-lg border ${platform.color} ${platform.hoverColor} transition-all`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm">
                        <span className="text-xl">{platform.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-700 block">{platform.name}</p>
                        <input
                          name={platform.key}
                          placeholder={platform.placeholder}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          defaultValue={initialData[platform.key] || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm text-gray-600">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckOutlined />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Connected Social Profiles</h2>
                <button
                  onClick={toggleEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <EditOutlined />
                  Edit Links
                </button>
              </div>

              {socialData && socialData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socialData.map((profile, index) => (
                    <a
                      key={index}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-4 p-4 rounded-lg border ${profile.color} hover:shadow-md transition-shadow`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm">
                        <span className="text-xl">{profile.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700">{profile.platform}</p>
                        <p className="text-gray-500 text-sm truncate">{profile.url}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <GlobalOutlined className="text-4xl text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No social profiles added yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Connect social media accounts to showcase online presence
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <EditOutlined />
                    Add Social Links
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSocialTab;