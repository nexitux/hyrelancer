"use client";
import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Divider,
  message,
  Progress,
  Typography,
  Space,
  Tag,
  Descriptions,
  Switch,
  Spin
} from "antd";
import {
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  TwitterOutlined,
  YoutubeFilled,
  GlobalOutlined,
  EditOutlined,
  CheckOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import api from '@/config/api'; // Update this import path
import Loader from "../../../../components/Loader/page";
import { sanitizeInput, validationConfigs } from "@/utils/inputValidation";
import { ValidatedAntdInput } from "../../../../components/ValidatedAntdInput";

const { Title, Text } = Typography;

const socialPlatforms = [
  {
    key: "fp_fb",
    name: "Facebook",
    placeholder: "https://www.facebook.com/yourprofile",
    icon: <FacebookFilled className="text-blue-600" />,
    color: "bg-blue-50 border-blue-100",
    hoverColor: "hover:border-blue-500"
  },
  {
    key: "fp_twitter",
    name: "Twitter",
    placeholder: "https://twitter.com/yourhandle",
    icon: <TwitterOutlined className="text-sky-400" />,
    color: "bg-sky-50 border-sky-100",
    hoverColor: "hover:border-sky-400"
  },
  {
    key: "fp_instagram",
    name: "Instagram",
    placeholder: "https://instagram.com/yourprofile",
    icon: <InstagramFilled className="text-pink-500" />,
    color: "bg-pink-50 border-pink-100",
    hoverColor: "hover:border-pink-500"
  },
  {
    key: "fp_Linkdein",
    name: "LinkedIn",
    placeholder: "https://linkedin.com/in/yourprofile",
    icon: <LinkedinFilled className="text-blue-700" />,
    color: "bg-blue-50 border-blue-100",
    hoverColor: "hover:border-blue-600"
  },
  {
    key: "fp_youtube",
    name: "YouTube",
    placeholder: "https://youtube.com/yourchannel",
    icon: <YoutubeFilled className="text-red-600" />,
    color: "bg-red-50 border-red-100",
    hoverColor: "hover:border-red-500"
  },
  {
    key: "fp_pinterest",
    name: "Pinterest",
    placeholder: "https://pinterest.com/yourprofile",
    icon: <GlobalOutlined className="text-red-500" />,
    color: "bg-red-50 border-red-100",
    hoverColor: "hover:border-red-400"
  },
  {
    key: "fp_Website",
    name: "Website",
    placeholder: "https://yourwebsite.com",
    icon: <GlobalOutlined className="text-green-600" />,
    color: "bg-green-50 border-green-100",
    hoverColor: "hover:border-green-500"
  },
];

const SocialTab = ({ onNext, onBack, isRegistration = false, showCompletionModal }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [socialData, setSocialData] = useState(null);
  const [initialData, setInitialData] = useState({});
  const [approvalData, setApprovalData] = useState(null);

  // Fetch social data on component mount
  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      setDataLoading(true);
      const response = await api.get('/get_social');

      if (response.data && response.data.fp_social) {
        const socialInfo = response.data.fp_social;
        
        // Store approval data if available
        if (response.data.u_approval) {
          setApprovalData(response.data.u_approval);
        }

        // Extract social media fields
        const socialFields = {
          fp_fb: socialInfo.fp_fb || '',
          fp_Linkdein: socialInfo.fp_Linkdein || '',
          fp_twitter: socialInfo.fp_twitter || '',
          fp_pinterest: socialInfo.fp_pinterest || '',
          fp_instagram: socialInfo.fp_instagram || '',
          fp_youtube: socialInfo.fp_youtube || '',
          fp_Website: socialInfo.fp_Website || ''
        };

        setInitialData(socialFields);
        form.setFieldsValue(socialFields);

        // Format data for display - only show platforms with actual data
        const formattedData = Object.entries(socialFields)
          .filter(([_, value]) => value && value.trim() !== "" && value !== "0" && value !== null && value !== undefined)
          .map(([key, value]) => {
            const platform = socialPlatforms.find(p => p.key === key);
            return {
              platform: platform?.name || key,
              url: value,
              icon: platform?.icon,
              color: platform?.color,
              fieldKey: key // Add field key for verification badge mapping
            };
          });

        setSocialData(formattedData);

        // If no data exists, start in editing mode
        if (formattedData.length === 0) {
          setIsEditing(true);
        }
      } else {
        // No data found, start in editing mode
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
      message.error('Failed to load social media data');
      setIsEditing(true); // Start in editing mode if fetch fails
    } finally {
      setDataLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Send data to API
      const response = await api.post('/storeFeSocial', values);

      if (response.status === 200 || response.status === 201) {
        // Format data for display - only show platforms with actual data
        const formattedData = Object.entries(values)
          .filter(([_, value]) => value && value.trim() !== "" && value !== "0" && value !== null && value !== undefined)
          .map(([key, value]) => {
            const platform = socialPlatforms.find(p => p.key === key);
            return {
              platform: platform?.name || key,
              url: value,
              icon: platform?.icon,
              color: platform?.color,
              fieldKey: key // Add field key for verification badge mapping
            };
          });

        setSocialData(formattedData);
        setInitialData(values);
        message.success("Social links saved successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving social data:', error);
      message.error('Failed to save social media links');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue(initialData);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    form.setFieldsValue(initialData);
  };

  const calculateProgress = () => {
    const values = form.getFieldsValue();
    const filled = Object.values(values).filter(
      (val) => val && val.trim() !== "" && val !== "0" && val !== null && val !== undefined
    );
    return Math.round((filled.length / socialPlatforms.length) * 100);
  };

  const renderVerificationBadge = () => {
    // Only show badge in freelancer mode (not registration)
    if (isRegistration || !approvalData) return null;

    const isVerified = approvalData.fa_tab_4_app === "1";
    
    return (
      <Tag
        icon={isVerified ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        color={isVerified ? "success" : "warning"}
        className="ml-2"
      >
        {isVerified ? "Verified" : "Pending"}
      </Tag>
    );
  };

  const renderFieldVerificationBadge = (fieldKey) => {
    // Only show field badges if overall tab is verified and not in registration mode
    if (isRegistration || !approvalData || approvalData.fa_tab_4_app !== "1") return null;

    const isFieldVerified = approvalData[fieldKey] === "1" || approvalData[fieldKey] === 1;
    
    return (
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ml-2 ${
          isFieldVerified 
            ? 'bg-lime-500 text-white' 
            : 'bg-yellow-300 text-white'
        }`}
        title={isFieldVerified ? "Verified" : "Pending"}
      >
        {isFieldVerified ? <CheckCircleOutlined className="text-xl" /> : <ClockCircleOutlined className="text-xs" />}
      </div>
    );
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader indicator={<LoadingOutlined style={{ fontSize: 48 }} Loader />} />
          <div className="mt-4">
            <Text className="text-gray-600">Loading social media data...</Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-sm rounded-lg overflow-hidden border-0">
          <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex justify-between items-start sm:items-center">
              <div>
                <div className="flex items-center">
                  <Title level={3} className="!mb-1 !text-gray-900 mr-2">
                    {isEditing ? "Social Media Links" : "Your Social Profiles"}
                  </Title>
                  {renderVerificationBadge()}
                </div>
                <Text type="secondary">
                  {isEditing ? "Add your official social media handles" : "Manage your connected social profiles"}
                </Text>
              </div>
              {!isEditing && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={toggleEdit}
                  className="flex items-center"
                >
                  Edit Links
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={initialData}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {socialPlatforms.map((platform) => (
                    <Form.Item
                      key={platform.key}
                      name={platform.key}
                      className="mb-0"
                    >
                      <div className={`flex items-center gap-4 p-3 rounded-lg border ${platform.color} ${platform.hoverColor} transition-all`}>
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm">
                          <span className="text-xl">{platform.icon}</span>
                        </div>
                        <div className="flex-1">
                          <Text strong className="block text-gray-700">
                            {platform.name}
                          </Text>
                          <ValidatedAntdInput
                            placeholder={platform.placeholder}
                            className="w-full mt-1"
                            size="large"
                            validationType="url"
                            validationConfig={validationConfigs.title}
                            allowClear
                          />
                        </div>
                      </div>
                    </Form.Item>
                  ))}
                </div>

                <Divider className="my-8" />

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <Text className="text-sm font-medium">Profile Completion</Text>
                    <Text className="text-sm">{calculateProgress()}%</Text>
                  </div>
                  <Progress
                    percent={calculateProgress()}
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                    showInfo={false}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  {/* Always show back button if onBack is provided */}
                  {onBack && (
                    <Button
                      size="large"
                      className="flex items-center"
                      disabled={loading}
                      onClick={onBack}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    size="large"
                    className="flex items-center"
                    disabled={loading}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    icon={<CheckOutlined />}
                    className="flex items-center"
                  >
                    Save Links
                  </Button>
                </div>
              </Form>
            ) : (
              <div>
                {/* View Mode */}
                <div className="mb-8">
                  <Title level={4} className="!mb-6">
                    Connected Social Profiles
                  </Title>

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
                            <div className="flex items-center">
                              <Text strong className="block text-gray-700 flex-1">
                                {profile.platform}
                              </Text>
                              {renderFieldVerificationBadge(`fa_${profile.fieldKey.replace('fp_', '')}_app`)}
                            </div>
                            <Text className="text-gray-500 text-sm truncate block">
                              {profile.url}
                            </Text>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <GlobalOutlined className="text-4xl text-gray-300" />
                      </div>
                      <Title level={5} className="!text-gray-400 !mb-2">
                        No social profiles added yet
                      </Title>
                      <Text type="secondary" className="block mb-4">
                        Connect your social media accounts to showcase your online presence
                      </Text>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setIsEditing(true)}
                      >
                        Add Social Links
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  {/* Always show back button if onBack is provided */}
                  {onBack && (
                    <Button
                      size="large"
                      className="flex items-center"
                      onClick={onBack}
                    >
                      Back
                    </Button>
                  )}
                  {onNext && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => {
                        if (isRegistration && showCompletionModal) {
                          showCompletionModal(
                            "Social Media Completed!",
                            "Your social media profiles have been linked successfully.",
                            "Continue to Portfolio"
                          );
                        }
                        onNext();
                      }}
                      className="flex items-center"
                    >
                      {isRegistration ? "Save & Next" : "Save Details"}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SocialTab;