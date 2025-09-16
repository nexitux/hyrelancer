"use client";
import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Card, Row, Col, Divider,
  Upload, Collapse, Typography, Space, message, Modal, Table, Checkbox, Tag,Spin
} from 'antd';
import {
  PlusOutlined, CloseOutlined, EditOutlined, CheckOutlined,
  PlayCircleOutlined, FileOutlined, ArrowLeftOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import api from '../../../../config/api'; // Adjust path to your api config
import Loader from "../../../../components/Loader/page";

const { Panel } = Collapse;
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
  const [portfolios, setPortfolios] = useState([
    { id: 1, title: '', description: '', videoUrls: [''], images: [], fpo_id: null }
  ]);
  const [skills, setSkills] = useState([]);
  const [skillsWithIds, setSkillsWithIds] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkills, setEditingSkills] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [skillsData, setSkillsData] = useState(null);
  const [activeKeys, setActiveKeys] = useState(['portfolio-0']);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [addAnotherPortfolio, setAddAnotherPortfolio] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [videoData, setVideoData] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [deletedVideos, setDeletedVideos] = useState([]);
  const [skillSeparateMode, setSkillSeparateMode] = useState(false);
  const [newPortfolioModalVisible, setNewPortfolioModalVisible] = useState(false);
  const [skillReadyMessage, setSkillReadyMessage] = useState(false);

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

  // Ensure the form is shown automatically when there are NO portfolio items
  useEffect(() => {
    if (Array.isArray(portfolioData)) {
      if (portfolioData.length === 0) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    }
  }, [portfolioData]);

  useEffect(() => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkillReadyMessage(true);
    } else {
      setSkillReadyMessage(false);
    }
  }, [newSkill, skills]);

  const fetchPortfolioData = async ({ reloadSkills = true } = {}) => {
    try {
      setLoading(true);
      const response = await api.get('/getPortfolio');

      if (reloadSkills) {
        if (response.data.fe_skills?.length > 0) {
          const skillNames = response.data.fe_skills.map(skill => skill.fs_skill);
          setSkills(skillNames);
          setSkillsData(skillNames);
          setSkillsWithIds(response.data.fe_skills.map(s => ({ name: s.fs_skill, id: s.fs_id })));
        } else {
          setSkills([]);
          setSkillsWithIds([]);
          setSkillsData(null);
        }
      }

      if (response.data.fe_porfolio?.length > 0) {
        if (response.data.fe_po_img) {
          setVideoData(response.data.fe_po_img.filter(img => img.fpoi_type === 'Video'));
        }

        const portfolioItems = response.data.fe_porfolio.map(item => {
          const associatedVideos = response.data.fe_po_img?.filter(img => img.fpoi_fpo_id === item.fpo_id && img.fpoi_type === 'Video') || [];
          const videoUrls = associatedVideos.length > 0 ? associatedVideos.map(video => video.fpoi_path) : [''];
          const associatedImages = response.data.fe_po_img?.filter(img => img.fpoi_fpo_id === item.fpo_id && img.fpoi_type === 'Image') || [];
          const images = [];
          const mainImageUrl = getFullImageUrl(item.fpo_img);
          if (mainImageUrl) {
            images.push({
              uid: generateUID(), name: 'main_portfolio_image', status: 'done', url: mainImageUrl, isMain: true,
              originalPath: item.fpo_img, dbStored: true
            });
          }
          associatedImages.forEach((img, index) => {
            const fullImageUrl = getFullImageUrl(img.fpoi_path);
            if (fullImageUrl) {
              images.push({
                uid: generateUID(), name: `additional_image_${index}`, status: 'done', url: fullImageUrl, isMain: false,
                originalPath: img.fpoi_path, fpoi_id: img.fpoi_id, dbStored: true
              });
            }
          });

          return {
            id: item.fpo_id,
            fpo_id: item.fpo_id,
            title: item.fpo_title,
            description: item.fpo_desc,
            videoUrls,
            videoIds: associatedVideos.map(video => video.fpoi_id),
            images,
          };
        });

        setPortfolios(portfolioItems);
        setPortfolioData(portfolioItems);
        if (reloadSkills) {
          setSkillSeparateMode(false);
        }
      } else {
        // explicitly set empty array so useEffect above will show the form
        setPortfolioData([]);
        if (reloadSkills) setSkillSeparateMode(false);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      message.error('Failed to load portfolio data');
      // still set empty so user can add new item
      setPortfolioData([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFormForNewPortfolio = (clearSkills = false) => {
    const newPortfolio = { id: Date.now(), title: '', description: '', videoUrls: [''], images: [], fpo_id: null };
    setPortfolios([newPortfolio]);
    setActiveKeys(['portfolio-0']);
    setFormErrors({});
    setDeletedImages([]);
    setDeletedVideos([]);
    form.resetFields();
    form.setFieldsValue({ addAnotherPortfolio: false });
    if (clearSkills) {
      setSkills([]);
      setSkillsWithIds([]);
      setSkillsData(null);
      setSkillSeparateMode(false);
    } else {
      setSkillSeparateMode(false);
    }

    message.success('Form has been reset for your next portfolio item!');
  };

  const saveSingleSkillToServer = async (skillValue) => {
    if (!skillValue || !skillValue.trim()) return;
    try {
      const fd = new FormData();
      fd.append('skillinput[]', skillValue.trim());
      fd.append('skill_only', '1');
      const res = await api.post('/storeFePortfolio', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.message) message.success(res.data.message);
      await fetchPortfolioData();
    } catch (err) {
      console.error('Error saving single skill:', err);
      message.error(err.response?.data?.message || 'Failed to save skill');
    }
  };

  const addSkill = async () => {
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

    setSkills(prev => [...prev, trimmed]);
    setNewSkill('');
    setSkillReadyMessage(false);

    await saveSingleSkillToServer(trimmed);
  };

  const updatePortfolio = (portfolioId, field, value) => {
    setPortfolios(portfolios.map(p => p.id === portfolioId ? { ...p, [field]: value } : p));
    const newErrors = { ...formErrors };
    Object.keys(newErrors).forEach(k => {
      if (k.includes(field) || k === field) delete newErrors[k];
    });
    setFormErrors(newErrors);
  };

  const addVideoField = (portfolioId) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    const newVideoUrls = [...portfolio.videoUrls, ''];
    updatePortfolio(portfolioId, 'videoUrls', newVideoUrls);
  };

  const removeVideoField = (portfolioId, index) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio.videoUrls.length > 1) {
      const newVideoUrls = portfolio.videoUrls.filter((_, i) => i !== index);
      updatePortfolio(portfolioId, 'videoUrls', newVideoUrls);
    } else {
      message.warning('You need at least one video URL field');
    }
  };

  const updateVideoUrl = (portfolioId, index, value) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    const newVideoUrls = portfolio.videoUrls.map((url, i) => i === index ? value : url);
    updatePortfolio(portfolioId, 'videoUrls', newVideoUrls);
  };

  const handleImageUpload = (portfolioId, { fileList }) => {
    const processedImages = fileList.map(file => {
      if (file.originFileObj && !file.url && !file.preview) {
        const reader = new FileReader();
        reader.onload = (e) => { file.preview = e.target.result; setPortfolios(prev => [...prev]); };
        reader.readAsDataURL(file.originFileObj);
        return { ...file, uid: file.uid || generateUID(), file: file.originFileObj, status: 'done', isNew: true };
      }
      if (file.originFileObj) {
        return { ...file, uid: file.uid || generateUID(), file: file.originFileObj, isNew: true };
      }
      return { ...file, uid: file.uid || generateUID(), dbStored: file.dbStored || false };
    });

    updatePortfolio(portfolioId, 'images', processedImages);
    const newErrors = { ...formErrors };
    delete newErrors.fpo_img_file;
    portfolios.forEach((_, index) => {
      const portfolioKey = `portfolio_${index}`;
      if (newErrors[portfolioKey]?.images) {
        delete newErrors[portfolioKey].images;
        if (Object.keys(newErrors[portfolioKey]).length === 0) delete newErrors[portfolioKey];
      }
    });
    setFormErrors(newErrors);
  };

  const removeImage = (portfolioId, index) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    const imageToRemove = portfolio.images[index];
    if (imageToRemove?.fpoi_id) setDeletedImages(prev => [...prev, imageToRemove.fpoi_id]);
    const newImages = portfolio.images.filter((_, i) => i !== index);
    updatePortfolio(portfolioId, 'images', newImages);
    message.success('Image removed successfully!');
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
    } else {
      console.error('Unable to generate preview for file:', file);
      message.error('Unable to preview this image');
    }
  };

  const calculateProgress = () => {
    const skillProgress = (skills.length > 0 && !addAnotherPortfolio) ? 1 : 0;
    const filledFields = portfolios.reduce((acc, portfolio) => {
      const fields = [
        portfolio.title,
        portfolio.description,
        ...portfolio.videoUrls.filter(url => url.trim() !== ''),
        ...portfolio.images
      ].filter(field => field && field.toString().trim() !== '');
      return acc + fields.length;
    }, 0) + skillProgress;

    const totalFields = portfolios.reduce((acc, portfolio) => acc + 2 + portfolio.videoUrls.length + portfolio.images.length, 0) + (skills.length > 0 && !addAnotherPortfolio ? 1 : 0);
    return Math.round((filledFields / (totalFields || 1)) * 100);
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!addAnotherPortfolio && skills.length === 0) {
      isValid = false;
      errors.skills = ['Please add at least one skill'];
    }

    portfolios.forEach((portfolio, index) => {
      const portfolioErrors = {};
      if (!portfolio.title?.trim()) {
        isValid = false;
        portfolioErrors.title = ['Please add a title'];
        errors.title = ['Please enter a title.'];
      }
      if (!portfolio.description?.trim()) {
        isValid = false;
        portfolioErrors.description = ['Please add a description'];
        errors.description = ['Please enter a description.'];
      }
      if (!portfolio.images?.length) {
        isValid = false;
        portfolioErrors.images = ['Please upload at least one image'];
        errors.fpo_img_file = ['An image is required.'];
      }
      const emptyVideoUrls = portfolio.videoUrls.filter(url => url && url.trim() === '');
      if (emptyVideoUrls.length > 0 && portfolio.videoUrls.some(url => url.trim() !== '')) {
        isValid = false;
        portfolioErrors.videoUrls = ['Please fill all video URLs or remove empty fields'];
      }
      if (Object.keys(portfolioErrors).length > 0) errors[`portfolio_${index}`] = portfolioErrors;
    });

    return { isValid, errors };
  };

  const prepareImageForSubmission = (image, isFirstImage = false) => {
    if (image.originFileObj) return image.originFileObj;
    else if (image.file && image.isNew) return image.file;
    else if (image instanceof File) return image;
    if (image.originalPath && image.dbStored) return image.originalPath;
    if (image.url) {
      if (image.url.includes('/uploads/')) return image.url.substring(image.url.indexOf('/uploads/'));
      return image.url;
    }
    return null;
  };

  const handleInitialSubmit = async (event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const { isValid, errors } = validateForm();
    if (!isValid) {
      setFormErrors(errors);
      const errorMessages = [];
      if (errors.title) errorMessages.push(errors.title[0]);
      if (errors.description) errorMessages.push(errors.description[0]);
      if (errors.fpo_img_file) errorMessages.push(errors.fpo_img_file[0]);
      if (errors.skills) errorMessages.push(errors.skills[0]);

      const mainError = errorMessages[0] || 'Please fix the validation errors';
      const additionalCount = errorMessages.length - 1;
      message.error(additionalCount > 0 ? `${mainError} (and ${additionalCount} more error${additionalCount > 1 ? 's' : ''})` : mainError);
      setActiveKeys(portfolios.map((_, index) => `portfolio-${index}`));
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const formData = new FormData();

      if (skills.length > 0) {
        skills.forEach(skill => formData.append('skillinput[]', skill));
      }

      portfolios.forEach((portfolio, index) => {
        formData.append('title', portfolio.title.trim());
        formData.append('description', portfolio.description.trim());
        const validUrls = (portfolio.videoUrls || []).filter(url => url && url.trim());
        validUrls.forEach(url => formData.append('video-upload[]', url.trim()));

        if (portfolio.images?.length > 0) {
          let mainImageSet = false;
          portfolio.images.forEach((image, imgIndex) => {
            const preparedImage = prepareImageForSubmission(image, imgIndex === 0);
            if (preparedImage) {
              if (!mainImageSet) { formData.append('fpo_img_file', preparedImage); mainImageSet = true; }
              else { formData.append('addImageField[]', preparedImage); }
            }
          });
          if (!mainImageSet) throw new Error('No valid main image found.');
        }
      });

      if (addAnotherPortfolio) {
        formData.append('add_more', 'add_more');
      } else {
        formData.append('portfolio_time', String(Date.now()));
      }

      const response = await api.post('/storeFePortfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.message) message.success(response.data.message);

      if (addAnotherPortfolio) {
        message.success('Portfolio saved! Start adding the next item.');
        await fetchPortfolioData({ reloadSkills: false });
        setNewPortfolioModalVisible(true);
        setDeletedImages([]); setDeletedVideos([]); setSkillSeparateMode(true);
      } else {
        message.success('Portfolio saved successfully!');
        await fetchPortfolioData();

        Modal.confirm({
          title: 'Portfolio Saved!',
          content: 'Would you like to add another portfolio item now?',
          okText: 'Yes, add another',
          cancelText: 'No, continue',
          okType: 'primary',
          centered: true,
          onOk: () => {
            handleAddMorePortfolio();
          },
          onCancel: () => {
            setIsEditing(false);
            setSkillSeparateMode(false);

            if (isRegistration && showCompletionModal) {
              showCompletionModal(
                'Portfolio Completed!',
                'Your portfolio and skills have been saved successfully.',
                'Continue to Next Step'
              );
            }

            if (onNext) onNext();
          },
        });
      }
      setAddAnotherPortfolio(false);
    } catch (error) {
      console.error('Error saving portfolio:', error);
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const mappedErrors = {};
          Object.keys(responseData.errors).forEach(key => {
            const errorMessage = Array.isArray(responseData.errors[key]) ? responseData.errors[key][0] : responseData.errors[key];
            if (key === 'title') mappedErrors.title = [errorMessage];
            else if (key === 'description') mappedErrors.description = [errorMessage];
            else if (key === 'fpo_img_file') mappedErrors.fpo_img_file = [errorMessage];
            else if (key === 'skillinput' || key === 'skillinput.*') mappedErrors.skills = [errorMessage];
            else mappedErrors[key] = Array.isArray(responseData.errors[key]) ? responseData.errors[key] : [responseData.errors[key]];
          });
          setFormErrors(mappedErrors);
          const errorKeys = Object.keys(responseData.errors);
          let errorMessage = Array.isArray(responseData.errors[errorKeys[0]]) ? responseData.errors[errorKeys[0]][0] : responseData.errors[errorKeys[0]];
          if (errorKeys.length > 1) errorMessage += ` (and ${errorKeys.length - 1} more error${errorKeys.length > 2 ? 's' : ''})`;
          message.error(responseData.message || errorMessage);
          setActiveKeys(portfolios.map((_, index) => `portfolio-${index}`));
        } else if (responseData.message) {
          message.error(responseData.message);
        } else {
          message.error('Failed to save portfolio. Please try again.');
        }
      } else {
        message.error(error.message || 'Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSkills = () => setEditingSkills(true);

  const handleSaveSkills = async () => {
    if (!skills.length) {
      message.warning('No skills to save');
      return;
    }
    setEditingSkills(false);
    try {
      const fd = new FormData();
      skills.forEach(s => fd.append('skillinput[]', s));
      fd.append('skill_only', '1');
      const res = await api.post('/storeFePortfolio', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.message) message.success(res.data.message);
      await fetchPortfolioData();
      setSkillSeparateMode(false);
    } catch (err) {
      console.error('Error saving skills:', err);
      message.error(err.response?.data?.message || 'Failed to save skills');
    }
  };

  const handleAddMorePortfolio = () => {
    const newPortfolio = { id: Date.now(), title: '', description: '', videoUrls: [''], images: [], fpo_id: null };
    setPortfolios([newPortfolio]);
    setNewSkill('');
    setActiveKeys(['portfolio-0']);

    // CLEAR skills so the add-portfolio form shows an empty skills section
    setSkills([]);
    setSkillsWithIds([]);
    setSkillsData(null);

    setSkillSeparateMode(true);
    setAddAnotherPortfolio(true);
    setFormErrors({});
    setDeletedImages([]);
    setDeletedVideos([]);
    setIsEditing(true);
    setEditingSkills(false);
    form.resetFields();
    form.setFieldsValue({ addAnotherPortfolio: false, title: '', description: '' });
    message.info('Form ready for new portfolio item! Skills shown in separate panel (optional).');
  };


  // NEW: Edit in Form from preview/table
  const handleEditFromPreview = (record) => {
    setIsEditing(true);
    setEditingSkills(true); // enable skill edits when opening form from preview
    setSkillSeparateMode(false); // show skills inline

    const portfolioObj = {
      id: record.fpo_id || record.id || Date.now(),
      fpo_id: record.fpo_id || record.id || null,
      title: record.fpo_title || record.title || record.fpo_title || '',
      description: record.fpo_desc || record.description || '',
      videoUrls: record.videoUrls?.length ? [...record.videoUrls] : (record.videoUrls ? [...record.videoUrls] : ['']),
      images: (record.images || []).map(img => ({ ...img, uid: img.uid || generateUID(), dbStored: true, url: img.url || img.originalPath || img })),
    };

    setPortfolios([portfolioObj]);
    setActiveKeys(['portfolio-0']);
    form.setFieldsValue({ title: portfolioObj.title, description: portfolioObj.description });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // NEW: Cancel editing form and go back to preview/list
  const handleCancelEditForm = () => {
    setIsEditing(false);
    setEditingSkills(false);
    setSkillSeparateMode(false);
    setFormErrors({});
    form.resetFields();
    if (portfolioData && portfolioData.length) setPortfolios(portfolioData);
    else setPortfolios([{ id: Date.now(), title: '', description: '', videoUrls: [''], images: [], fpo_id: null }]);
    fetchPortfolioData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditModal = (portfolio, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const full = portfolios.find(p => p.id === portfolio.id) || portfolio;
    const editingData = {
      ...full,
      videoUrls: full.videoUrls?.length > 0 ? [...full.videoUrls] : [''],
      images: full.images ? full.images.map(img => (Array.isArray(img) ? img[0] : img)).map(img => ({
        ...img, uid: img.uid || generateUID(), url: img.url, originalPath: img.originalPath, dbStored: true, status: 'done'
      })) : [],
      originalVideoIds: full.videoIds || [],
      videoIds: [...(full.videoIds || [])]
    };
    setEditingPortfolio(editingData);
    setDeletedImages([]); setDeletedVideos([]); setEditModalVisible(true);
  };

  const handleEditSave = async () => {
    if (!editingPortfolio) return;
    if (!editingPortfolio.title?.trim()) { message.error('Title is required'); return; }
    if (!editingPortfolio.description?.trim()) { message.error('Description is required'); return; }
    if (!editingPortfolio.images?.length) { message.error('At least one image is required'); return; }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('fpo_id', safeBtoa(String(editingPortfolio.fpo_id)));
      formData.append('title', editingPortfolio.title.trim());
      formData.append('description', editingPortfolio.description.trim());

      if (editingPortfolio.images?.length > 0) {
        const mainImage = editingPortfolio.images[0];
        if (mainImage.originFileObj) formData.append('fpo_img_file', mainImage.originFileObj);
        else if (mainImage.dbStored) formData.append('fpo_img_file', mainImage.originalPath || mainImage.url);
        if (editingPortfolio.images.length > 1) {
          for (let i = 1; i < editingPortfolio.images.length; i++) {
            const image = editingPortfolio.images[i];
            if (image.originFileObj) formData.append('addImageField[]', image.originFileObj);
            else if (image.dbStored) formData.append('addImageField[]', image.originalPath || image.url);
          }
        }
      }

      if (editingPortfolio.videoUrls && editingPortfolio.videoUrls.length > 0) {
        const videoUrls = Array.isArray(editingPortfolio.videoUrls) ? editingPortfolio.videoUrls : [];
        const rawVideoIds = Array.isArray(editingPortfolio.videoIds) ? editingPortfolio.videoIds : [];
        const videoIdsSanitized = rawVideoIds.map(v => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; });
        while (videoIdsSanitized.length < videoUrls.length) videoIdsSanitized.push(0);
        videoUrls.forEach((rawUrl, idx) => {
          const url = rawUrl ? String(rawUrl).trim() : '';
          if (!url) return;
          formData.append('video-upload[]', url);
          const fpoiIdForThis = videoIdsSanitized[idx] || 0;
          formData.append('fpoi_id[]', String(fpoiIdForThis));
          formData.append('fpoi_type[]', 'Video');
        });
      }

      if (deletedImages.length > 0) deletedImages.forEach(id => formData.append('deleted_images[]', id));
      formData.append('_method', 'PUT');
      const response = await api.post('/updatePortfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success(response.data.message || 'Portfolio updated successfully!');
      await fetchPortfolioData();
      setEditModalVisible(false); setEditingPortfolio(null); setDeletedImages([]); setDeletedVideos([]);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      if (error.response?.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const errorKeys = Object.keys(responseData.errors);
          let errorMessage = Array.isArray(responseData.errors[errorKeys[0]]) ? responseData.errors[errorKeys[0]][0] : responseData.errors[errorKeys[0]];
          if (errorKeys.length > 1) errorMessage += ` (and ${errorKeys.length - 1} more error${errorKeys.length > 2 ? 's' : ''})`;
          message.error(responseData.message || errorMessage);
        } else if (responseData.message) message.error(responseData.message);
        else message.error('Failed to update portfolio. Please try again.');
      } else message.error('Network error. Please check your connection and try again.');
    } finally { setIsSubmitting(false); }
  };

  const addVideoFieldEdit = () => setEditingPortfolio(prev => ({ ...prev, videoUrls: [...(prev.videoUrls || ['']), ''] }));
  const removeVideoFieldEdit = (index) => setEditingPortfolio(prev => {
    const videoUrls = prev.videoUrls || [''];
    if (videoUrls.length > 1) {
      const newVideoUrls = videoUrls.filter((_, i) => i !== index);
      return { ...prev, videoUrls: newVideoUrls.length > 0 ? newVideoUrls : [''] };
    }
    return prev;
  });
  const updateVideoUrlEdit = (index, value) => setEditingPortfolio(prev => { const newVideoUrls = [...(prev.videoUrls || [''])]; newVideoUrls[index] = value; return { ...prev, videoUrls: newVideoUrls }; });

  const handleEditImageUpload = ({ fileList }) => {
    const processedImages = fileList.map(file => {
      if (file.originFileObj && !file.url && !file.preview) {
        const reader = new FileReader();
        reader.onload = (e) => { file.preview = e.target.result; setEditingPortfolio(prev => ({ ...prev })); };
        reader.readAsDataURL(file.originFileObj);
        return { ...file, uid: file.uid || generateUID(), file: file.originFileObj, status: 'done', isNew: true };
      }
      if (file.originFileObj) return { ...file, uid: file.uid || generateUID(), file: file.originFileObj, isNew: true, status: 'done' };
      return { ...file, uid: file.uid || generateUID(), dbStored: file.dbStored !== undefined ? file.dbStored : true, url: file.url, originalPath: file.originalPath, status: 'done' };
    });
    setEditingPortfolio(prev => ({ ...prev, images: processedImages }));
  };

  const removeEditImage = (file) => {
    const imageToRemove = (editingPortfolio.images || []).find(img => img.uid === file.uid);
    if (imageToRemove) {
      if (imageToRemove.fpoi_id) { setDeletedImages(prev => [...prev, imageToRemove.fpoi_id]); message.success('Image marked for deletion'); }
      else message.success('Image removed');
      const newImages = (editingPortfolio.images || []).filter(img => img.uid !== file.uid);
      setEditingPortfolio(prev => ({ ...prev, images: newImages }));
    }
    return false;
  };

  const uploadButton = (<div className="flex flex-col items-center"><PlusOutlined /><div className="mt-2">Upload</div></div>);

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: text => <span className="font-medium">{text}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description', render: text => <div className="max-w-xs truncate">{text}</div> },
    { title: 'Videos', dataIndex: 'videoUrls', key: 'videoUrls', render: urls => <span>{urls?.filter(url => url && url.trim()).length || 0}</span> },
    { title: 'Images', dataIndex: 'images', key: 'images', render: images => <span>{images?.length || 0}</span> },
    {
      title: 'Action', key: 'action', render: (_, record) => (
        <Space>
          <Button type="primary" icon={<EditOutlined />} onClick={e => openEditModal(record, e)} className="bg-blue-600 hover:bg-blue-700">Edit (Modal)</Button>
        </Space>
      )
    }
  ];


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg rounded-lg border-0">
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <Title level={3} className="!mb-1 text-gray-900">Portfolio Setup</Title>
                <Text type="secondary">{isEditing ? "Add your skills and portfolio items to showcase your work" : "View and manage your portfolio items"}</Text>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-16 flex justify-center items-center"><Loader /></div>
            ) : (
              <>
                {/** Show the form when editing OR when portfolioData is an empty array */}
                {(isEditing || (Array.isArray(portfolioData) && portfolioData.length === 0)) ? (
                  <Spin spinning={isSubmitting} tip="Saving your portfolio...">
                    <Form form={form} layout="vertical" onFinish={handleInitialSubmit} initialValues={{ addAnotherPortfolio: false }} className="space-y-6">

                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <Text className="font-medium text-gray-700">Portfolio Completion</Text>
                          <Text className="font-bold">{calculateProgress()}%</Text>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${calculateProgress()}%` }} />
                        </div>
                      </div>

                      {skillSeparateMode && (
                        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Input
                                placeholder="Add a new skill (e.g., React, UI Design)"
                                value={newSkill}
                                onChange={e => setNewSkill(e.target.value)}
                                onPressEnter={addSkill}
                                onClick={() => {
                                  if (newSkill && newSkill.trim().length > 0 && !skills.includes(newSkill.trim())) {
                                    setSkillReadyMessage(true);
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={addSkill}
                              >
                                Add
                              </Button>
                            </div>
                            {skillReadyMessage && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                <Text type="secondary" className="text-sm">
                                  Skill ready to add! Click the "Add" button or press Enter to include this skill.
                                </Text>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill, index) => (
                                <Tag
                                  key={index}
                                  color="blue"
                                  className="mb-2 flex items-center"
                                  closable
                                  onClose={e => {
                                    e.preventDefault();
                                    setSkills(skills.filter((_, i) => i !== index));
                                  }}
                                >
                                  {skill}
                                </Tag>
                              ))}
                            </div>
                            {skills.length === 0 && (
                              <div className="mt-3 p-3 border border-dashed rounded text-sm text-gray-600">
                                No skills yet — add one .
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!skillSeparateMode && (
                        <div className="mb-8">
                          <div className="mb-2">
                            <Text className="text-xs font-bold">
                              Enter the Skill <span className="text-red-500 text-xs font-normal">(this field is mandatory for final submission)</span>
                            </Text>
                          </div>
                          {formErrors.skills && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                              <Text type="danger">
                                {Array.isArray(formErrors.skills) ? formErrors.skills.join(', ') : formErrors.skills}
                              </Text>
                            </div>
                          )}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Input
                                placeholder="Add a new skill (e.g., React, UI Design)"
                                value={newSkill}
                                onChange={e => setNewSkill(e.target.value)}
                                onPressEnter={addSkill}
                                onClick={() => {
                                  if (newSkill && newSkill.trim().length > 0 && !skills.includes(newSkill.trim())) {
                                    setSkillReadyMessage(true);
                                  }
                                }}
                                className="flex-1"
                              />
                              <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={addSkill}
                              >
                                Add
                              </Button>
                              {editingSkills && skillsData && (
                                <Button type="default" icon={<CheckOutlined />} onClick={handleSaveSkills}>
                                  Save Skills
                                </Button>
                              )}
                            </div>
                            {skillReadyMessage && (
                              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                <Text type="secondary" className="text-sm">
                                  Skill ready to add! Click the "Add" button or press Enter to include this skill.
                                </Text>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {skills.map((skill, index) => (
                              <Tag
                                key={index}
                                color="blue"
                                className="mb-2 flex items-center"
                                closable
                                onClose={e => {
                                  e.preventDefault();
                                  setSkills(skills.filter((_, i) => i !== index));
                                }}
                              >
                                {skill}
                              </Tag>
                            ))}
                          </div>
                          {skills.length === 0 && (
                            <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
                              <Text type="secondary">No skills added yet. Add your first skill above.</Text>
                            </div>
                          )}
                        </div>
                      )}

                      <Collapse
                        activeKey={activeKeys}
                        onChange={setActiveKeys}
                        expandIcon={({ isActive }) => <EditOutlined rotate={isActive ? 90 : 0} />}
                        className="mb-6"
                        size="large"
                      >
                        {portfolios.map((portfolio, index) => {
                          const portfolioErrors = formErrors[`portfolio_${index}`] || {};
                          return (
                            <Panel
                              header={
                                <span className="font-medium">
                                  <FileOutlined className="mr-2" />
                                  Portfolio Item {index + 1}
                                  {portfolio.title && `: ${portfolio.title}`}
                                </span>
                              }
                              key={`portfolio-${index}`}
                              className="bg-white rounded-lg"
                            >
                              <div className="p-4 border border-gray-200 rounded-lg">
                                <Row gutter={16}>
                                  <Col xs={24}>
                                    <Form.Item
                                      label={
                                        <span className="font-medium">
                                          Title <span className="text-red-500">*</span>
                                        </span>
                                      }
                                      validateStatus={formErrors.title || portfolioErrors.title ? 'error' : ''}
                                      help={
                                        formErrors.title
                                          ? formErrors.title.join(', ')
                                          : portfolioErrors.title?.join(', ')
                                      }
                                    >
                                      <Input
                                        placeholder="Project title..."
                                        value={portfolio.title}
                                        onChange={e => updatePortfolio(portfolio.id, 'title', e.target.value)}
                                        size="large"
                                        status={formErrors.title || portfolioErrors.title ? 'error' : ''}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24}>
                                    <Form.Item
                                      label={
                                        <span className="font-medium">
                                          Description <span className="text-red-500">*</span>
                                        </span>
                                      }
                                      validateStatus={formErrors.description || portfolioErrors.description ? 'error' : ''}
                                      help={
                                        formErrors.description
                                          ? formErrors.description.join(', ')
                                          : portfolioErrors.description?.join(', ')
                                      }
                                    >
                                      <TextArea
                                        placeholder="Project description..."
                                        rows={4}
                                        value={portfolio.description}
                                        onChange={e => updatePortfolio(portfolio.id, 'description', e.target.value)}
                                        status={formErrors.description || portfolioErrors.description ? 'error' : ''}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                                <Divider />
                                <Row gutter={24}>
                                  <Col xs={24} md={12}>
                                    <div className="mb-4">
                                      <div className="flex justify-between items-center mb-3">
                                        <Text strong>Video URLs</Text>
                                        <Button
                                          type="dashed"
                                          icon={<PlusOutlined />}
                                          onClick={() => addVideoField(portfolio.id)}
                                          size="small"
                                        >
                                          Add Video URL
                                        </Button>
                                      </div>
                                      {portfolioErrors.videoUrls && (
                                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                                          <Text type="danger">{portfolioErrors.videoUrls.join(', ')}</Text>
                                        </div>
                                      )}
                                      <Space direction="vertical" className="w-full">
                                        {portfolio.videoUrls.map((url, urlIndex) => (
                                          <div key={urlIndex} className="flex items-center gap-2 w-full">
                                            <Input
                                              placeholder="https://example.com/video (optional)"
                                              value={url}
                                              onChange={e => updateVideoUrl(portfolio.id, urlIndex, e.target.value)}
                                              className="flex-1"
                                              size="large"
                                              prefix={<PlayCircleOutlined className="text-gray-400" />}
                                            />
                                            {portfolio.videoUrls.length > 1 && (
                                              <Button
                                                type="text"
                                                danger
                                                icon={<CloseOutlined />}
                                                onClick={() => removeVideoField(portfolio.id, urlIndex)}
                                                className="w-10 h-10 flex items-center justify-center"
                                              />
                                            )}
                                          </div>
                                        ))}
                                      </Space>
                                    </div>
                                  </Col>
                                  <Col xs={24} md={12}>
                                    <div className="mb-4">
                                      <div className="flex justify-between items-center mb-3">
                                        <Text strong>
                                          Project Images <span className="text-red-500">*</span>
                                        </Text>
                                        <Tag color={portfolio.images.length > 0 ? "green" : "red"}>
                                          {portfolio.images.length} uploaded
                                        </Tag>
                                      </div>
                                      {(formErrors.fpo_img_file || portfolioErrors.images) && (
                                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded">
                                          <Text type="danger">
                                            {formErrors.fpo_img_file?.join(', ') || portfolioErrors.images?.join(', ')}
                                          </Text>
                                        </div>
                                      )}
                                      <div className="border border-dashed border-gray-300 rounded-lg p-4">
                                        <Upload
                                          listType="picture-card"
                                          fileList={portfolio.images}
                                          onChange={info => handleImageUpload(portfolio.id, info)}
                                          onPreview={handlePreview}
                                          onRemove={file => {
                                            const index = portfolio.images.findIndex(img => img.uid === file.uid);
                                            if (index > -1) removeImage(portfolio.id, index);
                                            return false;
                                          }}
                                          beforeUpload={() => false}
                                          multiple
                                          accept="image/*"
                                          showUploadList={{
                                            showRemoveIcon: true,
                                            removeIcon: <CloseOutlined />
                                          }}
                                        >
                                          {portfolio.images.length >= 8 ? null : uploadButton}
                                        </Upload>
                                        {portfolio.images.length === 0 && (
                                          <div className="text-center mt-2">
                                            <Text type="danger">At least one image is required</Text>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                              </div>
                            </Panel>
                          );
                        })}
                      </Collapse>

                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Checkbox checked={addAnotherPortfolio} onChange={e => {
                          const checked = e.target.checked;
                          setAddAnotherPortfolio(checked);
                          if (checked) {
                            // Clear previously added skills when switching into "add another" mode
                            setSkills([]);
                            setSkillsWithIds([]);
                            setSkillsData(null);

                            message.info('After saving, the form will be reset for your next portfolio item (skills optional).', 3);
                            setSkillSeparateMode(true);
                          } else {
                            message.info('Final submission — skills are required for this submission.');
                            setSkillSeparateMode(false);
                          }
                        }}>

                          <span className="font-medium">Add another portfolio item after saving</span>
                        </Checkbox>
                        <Text type="secondary" className="text-sm">Check to add more portfolio items after submitting.</Text>
                      </div>

                      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <div>
                          <Button size="large" onClick={handleCancelEditForm} disabled={isSubmitting}>Cancel</Button>
                        </div>
                        <div className="flex gap-2">
                          {/* Always show back button if onBack is provided */}
                          {onBack && (
                            <Button size="large" icon={<ArrowLeftOutlined />} onClick={onBack} disabled={isSubmitting}>
                              Back
                            </Button>
                          )}
                          <Button 
                            type="primary" 
                            size="large" 
                            icon={isSubmitting ? <LoadingOutlined /> : <CheckOutlined />} 
                            onClick={e => { e.preventDefault(); e.stopPropagation(); handleInitialSubmit(e); }} 
                            loading={isSubmitting} 
                            disabled={isSubmitting} 
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {addAnotherPortfolio ? 'Save & Add Another' : 'Save Portfolio'}
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </Spin>
                ) : (
                  <div>
                    {skillsData && (
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <Title level={4}>Your Skills</Title>
                          {!editingSkills ? (
                            <Button type="default" icon={<EditOutlined />} onClick={handleEditSkills}>Edit Skills</Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input placeholder="Add a new skill" value={newSkill} onChange={e => setNewSkill(e.target.value)} onPressEnter={addSkill} />
                              <Button type="primary" icon={<PlusOutlined />} onClick={addSkill}>Add</Button>
                              <Button type="default" icon={<CheckOutlined />} onClick={handleSaveSkills}>Save</Button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(skillsData || skills).map((skill, index) => (
                            <Tag key={index} color="blue" className="mb-2">{skill}</Tag>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <Title level={4}>Portfolio Items</Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMorePortfolio} className="bg-blue-600 hover:bg-blue-700">Add More Portfolio</Button>
                      </div>
                      <Table dataSource={portfolioData || []} columns={columns} pagination={false} rowKey="id" locale={{ emptyText: 'No portfolio items yet — add one using the form above.' }} />
                    </div>
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                      {/* Always show back button if onBack is provided */}
                      {onBack && (
                        <Button size="large" icon={<ArrowLeftOutlined />} onClick={onBack}>
                          Back
                        </Button>
                      )}
                      {onNext && (
                        <Button 
                          type="primary" 
                          size="large" 
                          onClick={onNext} 
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        <Modal open={previewVisible} title="Image Preview" footer={null} onCancel={() => setPreviewVisible(false)} width={800} centered>
          <img alt="Preview" className="w-full max-h-[70vh] object-contain" src={previewImage} onError={() => { console.error('Preview image failed to load:', previewImage); message.error('Failed to load image preview'); }} />
        </Modal>

        <Modal title="Edit Portfolio Item" open={editModalVisible} onCancel={() => { setEditModalVisible(false); setEditingPortfolio(null); setDeletedImages([]); setDeletedVideos([]); }} footer={[
          <Button key="cancel" onClick={() => { setEditModalVisible(false); setEditingPortfolio(null); setDeletedImages([]); setDeletedVideos([]); }}>Cancel</Button>,
          <Button key="save" type="primary" onClick={handleEditSave} loading={isSubmitting} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        ]} width={900} destroyOnClose>
          {editingPortfolio && (
            <div className="mt-4">
              <Form layout="vertical" className="space-y-4">
                <Form.Item label="Title" required validateStatus={!editingPortfolio.title ? 'error' : ''} help={!editingPortfolio.title ? 'Title is required' : ''}>
                  <Input value={editingPortfolio.title} onChange={e => setEditingPortfolio(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter portfolio title" size="large" />
                </Form.Item>
                <Form.Item label="Description" required validateStatus={!editingPortfolio.description ? 'error' : ''} help={!editingPortfolio.description ? 'Description is required' : ''}>
                  <TextArea rows={4} value={editingPortfolio.description} onChange={e => setEditingPortfolio(prev => ({ ...prev, description: e.target.value }))} placeholder="Enter portfolio description" />
                </Form.Item>
                <Divider />
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Video URLs">
                      <div className="mb-2"><Button type="dashed" icon={<PlusOutlined />} onClick={addVideoFieldEdit} size="small">Add Video URL</Button></div>
                      <Space direction="vertical" className="w-full">
                        {(editingPortfolio.videoUrls || ['']).map((url, index) => (
                          <div key={`video-${index}-${url}`} className="flex items-center gap-2 w-full">
                            <Input placeholder="https://example.com/video (optional)" value={url} onChange={e => updateVideoUrlEdit(index, e.target.value)} prefix={<PlayCircleOutlined className="text-gray-400" />} />
                            {(editingPortfolio.videoUrls || ['']).length > 1 && (<Button type="text" danger icon={<CloseOutlined />} onClick={() => removeVideoFieldEdit(index)} className="w-10 h-10 flex items-center justify-center" />)}
                          </div>
                        ))}
                      </Space>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Project Images" required validateStatus={!editingPortfolio.images || editingPortfolio.images.length === 0 ? 'error' : ''} help={!editingPortfolio.images || editingPortfolio.images.length === 0 ? 'At least one image is required' : ''}>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4">
                        <Upload listType="picture-card" fileList={editingPortfolio.images || []} onChange={handleEditImageUpload} onPreview={handlePreview} onRemove={removeEditImage} beforeUpload={() => false} multiple accept="image/*" showUploadList={{ showRemoveIcon: true, removeIcon: <CloseOutlined /> }}>
                          {(editingPortfolio.images || []).length >= 8 ? null : uploadButton}
                        </Upload>
                        <div className="text-center mt-2"><Text type="secondary" className="text-xs">You can add new images or remove existing ones. Changes will be saved when you click "Save Changes".</Text></div>
                        {(!editingPortfolio.images || editingPortfolio.images.length === 0) && (<div className="text-center mt-2"><Text type="danger">At least one image is required</Text></div>)}
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
        </Modal>

        <Modal title="Add New Portfolio Item" open={newPortfolioModalVisible} onCancel={() => { setNewPortfolioModalVisible(false); fetchPortfolioData(); }} footer={[
          <Button key="cancel" onClick={() => { setNewPortfolioModalVisible(false); fetchPortfolioData(); }}>Cancel</Button>,
          // NOTE: preserve skills by default. pass true to resetFormForNewPortfolio to clear skills.
          <Button key="start" type="primary" onClick={() => { setNewPortfolioModalVisible(false); resetFormForNewPortfolio(true); }} className="bg-blue-600 hover:bg-blue-700">Start New Portfolio</Button>

        ]} width={500}>
          <div className="p-4">
            <Text>Your portfolio has been saved successfully!</Text><br />
            <Text>Would you like to add another portfolio item now?</Text>
          </div>
        </Modal>
      </div>
    </div>
  );
}