"use client";
import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Input,
  Select,
  Button,
  Avatar,
  Card,
  message,
  Form,
  Typography,
  Space,
  Divider,
  Spin,
  Progress,
  Tooltip,
  Tag,
} from "antd";
import ImgCrop from "antd-img-crop";
import {
  UserOutlined,
  TagOutlined,
  CameraOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  ContactsOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import api from "@/config/api";
import { useSelector } from "react-redux";
import Loader from "../../../../components/Loader/page";
import { sanitizeInput, validationConfigs } from "@/utils/inputValidation";
import { ValidatedAntdInput, ValidatedAntdTextArea } from "../../../../components/ValidatedAntdInput";


const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

// helper to convert file to base64 for preview
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function ProfileTab({
  onNext,
  isRegistration = false,
  showCompletionModal,
}) {
  const [form] = Form.useForm();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [isEditing, setIsEditing] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [profileData, setProfileData] = useState({
    displayName: "",
    languages: [],
    tagLine: "",
    aboutMe: "",
  });
  const [profileFetchLoading, setProfileFetchLoading] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageRequiredError, setImageRequiredError] = useState(false);
  const [approvalData, setApprovalData] = useState(null);
  const uploadRef = useRef(null);

  // Get token from Redux store
  const token = useSelector((state) => state.auth.token);

  // Helper function to construct full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === "" || imagePath === "0") {
      return null;
    }

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    let cleanImagePath = imagePath;
    if (imagePath.includes("--")) {
      cleanImagePath = imagePath.split("--")[0];
    }

    let baseURL =
      api.defaults.baseURL ||
      process.env.NEXT_PUBLIC_API_BASE_URL;
    if (baseURL.endsWith("/api")) {
      baseURL = baseURL.replace("/api", "");
    }

    const finalImagePath = cleanImagePath.startsWith("/")
      ? cleanImagePath.slice(1)
      : cleanImagePath;
    return `${baseURL}/${finalImagePath}`;
  };

  // Fetch saved profile data from API
  const fetchProfileData = async () => {
    if (!token) {
      setProfileFetchLoading(false);
      return;
    }

    try {
      setProfileFetchLoading(true);
      const response = await api.get("/getProfile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.u_profile) {
        const profile = response.data.u_profile;
        
        // Store approval data if available
        if (response.data.u_approval) {
          setApprovalData(response.data.u_approval);
        }

        const mappedProfileData = {
          displayName: profile.fp_display_name || "",
          tagLine: (profile.fp_headline && profile.fp_headline !== "0") ? profile.fp_headline : "",
          aboutMe: (profile.fp_desc && profile.fp_desc !== "0") ? profile.fp_desc : "",
          languages: profile.fp_lang
            ? profile.fp_lang
                .split(",")
                .filter((lang) => lang.trim() !== "" && lang !== "0")
            : [],
        };

        setProfileData(mappedProfileData);

        const fullImageUrl = getFullImageUrl(profile.fp_img);
        if (fullImageUrl) {
          setImagePreview(fullImageUrl);
        }

        const hasValidDisplayName =
          profile.fp_display_name &&
          profile.fp_display_name.trim() !== "" &&
          profile.fp_display_name !== "0";
        const hasValidTagLine =
          profile.fp_headline &&
          profile.fp_headline.trim() !== "" &&
          profile.fp_headline !== "0";
        const hasValidDescription =
          profile.fp_desc &&
          profile.fp_desc.trim() !== "" &&
          profile.fp_desc !== "0";
        const hasValidLanguages = mappedProfileData.languages.length > 0;
        const hasValidImage = fullImageUrl !== null;

        const profileHasMeaningfulData =
          hasValidDisplayName ||
          hasValidTagLine ||
          hasValidDescription ||
          hasValidLanguages ||
          hasValidImage;

        if (profileHasMeaningfulData) {
          setHasExistingProfile(true);
          setIsEditing(false);
        } else {
          setHasExistingProfile(false);
          setIsEditing(true);
        }
      } else {
        setIsEditing(true);
        setHasExistingProfile(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setIsEditing(true);
      setHasExistingProfile(false);

      if (error.response?.status !== 404) {
        message.error("Failed to load profile data. Please try again.");
      }
    } finally {
      setProfileFetchLoading(false);
    }
  };

  // Fetch languages from API
  const fetchLanguages = async () => {
    try {
      setLanguagesLoading(true);
      const response = await api.get("/getLanglist");

      if (response.data && response.data.la_list) {
        const formattedLanguages = response.data.la_list.map((lang) => ({
          id: lang.la_id,
          value: lang.la_language.toLowerCase(),
          label: lang.la_language,
        }));
        setLanguages(formattedLanguages);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      message.error("Failed to load languages. Please try again.");

      const fallbackLanguages = [
        { id: 1, value: "english", label: "English" },
        { id: 2, value: "spanish", label: "Spanish" },
        { id: 3, value: "french", label: "French" },
        { id: 4, value: "german", label: "German" },
        { id: 5, value: "chinese", label: "Chinese" },
        { id: 6, value: "japanese", label: "Japanese" },
        { id: 7, value: "italian", label: "Italian" },
        { id: 8, value: "portuguese", label: "Portuguese" },
      ];
      setLanguages(fallbackLanguages);
    } finally {
      setLanguagesLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
    fetchProfileData();
  }, [token]);

  useEffect(() => {
    if (profileData && form) {
      form.setFieldsValue(profileData);
    }
  }, [profileData, form]);

  const handleImageUploadValidate = (file) => {
    setUploadError("");

    const isImageType = file.type?.startsWith("image/");
    if (!isImageType) {
      const errorMsg = "Please upload an image file (JPG, PNG, WEBP, etc.).";
      setUploadError(errorMsg);
      setImageRequiredError(true);
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      const errorMsg = "Image must be smaller than 10MB.";
      setUploadError(errorMsg);
      setImageRequiredError(true);
      return false;
    }
    return true;
  };

  // Upload onChange handler (antd-img-crop will provide the cropped file in file.originFileObj)
  const handleUploadChange = async ({ file }) => {
    // when user cancels cropping, file may be undefined
    if (!file) return;

    // if file.originFileObj exists, it's the (possibly cropped) File instance
    const actualFile = file.originFileObj || file;

    // run validation
    if (!handleImageUploadValidate(actualFile)) return;

    try {
      const base64 = await getBase64(actualFile);
      setProfileImage(actualFile instanceof File ? actualFile : null);
      setImagePreview(base64);
      setImageRequiredError(false);
    } catch (err) {
      console.error("Error creating preview:", err);
      setUploadError("Failed to load image preview.");
      setImageRequiredError(true);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setUploadError("");
    setImageRequiredError(true);
  };

  const onFinish = (values) => {
    if (!token) {
      message.error("Authentication required. Please login to continue.");
      return;
    }

    // Validation (Professional Headline is no longer required)
    if (!values.displayName?.trim()) {
      message.error("Display name is required");
      return;
    }
    if (!values.aboutMe?.trim()) {
      message.error("About me is required");
      return;
    }
    if (!values.languages || values.languages.length === 0) {
      message.error("At least one language is required");
      return;
    }

    if (!hasExistingProfile && !profileImage && !imagePreview) {
      setImageRequiredError(true);
      message.error("Profile image is required");
      return;
    }

    console.log("Form values on submit:", values);
    setSubmittedData(values);
    setShowConfirmation(true);
  };

  // Store profile data to API
  const storeProfile = async (formData) => {
    try {
      setLoading(true);

      const apiFormData = new FormData();
      apiFormData.append("dispalyName", formData.displayName);
      apiFormData.append("tagLine", formData.tagLine);
      apiFormData.append("aboutMe", formData.aboutMe);

      if (formData.languages && formData.languages.length > 0) {
        formData.languages.forEach((lang) => {
          apiFormData.append("language[]", lang);
        });
      }

      if (profileImage instanceof File) {
        apiFormData.append("uploadfile", profileImage);
      } else if (hasExistingProfile && imagePreview && !profileImage) {
        let imagePath = imagePreview;
        if (imagePreview.includes("/uploads/")) {
          const pathIndex = imagePreview.indexOf("/uploads/");
          imagePath = imagePreview.substring(pathIndex + 1);
        }
        apiFormData.append("uploadfile", imagePath);
      } else if (!hasExistingProfile) {
        throw new Error("Profile image is required for new profiles");
      }

      const response = await api.post("/storeProfile", apiFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", response);

      if (response.status === 200 || response.status === 201) {
        setProfileData(formData);
        setShowConfirmation(false);
        setIsEditing(false);
        setHasExistingProfile(true);

        const successMessage = hasExistingProfile
          ? "Profile updated successfully!"
          : "Profile created successfully!";

        message.success(successMessage);
        if (onNext) onNext();
      } else {
        throw new Error(
          `Failed to ${hasExistingProfile ? "update" : "create"} profile`
        );
      }
    } catch (error) {
      console.error("Error storing profile:", error);

      let errorMessage = `Failed to ${
        hasExistingProfile ? "update" : "create"
      } profile. Please try again.`;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 422) {
        errorMessage = "Please check your input data and try again.";
      } else if (error.response?.status === 500) {
        errorMessage =
          "Server error occurred. Please check your data and try again.";
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!token) {
      message.error("Authentication required. Please login again.");
      return;
    }
    storeProfile(submittedData);
  };

  const handleEdit = () => {
    setShowConfirmation(false);
    setIsEditing(true);
  };

  const calculateProgress = () => {
    const fields = ["displayName", "languages", "aboutMe"]; // Removed tagLine from required fields
    const values = isEditing ? form.getFieldsValue(fields) : profileData;
    const filled = fields.filter((field) => {
      const val = values[field];
      return val && (Array.isArray(val) ? val.length > 0 : val.trim() !== "");
    });
    return Math.round((filled.length / fields.length) * 100);
  };

  const toggleEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    form.setFieldsValue(profileData);
    setIsEditing(false);
  };

  // Helper function to get language labels for display
  const getLanguageLabels = (languageValues) => {
    return languageValues.map((value) => {
      const lang = languages.find((l) => l.value === value);
      return lang ? lang.label : value;
    });
  };

  const renderVerificationBadge = () => {
    // Only show badge in freelancer mode (not registration)
    if (isRegistration || !approvalData) return null;

    const isVerified = approvalData.fa_tab_1_app === "1";
    
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
    if (isRegistration || !approvalData || approvalData.fa_tab_1_app !== "1") return null;

    const isFieldVerified = approvalData[fieldKey] === "1";
    
    return (
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ml-2 ${
          isFieldVerified 
            ? 'bg-lime-500 text-white' 
            : 'bg-yellow-400 text-white'
        }`}
        title={isFieldVerified ? "Verified" : "Pending"}
      >
        {isFieldVerified ? <CheckCircleOutlined className="text-xl" /> : <ClockCircleOutlined className="text-xs" />}
      </div>
    );
  };

  // Show loading spinner while fetching profile data
  if (profileFetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg border-0 rounded-xl bg-white">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader />
                <p className="mt-4 text-gray-600">Loading profile data...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-0 rounded-xl bg-white">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900 mr-2">
                  {showConfirmation
                    ? "Confirm Your Profile"
                    : isEditing
                    ? hasExistingProfile
                      ? "Edit Your Profile"
                      : "Create Your Profile"
                    : "Your Profile"}
                </h1>
                {renderVerificationBadge()}
              </div>
              <p className="text-gray-600 mt-1">
                {showConfirmation
                  ? "Review your information before saving"
                  : isEditing
                  ? hasExistingProfile
                    ? "Update your professional details"
                    : "Complete your professional details"
                  : "View and manage your profile"}
              </p>
            </div>
            {!isEditing && !showConfirmation && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={toggleEdit}
                className="flex items-center"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="p-6">
            {showConfirmation ? (
              // Confirmation View
              <div>
                <div className="text-center mb-8">
                  <Avatar
                    size={128}
                    src={imagePreview}
                    icon={!imagePreview && <UserOutlined />}
                    className="shadow-md border-4 bg-gray-200"
                  />
                  <Title level={3}>{submittedData.displayName}</Title>
                  <Text type="secondary">{submittedData.tagLine}</Text>
                </div>

                <Divider orientation="left">
                  <Space>
                    <EyeOutlined className="text-blue-500" />
                    Review Your Information
                  </Space>
                </Divider>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <Text strong>Display Name</Text>
                    <p>{submittedData.displayName}</p>

                    <Text strong className="block mt-4">
                      Languages
                    </Text>
                    <Space wrap className="mt-1">
                      {getLanguageLabels(submittedData.languages).map(
                        (lang) => (
                          <span
                            key={lang}
                            className="bg-white px-3 py-1 rounded-full text-sm shadow-sm border"
                          >
                            {lang}
                          </span>
                        )
                      )}
                    </Space>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <Text strong>Professional Headline</Text>
                    <p>{submittedData.tagLine}</p>

                    <Text strong className="block mt-4">
                      About Me
                    </Text>
                    <p className="whitespace-pre-line mt-2">
                      {submittedData.aboutMe}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <Tooltip title="Your progress in completing the profile details" placement="top">
                    <div className="flex justify-between items-center mb-1">
                      <Text className="text-sm font-medium">Profile Completion</Text>
                      <Text className="text-sm">{calculateProgress()}%</Text>
                    </div>
                  </Tooltip>
                  <Progress
                    percent={calculateProgress()}
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                    showInfo={false}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    onClick={handleEdit}
                    icon={<EditOutlined />}
                    disabled={loading}
                  >
                    Edit Information
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleConfirm}
                    loading={loading}
                    icon={<CheckOutlined />}
                    className="bg-green-600 text-white"
                    disabled={!token}
                  >
                    {loading ? "Saving..." : "Save & Next"}
                  </Button>
                </div>
              </div>
            ) : isEditing ? (
              // Form View
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={profileData}
              >
                {/* Upload Section - Click on image to upload (using antd-img-crop) */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <ImgCrop rotate aspect={1} modalTitle="Crop profile image">
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        onChange={handleUploadChange}
                        beforeUpload={(file) => {
                          // prevent automatic upload; antd-img-crop will show crop dialog and call onChange with the cropped file
                          return false;
                        }}
                        customRequest={({ onSuccess }) => onSuccess?.("ok")}
                        ref={uploadRef}
                      >
                        <div
                          className="w-24 h-24 mx-auto mb-4 cursor-pointer flex items-center justify-center"
                        >
                          {imagePreview ? (
                            <div className="relative">
                              <Avatar
                                size={96}
                                src={imagePreview}
                                className="shadow-sm border-2 hover:opacity-90 transition-opacity"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage();
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                              >
                                <DeleteOutlined className="text-xs" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <Avatar
                                size={96}
                                icon={<UserOutlined />}
                                className="bg-gray-200 hover:bg-gray-300 transition-colors"
                              />
                              <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                <CameraOutlined className="text-xs" />
                              </div>
                            </div>
                          )}
                        </div>
                      </Upload>
                    </ImgCrop>

                    <p className="text-xs text-gray-500 mt-2">
                      Click on image to upload (JPG/PNG/WEBP, Max 10MB)
                      {!hasExistingProfile && (
                        <span className="text-red-500"> (Required)</span>
                      )}
                    </p>

                    {imageRequiredError && (
                      <div className="mt-2 text-sm text-red-600 max-w-xs mx-auto flex items-center">
                        <ExclamationCircleOutlined className="mr-2" />
                        <span>Please upload a profile image to continue.</span>
                      </div>
                    )}

                    {uploadError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md max-w-xs mx-auto">
                        <p className="text-red-600 text-xs font-medium flex items-start">
                          <ExclamationCircleOutlined className="mt-0.5 mr-1 flex-shrink-0" />
                          <span>{uploadError}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    name="displayName"
                    label="Display Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                  >
                    <ValidatedAntdInput
                      prefix={<UserOutlined />}
                      className="h-10 rounded-lg"
                      placeholder="Enter your full name"
                      validationType="name"
                      validationConfig={validationConfigs.name}
                    />
                  </Form.Item>

                  <Form.Item
                    name="languages"
                    label="Languages"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one language",
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => {
                        const optionChildren = (option?.children || "").toString();
                        const optionValue = (option?.value || "").toString();
                        return (
                          optionChildren.toLowerCase().includes(input.toLowerCase()) ||
                          optionValue.toLowerCase().includes(input.toLowerCase())
                        );
                      }}
                      placeholder={
                        languagesLoading
                          ? "Loading languages..."
                          : "Select languages you speak"
                      }
                      size="large"
                      loading={languagesLoading}
                      disabled={languagesLoading}
                      notFoundContent={
                        languagesLoading ? (
                          <Loader />
                        ) : (
                          "No languages found"
                        )
                      }
                    >
                      {languages.map((lang) => (
                        <Option key={lang.id} value={lang.value}>
                          {lang.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item
                  name="tagLine"
                  label="Professional Headline (Optional - Max 150 characters)"
                  extra="Briefly describe your professional expertise and skills"
                >
                  <ValidatedAntdInput
                    prefix={<TagOutlined />}
                    className="h-10 rounded-lg"
                    placeholder="e.g., Senior Software Engineer | React Specialist"
                    validationType="professionalHeadline"
                    validationConfig={validationConfigs.professionalHeadline}
                    maxLength={150}
                    showCount
                  />
                </Form.Item>

                <Form.Item
                  name="aboutMe"
                  label="About Me"
                  rules={[
                    { required: true, message: "Please describe yourself" },
                  ]}
                >
                  <ValidatedAntdTextArea
                    rows={5}
                    className="rounded-lg"
                    placeholder="Tell us about your skills, experience, and what you do..."
                    validationType="description"
                    validationConfig={validationConfigs.description}
                  />
                </Form.Item>

                {/* Progress Bar */}
                <div className="mb-6">
                  <Tooltip title="Your progress in completing the profile details" placement="top">
                    <div className="flex justify-between items-center mb-1">
                      <Text className="text-sm font-medium">Profile Completion</Text>
                      <Text className="text-sm">{calculateProgress()}%</Text>
                    </div>
                  </Tooltip>
                  <Progress
                    percent={calculateProgress()}
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                    showInfo={false}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<EyeOutlined />}
                    className="bg-blue-600 text-white"
                    disabled={languagesLoading}
                  >
                    Review Profile
                  </Button>
                </div>
              </Form>
            ) : (
              // Final View Mode (after confirmation or existing profile)
              <div>
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <Avatar
                      size={128}
                      src={imagePreview}
                      icon={!imagePreview && <UserOutlined />}
                      className="shadow-md border-4 bg-gray-200"
                    />
                    {renderFieldVerificationBadge('fa_img_app')}
                  </div>
                  <Title level={3}>{profileData.displayName}</Title>
                  <Text type="secondary">{profileData.tagLine}</Text>
                </div>

                <Divider orientation="left">
                  <Space>
                    <ContactsOutlined className="text-blue-500" />
                    Personal Information
                  </Space>
                </Divider>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Text strong>Display Name</Text>
                      {renderFieldVerificationBadge('fa_display_name_app')}
                    </div>
                    <p>{profileData.displayName}</p>

                    <div className="flex items-center mt-4">
                      <Text strong>Languages</Text>
                      {renderFieldVerificationBadge('fa_lang_app')}
                    </div>
                    <Space wrap className="mt-1">
                      {getLanguageLabels(profileData.languages).map((lang) => (
                        <span
                          key={lang}
                          className="bg-white px-3 py-1 rounded-full text-sm shadow-sm border"
                        >
                          {lang}
                        </span>
                      ))}
                    </Space>

                    <div className="flex items-center mt-4">
                      <Text strong>Professional Headline</Text>
                      {renderFieldVerificationBadge('fa_headline_app')}
                    </div>
                    <p>{profileData.tagLine}</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Text strong>About Me</Text>
                      {renderFieldVerificationBadge('fa_desc_app')}
                    </div>
                    <p className="whitespace-pre-line mt-2">
                      {profileData.aboutMe}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <Tooltip title="Your progress in completing the profile details" placement="top">
                    <div className="flex justify-between items-center mb-1">
                      <Text className="text-sm font-medium">Profile Completion</Text>
                      <Text className="text-sm">{calculateProgress()}%</Text>
                    </div>
                  </Tooltip>
                  <Progress
                    percent={calculateProgress()}
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                    showInfo={false}
                  />
                </div>

                {onNext && (
                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      onClick={() => {
                        if (isRegistration && showCompletionModal) {
                          showCompletionModal(
                            "Profile Completed!",
                            "Your profile information has been saved successfully.",
                            "Continue to Services"
                          );
                        }
                        onNext();
                      }}
                      className="bg-blue-600 text-white"
                    >
                      Save & Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
