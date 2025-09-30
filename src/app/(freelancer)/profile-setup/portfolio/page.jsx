"use client";
import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Card, Row, Col, Divider,
  Upload, Modal, Typography, Space, message, Tag, Spin, Progress, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, CheckOutlined,
  PlayCircleOutlined, FileOutlined, DeleteOutlined,
  LoadingOutlined, EyeOutlined, SettingOutlined
} from '@ant-design/icons';
import api from '../../../../config/api'; // Adjust path to your api config
import Loader from "../../../../components/Loader/page";

const { TextArea } = Input;
const { Title, Text } = Typography;

const safeBtoa = (value) => {
  try {
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(unescape(encodeURIComponent(String(value))));
    }
    return Buffer.from(String(value), 'utf8').toString('base64');
  } catch (error) {
    console.error('Base64 encoding error:', error);
    return String(value);
  }
};

export default function PortfolioForm({ onNext, onBack, isRegistration = false, showCompletionModal }) {
  const [form] = Form.useForm();
  const [portfolios, setPortfolios] = useState([]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Modal states
  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [portfolioModalVisible, setPortfolioModalVisible] = useState(false);
  const [editPortfolioModalVisible, setEditPortfolioModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  // Current portfolio being edited/added
  const [currentPortfolio, setCurrentPortfolio] = useState({
    title: '',
    description: '',
    videoUrls: [''],
    images: []
  });

  const generateUID = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 10000)}`;

  const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '' || imagePath === '0') return null;
    if (imagePath.startsWith('http')) return imagePath;
    let cleanImagePath = imagePath.split('--')[0];
    let baseURL = api.defaults.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    baseURL = baseURL.replace(/\/+$/, '');
    if (baseURL.endsWith('/api')) baseURL = baseURL.slice(0, -4);
    cleanImagePath = cleanImagePath.replace(/^\/+/, '');
    return `${baseURL}/${cleanImagePath}`;
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/getPortfolio');

      if (response.data.fe_skills?.length > 0) {
        const skillNames = response.data.fe_skills.map(skill => skill.fs_skill);
        setSkills(skillNames);
      }

      if (response.data.fe_porfolio?.length > 0) {
        const portfolioItems = response.data.fe_porfolio.map(item => {
          const associatedImages = response.data.fe_po_img?.filter(img => img.fpoi_fpo_id === item.fpo_id && img.fpoi_type === 'Image') || [];
          const images = [];
          
          const mainImageUrl = getFullImageUrl(item.fpo_img);
          if (mainImageUrl) {
            images.push({
              uid: generateUID(), 
              name: 'main_portfolio_image', 
              status: 'done', 
              url: mainImageUrl, 
              isMain: true,
              originalPath: item.fpo_img, 
              dbStored: true
            });
          }

          associatedImages.forEach((img, index) => {
            const fullImageUrl = getFullImageUrl(img.fpoi_path);
            if (fullImageUrl) {
              images.push({
                uid: generateUID(), 
                name: `additional_image_${index}`, 
                status: 'done', 
                url: fullImageUrl, 
                isMain: false,
                originalPath: img.fpoi_path, 
                fpoi_id: img.fpoi_id, 
                dbStored: true
              });
            }
          });

          return {
            id: item.fpo_id,
            fpo_id: item.fpo_id,
            title: item.fpo_title,
            description: item.fpo_desc,
            images,
            date: item.created_at || '24/09/2025'
          };
        });

        setPortfolios(portfolioItems);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      message.error('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      message.warning('Please enter a valid skill!');
      return;
    }
    if (skills.includes(trimmed)) {
      message.warning('This skill already exists!');
      setNewSkill('');
      return;
    }

    try {
      const fd = new FormData();
      fd.append('skillinput', trimmed);
      const res = await api.post('/storeFeSkill', fd, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      if (res.data?.message) message.success(res.data.message);
      setSkills(prev => [...prev, trimmed]);
      setNewSkill('');
      setSkillModalVisible(false);
      await fetchPortfolioData();
    } catch (err) {
      console.error('Error saving skill:', err);
      message.error(err.response?.data?.message || 'Failed to save skill');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      // Find the skill ID from the API response
      const response = await api.get('/getPortfolio');
      const skillData = response.data.fe_skills?.find(skill => skill.fs_skill === skillToRemove);
      
      if (skillData) {
        const encodedId = safeBtoa(String(skillData.fs_id));
        const res = await api.get(`/deleteItem/1/${encodedId}`);
        
        if (res.data?.message) message.success(res.data.message);
        setSkills(prev => prev.filter(skill => skill !== skillToRemove));
        await fetchPortfolioData();
      } else {
        message.error('Skill not found');
      }
    } catch (err) {
      console.error('Error removing skill:', err);
      message.error('Failed to remove skill');
    }
  };

  const handleImageUpload = ({ fileList }) => {
    const processedImages = fileList.map(file => {
      if (file.originFileObj && !file.url && !file.preview) {
        const reader = new FileReader();
        reader.onload = (e) => { 
          file.preview = e.target.result; 
          setCurrentPortfolio(prev => ({ ...prev })); 
        };
        reader.readAsDataURL(file.originFileObj);
        return { ...file, uid: file.uid || generateUID(), file: file.originFileObj, status: 'done', isNew: true };
      }
      if (file.originFileObj) {
        return { ...file, uid: file.uid || generateUID(), file: file.originFileObj, isNew: true };
      }
      return { ...file, uid: file.uid || generateUID(), dbStored: file.dbStored || false };
    });

    setCurrentPortfolio(prev => ({ ...prev, images: processedImages }));
  };

  const handlePreview = (file) => {
    let previewUrl = '';
    if (file.url) previewUrl = file.url.startsWith('http') ? file.url : getFullImageUrl(file.url) || file.url;
    else if (file.preview) previewUrl = file.preview;
    else if (file.thumbUrl) previewUrl = file.thumbUrl;
    else if (file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => { setPreviewImage(e.target.result); setPreviewVisible(true); };
      reader.readAsDataURL(file.originFileObj);
      return;
    } else if (file.response?.url) previewUrl = file.response.url;

    if (previewUrl) {
      setPreviewImage(previewUrl);
      setPreviewVisible(true);
    }
  };

  const removeImage = (file) => {
    setCurrentPortfolio(prev => ({
      ...prev,
      images: prev.images.filter(img => img.uid !== file.uid)
    }));
  };

  const addVideoField = () => {
    setCurrentPortfolio(prev => ({
      ...prev,
      videoUrls: [...prev.videoUrls, '']
    }));
  };

  const removeVideoField = (index) => {
    setCurrentPortfolio(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, i) => i !== index)
    }));
  };

  const updateVideoUrl = (index, value) => {
    setCurrentPortfolio(prev => {
      const newVideoUrls = [...prev.videoUrls];
      newVideoUrls[index] = value;
      return { ...prev, videoUrls: newVideoUrls };
    });
  };

  const validatePortfolio = () => {
    const errors = {};
    
    if (!currentPortfolio.title?.trim()) {
      errors.title = 'Title is required';
    }
    if (!currentPortfolio.description?.trim()) {
      errors.description = 'Description is required';
    }
    if (!currentPortfolio.images?.length) {
      errors.images = 'At least one image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePortfolio = async () => {
    if (!validatePortfolio()) {
      message.error('Please fix the errors before saving');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add portfolio data
      formData.append('title', currentPortfolio.title.trim());
      formData.append('description', currentPortfolio.description.trim());

      // Add video URLs
      const validUrls = currentPortfolio.videoUrls.filter(url => url && url.trim());
      validUrls.forEach(url => formData.append('video-upload[]', url.trim()));

      // Add images
      if (currentPortfolio.images?.length > 0) {
        currentPortfolio.images.forEach((image, index) => {
          if (image.originFileObj) {
            formData.append(index === 0 ? 'fpo_img_file' : 'addImageField[]', image.originFileObj);
          }
        });
      }

      const response = await api.post('/storeFePortfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.message) message.success(response.data.message);
      setPortfolioModalVisible(false);
      setCurrentPortfolio({ title: '', description: '', videoUrls: [''], images: [] });
      await fetchPortfolioData();

      if (isRegistration && showCompletionModal) {
        showCompletionModal(
          'Portfolio Completed!',
          'Your portfolio and skills have been saved successfully.',
          'Continue to Next Step'
        );
      }

    } catch (error) {
      console.error('Error saving portfolio:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to save portfolio');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPortfolio = (portfolio) => {
    // Fetch video URLs for this portfolio
    const fetchVideoUrls = async () => {
      try {
        const response = await api.get('/getPortfolio');
        const portfolioData = response.data.fe_porfolio?.find(item => item.fpo_id === portfolio.fpo_id);
        const videoUrls = response.data.fe_po_img?.filter(img => 
          img.fpoi_fpo_id === portfolio.fpo_id && img.fpoi_type === 'Video'
        ).map(video => video.fpoi_path) || [];
        
        setCurrentPortfolio({
          ...portfolio,
          videoUrls: videoUrls.length > 0 ? videoUrls : ['']
        });
        setEditPortfolioModalVisible(true);
      } catch (error) {
        console.error('Error fetching video URLs:', error);
        setCurrentPortfolio({
          ...portfolio,
          videoUrls: ['']
        });
        setEditPortfolioModalVisible(true);
      }
    };
    
    fetchVideoUrls();
  };

  const handleUpdatePortfolio = async () => {
    if (!validatePortfolio()) {
      message.error('Please fix the errors before updating');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fpo_id', safeBtoa(String(currentPortfolio.fpo_id)));
      formData.append('title', currentPortfolio.title.trim());
      formData.append('description', currentPortfolio.description.trim());
      formData.append('_method', 'PUT');

      // Handle images
      if (currentPortfolio.images?.length > 0) {
        currentPortfolio.images.forEach((image, index) => {
          if (image.originFileObj) {
            formData.append(index === 0 ? 'fpo_img_file' : 'addImageField[]', image.originFileObj);
          } else if (image.dbStored) {
            formData.append(index === 0 ? 'fpo_img_file' : 'addImageField[]', image.originalPath || image.url);
          }
        });
      }

      const response = await api.post('/updatePortfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      message.success(response.data.message || 'Portfolio updated successfully!');
      setEditPortfolioModalVisible(false);
      setCurrentPortfolio({ title: '', description: '', videoUrls: [''], images: [] });
      await fetchPortfolioData();

    } catch (error) {
      console.error('Error updating portfolio:', error);
      message.error('Failed to update portfolio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    console.log('Delete portfolio called with ID:', portfolioId);
    
    if (!portfolioId) {
      message.error('Portfolio ID is missing');
      return;
    }
    
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <DeleteOutlined className="text-red-500 text-lg" />
          <span className="text-lg font-semibold">Delete Portfolio Item</span>
        </div>
      ),
      content: (
        <div className="py-4">
          <p className="text-gray-700 mb-2">Are you sure you want to delete this portfolio item?</p>
          <p className="text-sm text-gray-500">This action cannot be undone and will permanently remove the portfolio item and all its associated images.</p>
        </div>
      ),
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      width: 400,
      centered: true,
      onOk: async () => {
        try {
          console.log('User confirmed deletion for portfolio ID:', portfolioId);
          console.log('Attempting to delete portfolio with ID:', portfolioId);
          
          const encodedId = safeBtoa(String(portfolioId));
          console.log('Encoded ID:', encodedId);
          console.log('API Base URL:', api.defaults.baseURL);
          console.log('Full delete URL:', `${api.defaults.baseURL}/deleteItem/8/${encodedId}`);
          
          // Show loading message
          const hideLoading = message.loading('Deleting portfolio item...', 0);
          
          const response = await api.get(`/deleteItem/8/${encodedId}`);
          console.log('Delete response:', response);
          
          hideLoading();
          
          if (response.data?.message) {
            message.success(response.data.message);
          } else {
            message.success('Portfolio deleted successfully!');
          }
          
          // Refresh the portfolio data
          await fetchPortfolioData();
          
        } catch (error) {
          console.error('Error deleting portfolio:', error);
          console.error('Error response:', error.response);
          console.error('Error status:', error.response?.status);
          console.error('Error data:', error.response?.data);
          
          if (error.response?.data?.message) {
            message.error(error.response.data.message);
          } else if (error.response?.status === 404) {
            message.error('Portfolio not found');
          } else if (error.response?.status === 500) {
            message.error('Server error occurred');
          } else if (error.response?.status === 401) {
            message.error('Authentication required');
          } else if (error.response?.status === 403) {
            message.error('Permission denied');
          } else {
            message.error(`Failed to delete portfolio: ${error.message}`);
          }
        }
      },
      onCancel() {
        console.log('User cancelled portfolio deletion');
      }
    });
  };

  const handleDeleteImage = async (imageId, portfolioId) => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-2">
          <DeleteOutlined className="text-red-500 text-lg" />
          <span className="text-lg font-semibold">Delete Image</span>
        </div>
      ),
      content: (
        <div className="py-4">
          <p className="text-gray-700 mb-2">Are you sure you want to delete this image?</p>
          <p className="text-sm text-gray-500">This action cannot be undone and will permanently remove the image from your portfolio.</p>
        </div>
      ),
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      width: 400,
      centered: true,
      onOk: async () => {
        try {
          console.log('User confirmed image deletion for ID:', imageId);
          
          const encodedId = safeBtoa(String(imageId));
          console.log('Encoded image ID:', encodedId);
          
          // Show loading message
          const hideLoading = message.loading('Deleting image...', 0);
          
          const response = await api.get(`/deleteItem/9/${encodedId}`);
          console.log('Delete image response:', response);
          
          hideLoading();
          message.success(response.data.message || 'Image deleted successfully!');
          await fetchPortfolioData();
        } catch (error) {
          console.error('Error deleting image:', error);
          message.error('Failed to delete image');
        }
      },
      onCancel() {
        console.log('User cancelled image deletion');
      }
    });
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg h-20 sm:h-24">
      <PlusOutlined className="text-lg sm:text-xl" />
      <div className="mt-1 sm:mt-2 text-gray-600 text-xs sm:text-sm text-center">Upload Image</div>
    </div>
  );

  // Calculate progress for portfolio completion
  const calculateProgress = () => {
    let progress = 0;
    let totalItems = 2; // Skills and Portfolio items
    
    if (skills.length > 0) {
      progress += 1;
    }
    
    if (portfolios.length > 0) {
      progress += 1;
    }
    
    return Math.round((progress / totalItems) * 100);
  };

  const hasData = portfolios.length > 0 || skills.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-sm rounded-lg border border-gray-200">
          <div className="bg-white p-3 sm:p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="w-full sm:w-auto">
                <Title level={2} className="!mb-1 sm:!mb-2 !text-gray-800 text-lg sm:text-xl md:text-2xl">Portfolio Management</Title>
                <Text className="text-gray-600 text-sm sm:text-base">Manage your portfolio items and skills</Text>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {loading ? (
              <div className="py-16 flex justify-center items-center">
                <Loader />
              </div>
            ) : !hasData ? (
              <div className="text-center py-8 sm:py-12 md:py-16 lg:py-20 px-4">
                <div className="mb-6 sm:mb-8">
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileOutlined className="text-2xl sm:text-3xl md:text-4xl text-gray-400" />
                  </div>
                </div>
                <Title level={3} className="!mb-2 text-gray-700 text-lg sm:text-xl md:text-2xl">No Portfolio & Skills Added</Title>
                <Text type="secondary" className="mb-6 sm:mb-8 block text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                  Start building your professional portfolio by adding your skills and portfolio items
                </Text>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
                  <Button 
                    type="default" 
                    size="large" 
                    icon={<SettingOutlined />}
                    onClick={() => setSkillModalVisible(true)}
                    className="border-gray-300 text-gray-700 hover:border-gray-400 h-10 sm:h-12 px-4 sm:px-6 md:px-8 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Manage Skills</span>
                    <span className="sm:hidden">Skills</span>
                  </Button>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />}
                    onClick={() => setPortfolioModalVisible(true)}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600 h-10 sm:h-12 px-4 sm:px-6 md:px-8 text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Add Portfolio</span>
                    <span className="sm:hidden">Portfolio</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* Skills Section */}
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <Title level={4} className="!mb-0 text-gray-800 text-base sm:text-lg">Skills</Title>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setSkillModalVisible(true)}
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full sm:w-auto h-9 sm:h-10 text-sm"
                    >
                      <span className="hidden sm:inline">Add Skill</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                  
                  {skills.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-blue-800 truncate pr-1 sm:pr-2 flex-1">
                              {skill}
                            </span>
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveSkill(skill)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 p-0.5 sm:p-1 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center flex-shrink-0"
                              title="Delete skill"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="mb-3">
                        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <SettingOutlined className="text-lg sm:text-xl text-gray-400" />
                        </div>
                      </div>
                      <Text type="secondary" className="text-gray-500 text-sm sm:text-base">No skills added yet</Text>
                      <div className="mt-3">
                        <Button 
                          type="dashed" 
                          size="small"
                          onClick={() => setSkillModalVisible(true)}
                          className="text-gray-600 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          Add your first skill
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Portfolio Section */}
                <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg border border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <Title level={4} className="!mb-0 text-gray-800 text-base sm:text-lg">Portfolio Items</Title>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setPortfolioModalVisible(true)}
                      className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full sm:w-auto h-9 sm:h-10 text-sm"
                    >
                      <span className="hidden sm:inline">Add Portfolio</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {portfolios.map((portfolio) => (
                      <Card
                        key={portfolio.id}
                        className="group border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                        bodyStyle={{ padding: 0 }}
                        style={{ cursor: 'default' }}
                        cover={
                          portfolio.images?.length > 0 ? (
                            <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                              <img
                                alt={portfolio.title}
                                src={portfolio.images[0]?.url || portfolio.images[0]?.preview}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1 sm:gap-2 z-10">
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  className="bg-white/90 hover:bg-white text-gray-600 h-7 w-7 sm:h-8 sm:w-8 p-0 flex items-center justify-center"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditPortfolio(portfolio);
                                  }}
                                  title="Edit Portfolio"
                                />
                                <Button
                                  type="text"
                                  icon={<DeleteOutlined />}
                                  className="bg-white/90 hover:bg-white text-red-500 h-7 w-7 sm:h-8 sm:w-8 p-0 flex items-center justify-center"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Delete button clicked for portfolio:', portfolio.fpo_id);
                                    handleDeletePortfolio(portfolio.fpo_id);
                                  }}
                                  title="Delete Portfolio"
                                />
                              </div>
                              {portfolio.images?.length > 1 && (
                                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/70 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs">
                                  +{portfolio.images.length - 1} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center">
                              <FileOutlined className="text-3xl sm:text-4xl text-gray-400" />
                            </div>
                          )
                        }
                      >
                        <div className="flex flex-col flex-1 justify-between h-full p-3 sm:p-4 md:p-5">
                          <div>
                            <Title level={5} className="!mb-1 sm:!mb-2 text-gray-900 font-semibold line-clamp-1 text-sm sm:text-base">{portfolio.title}</Title>
                            <Text className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 block line-clamp-2 sm:line-clamp-3">
                              {portfolio.description}
                            </Text>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500 pt-2 sm:pt-3 border-t border-gray-100 mt-auto">
                            <span className="truncate text-xs">{portfolio.date}</span>
                            <span className="text-xs">{portfolio.images?.length || 0} images</span>
                          </div>
                          <div className="flex justify-between items-center gap-1 sm:gap-2 mt-3 sm:mt-4">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditPortfolio(portfolio);
                              }}
                              className="text-gray-600 hover:text-gray-800 flex-1 text-xs sm:text-sm h-7 sm:h-8 p-1"
                            >
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            {/* <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Delete button clicked for portfolio:', portfolio.fpo_id);
                                handleDeletePortfolio(portfolio.fpo_id);
                              }}
                              className="text-red-500 hover:text-red-700 flex-1 text-xs sm:text-sm h-7 sm:h-8 p-1"
                            >
                              <span className="hidden sm:inline">Delete</span>
                            </Button> */}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {portfolios.length === 0 && (
                    <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <FileOutlined className="text-3xl sm:text-4xl text-gray-400 mb-3 sm:mb-4" />
                      <Text type="secondary" className="text-gray-500 text-sm sm:text-base">No portfolio items yet. Add your first project!</Text>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-6">
              <Tooltip title="Your progress in completing the portfolio and skills" placement="top">
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-sm font-medium">Portfolio & Skills Completion</Text>
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

            {/* Action Buttons for Registration Flow */}
            {(onBack || onNext) && hasData && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3 sm:gap-0">
                {onBack && (
                  <Button size="large" onClick={onBack} className="border-gray-300 text-gray-700 w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base">
                    Back
                  </Button>
                )}
                {onNext && (
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={onNext}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base"
                  >
                    Continue
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Add Skill Modal */}
        <Modal
          title="Manage Skills"
          open={skillModalVisible}
          onCancel={() => {
            setSkillModalVisible(false);
            setNewSkill('');
          }}
          width="90%"
          style={{ maxWidth: '500px', top: 20 }}
          footer={[
            <Button key="cancel" onClick={() => setSkillModalVisible(false)} className="border-gray-300 text-gray-700 w-full sm:w-auto h-10 sm:h-9 text-sm">
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full sm:w-auto h-10 sm:h-9 text-sm"
            >
              Add Skill
            </Button>
          ]}
        >
          <div className="py-2 sm:py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add New Skill</label>
              <Input
                placeholder="Enter skill name (e.g., React, JavaScript, UI Design)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onPressEnter={handleAddSkill}
                size="large"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            {skills.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Current Skills</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-1.5 sm:p-2 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-800 truncate pr-1 flex-1">
                          {skill}
                        </span>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-4 w-4 flex items-center justify-center flex-shrink-0"
                          title="Delete skill"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Add Portfolio Modal */}
        <Modal
          title="Add Portfolio Item"
          open={portfolioModalVisible}
          onCancel={() => {
            setPortfolioModalVisible(false);
            setCurrentPortfolio({ title: '', description: '', videoUrls: [''], images: [] });
            setFormErrors({});
          }}
          width="95%"
          style={{ maxWidth: '800px', top: 10 }}
          footer={[
            <Button key="cancel" onClick={() => setPortfolioModalVisible(false)} className="border-gray-300 text-gray-700 w-full sm:w-auto h-10 sm:h-9 text-sm">
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={isSubmitting}
              onClick={handleSavePortfolio}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full sm:w-auto h-10 sm:h-9 text-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Portfolio'}
            </Button>
          ]}
        >
          <div className="py-2 sm:py-4 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <Input
                placeholder="Project title"
                value={currentPortfolio.title}
                onChange={(e) => setCurrentPortfolio(prev => ({ ...prev, title: e.target.value }))}
                status={formErrors.title ? 'error' : ''}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              {formErrors.title && <Text type="danger" className="text-xs sm:text-sm">{formErrors.title}</Text>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <TextArea
                placeholder="Project description"
                rows={3}
                value={currentPortfolio.description}
                onChange={(e) => setCurrentPortfolio(prev => ({ ...prev, description: e.target.value }))}
                status={formErrors.description ? 'error' : ''}
                className="text-sm sm:text-base"
              />
              {formErrors.description && <Text type="danger" className="text-xs sm:text-sm">{formErrors.description}</Text>}
            </div>

            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                <label className="block text-sm font-medium text-gray-700">Video URLs (Optional)</label>
                <Button type="dashed" icon={<PlusOutlined />} size="small" onClick={addVideoField} className="h-8 text-xs">
                  Add URL
                </Button>
              </div>
              <Space direction="vertical" className="w-full">
                {currentPortfolio.videoUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="https://example.com/video"
                      value={url}
                      onChange={(e) => updateVideoUrl(index, e.target.value)}
                      prefix={<PlayCircleOutlined className="text-gray-400" />}
                      className="h-9 sm:h-10 text-sm"
                    />
                    {currentPortfolio.videoUrls.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeVideoField(index)}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      />
                    )}
                  </div>
                ))}
              </Space>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Images *</label>
              {formErrors.images && <Text type="danger" className="text-xs sm:text-sm block mb-2">{formErrors.images}</Text>}
              <div className="upload-container">
                <Upload
                  listType="picture-card"
                  fileList={currentPortfolio.images}
                  onChange={handleImageUpload}
                  onPreview={handlePreview}
                  beforeUpload={() => false}
                  multiple
                  accept="image/*"
                  className="upload-list-inline"
                >
                  {currentPortfolio.images.length >= 8 ? null : uploadButton}
                </Upload>
              </div>
            </div>
          </div>
        </Modal>

        {/* Edit Portfolio Modal */}
        <Modal
          title="Edit Portfolio Item"
          open={editPortfolioModalVisible}
          onCancel={() => {
            setEditPortfolioModalVisible(false);
            setCurrentPortfolio({ title: '', description: '', videoUrls: [''], images: [] });
            setFormErrors({});
          }}
          width="95%"
          style={{ maxWidth: '800px', top: 10 }}
          footer={[
            <Button key="cancel" onClick={() => setEditPortfolioModalVisible(false)} className="border-gray-300 text-gray-700 w-full sm:w-auto h-10 sm:h-9 text-sm">
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={isSubmitting}
              onClick={handleUpdatePortfolio}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 w-full sm:w-auto h-10 sm:h-9 text-sm"
            >
              {isSubmitting ? 'Updating...' : 'Update Portfolio'}
            </Button>
          ]}
        >
          <div className="py-2 sm:py-4 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <Input
                placeholder="Project title"
                value={currentPortfolio.title}
                onChange={(e) => setCurrentPortfolio(prev => ({ ...prev, title: e.target.value }))}
                status={formErrors.title ? 'error' : ''}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              {formErrors.title && <Text type="danger" className="text-xs sm:text-sm">{formErrors.title}</Text>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <TextArea
                placeholder="Project description"
                rows={3}
                value={currentPortfolio.description}
                onChange={(e) => setCurrentPortfolio(prev => ({ ...prev, description: e.target.value }))}
                status={formErrors.description ? 'error' : ''}
                className="text-sm sm:text-base"
              />
              {formErrors.description && <Text type="danger" className="text-xs sm:text-sm">{formErrors.description}</Text>}
            </div>

            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                <label className="block text-sm font-medium text-gray-700">Video URLs (Optional)</label>
                <Button type="dashed" icon={<PlusOutlined />} size="small" onClick={addVideoField} className="h-8 text-xs">
                  Add URL
                </Button>
              </div>
              <Space direction="vertical" className="w-full">
                {currentPortfolio.videoUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="https://example.com/video"
                      value={url}
                      onChange={(e) => updateVideoUrl(index, e.target.value)}
                      prefix={<PlayCircleOutlined className="text-gray-400" />}
                      className="h-9 sm:h-10 text-sm"
                    />
                    {currentPortfolio.videoUrls.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeVideoField(index)}
                        className="h-9 w-9 p-0 flex items-center justify-center"
                      />
                    )}
                  </div>
                ))}
              </Space>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Images *</label>
              {formErrors.images && <Text type="danger" className="text-xs sm:text-sm block mb-2">{formErrors.images}</Text>}
              <div className="upload-container">
                <Upload
                  listType="picture-card"
                  fileList={currentPortfolio.images}
                  onChange={handleImageUpload}
                  onPreview={handlePreview}
                  beforeUpload={() => false}
                  multiple
                  accept="image/*"
                  onRemove={(file) => {
                    if (file.fpoi_id && file.dbStored) {
                      handleDeleteImage(file.fpoi_id, currentPortfolio.id);
                      return false;
                    }
                    return true;
                  }}
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false,
                  }}
                  className="upload-list-inline"
                >
                  {currentPortfolio.images.length >= 8 ? null : uploadButton}
                </Upload>
              </div>
            </div>
          </div>
        </Modal>

        {/* Image Preview Modal */}
        <Modal 
          open={previewVisible} 
          title="Image Preview" 
          footer={null} 
          onCancel={() => setPreviewVisible(false)}
          width="95%"
          style={{ maxWidth: '800px', top: 20 }}
          centered
        >
          <img alt="Preview" className="w-full max-h-[60vh] sm:max-h-[70vh] object-contain" src={previewImage} />
        </Modal>
      </div>
    </div>
  );
}