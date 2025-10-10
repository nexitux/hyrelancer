"use client";
import { useState, useEffect } from "react";
import {
  Form, Input, Select, Button, Upload, Progress, message, Card,
  Row, Col, Divider, Table, Tag, Space, Typography, Descriptions, Modal,
  Spin, Image, Popconfirm, Tooltip, Alert, Checkbox
} from "antd";
import {
  PlusOutlined, CloseOutlined, GlobalOutlined, TagOutlined,
  UploadOutlined, EditOutlined, CheckOutlined, IdcardOutlined,
  ClockCircleOutlined, DollarOutlined, BankOutlined, EnvironmentOutlined,
  DeleteOutlined, InfoCircleOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import api from "../../../../config/api";
import Loader from "../../../../components/Loader/page";
import { sanitizeInput, validationConfigs } from "@/utils/inputValidation";
import { ValidatedAntdInput, ValidatedAntdTextArea } from "../../../../components/ValidatedAntdInput";

const { Option } = Select;
const { Text, Title } = Typography;

const ServiceTab = ({ onNext, onBack, canDelete = false, isRegistration = false, showCompletionModal }) => {
  const [form] = Form.useForm();
  const [categorySuggestionForm] = Form.useForm();
  const [serviceSuggestionForm] = Form.useForm(); 
  const [serviceTypes, setServiceTypes] = useState([]);                                                   
  const [allServices, setAllServices] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [citiesByState, setCitiesByState] = useState({});
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [serviceData, setServiceData] = useState(null);
  const [statesList, setStatesList] = useState([]);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "", type: "error" });
  const [fetchingData, setFetchingData] = useState(true);
  const [existingFileUrl, setExistingFileUrl] = useState(null);
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [isIdProofDeleted, setIsIdProofDeleted] = useState(false);
  const [isRemote, setIsRemote] = useState(false);
  const [isIdProofApproved, setIsIdProofApproved] = useState(false);
  const [approvalData, setApprovalData] = useState(null);

  // State for service table - grouped by serviceType
  const [serviceTableData, setServiceTableData] = useState([]);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedService, setSelectedService] = useState("");

  // State for area table - grouped by state
  const [areaTableData, setAreaTableData] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  // State for suggestions - separate modals and tables
  const [categorySuggestionModal, setCategorySuggestionModal] = useState({
    isOpen: false,
    serviceTypeId: null
  });
  const [serviceSuggestionModal, setServiceSuggestionModal] = useState({
    isOpen: false,
    serviceTypeId: null
  });

  // Separate suggestion tables
  const [categorySuggestionTableData, setCategorySuggestionTableData] = useState([]);
  const [serviceSuggestionTableData, setServiceSuggestionTableData] = useState([]);
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [existingIdProofId, setExistingIdProofId] = useState(null);

  // Fetch services and states on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Consolidated initial data fetching
  const fetchInitialData = async () => {
    try {
      setFetchingData(true);
      await Promise.all([
        fetchServicesList(),
        fetchStateList(),
        fetchExistingServices()
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setErrorModal({
        isOpen: true,
        message: "Failed to load data. Please try again.",
        type: "error"
      });
    } finally {
      setFetchingData(false);
    }
  };

  // Fetch services and categories from API
  const fetchServicesList = async () => {
    try {
      const response = await api.get("/getCategorylist");
      if (response.data) {
        if (response.data.sc_list) {
          setServiceTypes(response.data.sc_list);
        }
        if (response.data.se_list) {
          setAllServices(response.data.se_list);
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  };

  // Fetch states and cities from API
  const fetchStateList = async () => {
    try {
      const response = await api.get("/getStatelist");
      if (response.data) {
        if (response.data.state) {
          setStatesList(response.data.state);
        }
        if (response.data.city) {
          setAllCities(response.data.city);

          // Pre-organize cities by state for better performance
          const citiesMap = {};
          response.data.city.forEach(city => {
            if (!citiesMap[city.cit_state_id]) {
              citiesMap[city.cit_state_id] = [];
            }
            citiesMap[city.cit_state_id].push(city);
          });
          setCitiesByState(citiesMap);
        }
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      throw error;
    }
  };

  // Get cities for a specific state
  const getCitiesForState = (stateId) => {
    return citiesByState[stateId] || [];
  };

  // Fetch existing services for the user
  const fetchExistingServices = async () => {
    try {
      const response = await api.get("/getService");
      console.log('Full API response:', response.data);
      if (response.data) {
        setServiceData(response.data);
        
        // Store approval data if available
        if (response.data.u_approval) {
          setApprovalData(response.data.u_approval);
        }
        
        // Assuming backend provides 'fp_is_remote' flag (1 for true, 0 for false)
        const isRemoteWorker = !!response.data.u_profile?.fp_is_remote;
        setIsRemote(isRemoteWorker);


        // Populate grouped service table data
        const serviceGroups = {};
        if (response.data.se_service_list) {
          response.data.se_service_list.forEach(service => {
            const typeId = service.frs_sc_id;
            if (!serviceGroups[typeId]) {
              serviceGroups[typeId] = {
                key: `service-group-${typeId}`,
                serviceType: typeId,
                services: []
              };
            }
            serviceGroups[typeId].services.push({
              se_id: service.frs_se_id,
              frs_id: service.frs_id
            });
          });
        }
        setServiceTableData(Object.values(serviceGroups));

        // Populate grouped area table data
        const areaGroups = {};
        if (response.data.se_city_list) {
          response.data.se_city_list.forEach(city => {
            const stateId = city.frc_s_id;
            if (!areaGroups[stateId]) {
              areaGroups[stateId] = {
                key: `area-group-${stateId}`,
                state: stateId,
                cities: []
              };
            }
            areaGroups[stateId].cities.push({
              cit_id: city.frc_cit_id,
              frc_id: city.frc_id
            });
          });
        }
        setAreaTableData(Object.values(areaGroups));

        if (response.data.fe_idproof_data) {
          console.log('ID proof data received:', response.data.fe_idproof_data);
          setExistingIdProofId(response.data.fe_idproof_data.fi_id);
          // Check if ID proof is approved (fi_is_active === "1" means approved)
          setIsIdProofApproved(response.data.fe_idproof_data.fi_is_active === "1");
        } else {
          console.log('No ID proof data found in response');
        }

        // Load existing suggestions into separate tables
        if (response.data.fsu_list && response.data.fsu_list.length > 0) {
          const categorySubgs = [];
          const serviceSubgs = [];

          response.data.fsu_list.forEach((suggestion, index) => {
            const suggestionData = {
              key: `suggestion-${index}`,
              id: suggestion.fsu_id,
              serviceTypeId: suggestion.fsu_sc_id,
              serviceTypeName: suggestion.sc_name || getServiceTypeName(suggestion.fsu_sc_id),
              serviceId: suggestion.fsu_se_id,
              serviceName: suggestion.se_name || (suggestion.fsu_se_id > 0 ? getServiceName(suggestion.fsu_se_id) : null),
              suggestion: suggestion.fsu_suggestion,
              status: suggestion.fsu_is_reject === 0 ? 'pending' : 'rejected'
            };

            if (suggestion.fsu_se_id === 0) {
              categorySubgs.push({
                ...suggestionData,
                type: 'service_type'
              });
            } else {
              serviceSubgs.push({
                ...suggestionData,
                type: 'service'
              });
            }
          });

          setCategorySuggestionTableData(categorySubgs);
          setServiceSuggestionTableData(serviceSubgs);
        }

        // If user has existing services, pre-fill the form
        if (response.data.se_service_list && response.data.se_service_list.length > 0) {
          setIsEditing(false);

          // Set form values for other fields
          form.setFieldsValue({
            worktime: response.data.u_profile?.fp_completing_time || '',
            paymentMethod: response.data.u_profile?.fp_payment_methode || '',
            amountType: response.data.u_profile?.fp_amount_for || '',
            amount: response.data.u_profile?.fp_amt_hour || '',
            idType: response.data.fe_idproof_data?.fi_type || '',
            idNumber: response.data.fe_idproof_data?.fi_number || '',
            is_remote: isRemoteWorker
          });

          // Set file list if ID proof exists
          if (response.data.fe_idproof_data?.fi_img) {
            const imageUrl = getFullImageUrl(response.data.fe_idproof_data.fi_img);
            if (imageUrl) {
              setExistingFileUrl(imageUrl);
              setFileList([{
                uid: '-1',
                name: 'id_proof.jpg',
                status: 'done',
                url: imageUrl
              }]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching existing services:", error);
    }
  };

  // Helper function to construct full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '' || imagePath === '0') {
      return null;
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    let cleanImagePath = imagePath;
    if (imagePath.includes('--')) {
      cleanImagePath = imagePath.split('--')[0];
    }

    let baseURL = api.defaults.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (baseURL.endsWith('/api')) {
      baseURL = baseURL.replace('/api', '');
    }

    const finalImagePath = cleanImagePath.startsWith('/') ? cleanImagePath.slice(1) : cleanImagePath;

    return `${baseURL}/${finalImagePath}`;
  };

  // Delete functionality
  const handleDelete = async (type, id, itemType) => {
    const deleteKey = `${type}-${id}`;
    setDeletingItems(prev => new Set([...prev, deleteKey]));

    try {
      if (type === 5 && serviceData?.se_service_list?.length <= 1) {
        message.error("You must have at least one service");
        return;
      }

      if (type === 6 && serviceData?.se_city_list?.length <= 1) {
        message.error("You must have at least one service area");
        return;
      }

      const encodedId = btoa(id.toString());
      const response = await api.get(`/deleteItem/${type}/${encodedId}`);

      if (response.data) {
        message.success(`${itemType} deleted successfully!`);

        // ID proof deletion uses type 10
        if (type === 10) {
          setIsIdProofDeleted(true);
          setExistingFileUrl(null);
          setFileList([]);
          setExistingIdProofId(null);
          setIsIdProofApproved(false);
          form.setFieldsValue({
            idType: undefined,
            idNumber: "",
          });
        } else {
          // For other types, refresh data
          await fetchExistingServices();
        }
      }
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      message.error(`Failed to delete ${itemType}. Please try again.`);
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(deleteKey);
        return newSet;
      });
    }
  };

  // Check if a service type is "Other"
  const isOtherServiceType = (serviceTypeId) => {
    const serviceType = serviceTypes.find(st => st.sc_id == serviceTypeId);
    return serviceType && serviceType.sc_name && serviceType.sc_name.toLowerCase() === 'other';
  };

  // Check if a service is "Other"
  const isOtherService = (serviceId) => {
    const service = allServices.find(s => s.se_id == serviceId);
    return service && service.se_name && service.se_name.toLowerCase() === 'other';
  };

  // Handle service type selection
  const handleServiceTypeChange = (value) => {
    setSelectedServiceType(value);
    setSelectedService("");

    if (isOtherServiceType(value)) {
      setCategorySuggestionModal({
        isOpen: true,
        serviceTypeId: value
      });
    }
  };

  // Handle service selection
  const handleServiceChange = (value) => {
    setSelectedService(value);

    if (isOtherService(value)) {
      setServiceSuggestionModal({
        isOpen: true,
        serviceTypeId: selectedServiceType
      });
    }
  };

  // Add category suggestion to table
  const addCategorySuggestionToTable = () => {
    const values = categorySuggestionForm.getFieldsValue();

    if (!values.suggestion || values.suggestion.trim() === '') {
      message.error("Please enter your suggestion");
      return;
    }

    const suggestionText = values.suggestion.trim();
    const serviceTypeId = categorySuggestionModal.serviceTypeId;

    const newCategorySuggestion = {
      key: `category-suggestion-${Date.now()}`,
      serviceTypeId,
      serviceTypeName: getServiceTypeName(serviceTypeId),
      suggestion: suggestionText,
      status: 'pending',
      type: 'service_type',
      isNew: true
    };

    setCategorySuggestionTableData(prev => [...prev, newCategorySuggestion]);

    // reset and close category modal
    categorySuggestionForm.resetFields();
    setCategorySuggestionModal({ isOpen: false, serviceTypeId: null });
    setSelectedServiceType("");
    setSelectedService("");
    message.success("Category suggestion added to your list");

    // Immediately open the Service Suggestion modal for the same category
    if (serviceTypeId) {
      setTimeout(() => {
        setServiceSuggestionModal({
          isOpen: true,
          serviceTypeId
        });
      }, 200);
    }
  };

  // Add service suggestion to table
  const addServiceSuggestionToTable = () => {
    const values = serviceSuggestionForm.getFieldsValue();

    if (!values.suggestion || values.suggestion.trim() === '') {
      message.error("Please enter your suggestion");
      return;
    }

    const suggestionText = values.suggestion.trim();

    const newServiceSuggestion = {
      key: `service-suggestion-${Date.now()}`,
      serviceTypeId: serviceSuggestionModal.serviceTypeId,
      serviceTypeName: getServiceTypeName(serviceSuggestionModal.serviceTypeId),
      serviceId: selectedService,
      serviceName: getServiceName(selectedService),
      suggestion: suggestionText,
      status: 'pending',
      type: 'service',
      isNew: true
    };

    setServiceSuggestionTableData(prev => [...prev, newServiceSuggestion]);

    setSelectedServiceType("");
    setSelectedService("");
    setServiceSuggestionModal({ isOpen: false, serviceTypeId: null });
    serviceSuggestionForm.resetFields();
    message.success("Service suggestion added to your list");
  };

  // Remove suggestion from table
  const removeCategorySuggestionFromTable = (key) => {
    setCategorySuggestionTableData(prev => prev.filter(item => item.key !== key));
  };

  const removeServiceSuggestionFromTable = (key) => {
    setServiceSuggestionTableData(prev => prev.filter(item => item.key !== key));
  };

  // Submit suggestions to API (called during form submission)
  const submitSuggestions = async () => {
    const categorySubsToSubmit = categorySuggestionTableData.filter(item => item.isNew);
    const serviceSubsToSubmit = serviceSuggestionTableData.filter(item => item.isNew);

    if (categorySubsToSubmit.length === 0 && serviceSubsToSubmit.length === 0) {
      return Promise.resolve();
    }

    try {
      const suggestionPromises = [];

      categorySubsToSubmit.forEach((categoryItem) => {
        const payload = {
          sug_sc_val: categoryItem.serviceTypeId,
          sug_se_val: 0,
          sug_val: categoryItem.suggestion
        };
        suggestionPromises.push(api.post("/storeSuggestion", payload));
      });

      serviceSubsToSubmit.forEach((serviceItem) => {
        const payload = {
          sug_sc_val: serviceItem.serviceTypeId,
          sug_se_val: serviceItem.serviceId,
          sug_val: serviceItem.suggestion
        };
        suggestionPromises.push(api.post("/storeSuggestion", payload));
      });

      await Promise.all(suggestionPromises);
      const totalSuggestions = categorySubsToSubmit.length + serviceSubsToSubmit.length;
      message.success(`${totalSuggestions} suggestion(s) submitted successfully!`);
    } catch (error) {
      console.error("Error submitting suggestions:", error);
      throw new Error("Failed to submit suggestions");
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      fetchExistingServices();
      setIsIdProofDeleted(false);
    } else {
      setIsEditing(true);
      setEditMode(true);
    }
  };

  // Get filtered services based on selected service type
  const getFilteredServices = (serviceTypeId) => {
    if (!serviceTypeId) return [];
    return allServices.filter(service => service.se_sc_id == serviceTypeId);
  };

  // Handle adding service to table
  const addServiceToTable = () => {
    if (!selectedServiceType) {
      message.error("Please select a service type");
      return;
    }

    if (!selectedService) {
      message.error("Please select a service");
      return;
    }

    const isServiceTypeOther = isOtherServiceType(selectedServiceType);
    const isServiceOther = isOtherService(selectedService);

    if (isServiceTypeOther || isServiceOther) {
      message.warning("Please complete the suggestion process for 'Other' options");
      return;
    }

    setServiceTableData(prev => {
      const newList = [...prev];
      const index = newList.findIndex(item => item.serviceType === selectedServiceType);

      if (index >= 0) {
        if (newList[index].services.some(s => s.se_id === selectedService)) {
          message.warning("This service is already in your list");
          return prev;
        }
        newList[index].services.push({ se_id: selectedService, frs_id: null });
      } else {
        newList.push({
          key: `${selectedServiceType}-${Date.now()}`,
          serviceType: selectedServiceType,
          services: [{ se_id: selectedService, frs_id: null }]
        });
      }
      message.success("Service added to your list");
      return newList;
    });

    setSelectedServiceType("");
    setSelectedService("");
  };

  // Remove service from type
  const removeServiceFromType = async (serviceType, seId, frsId) => {
    if (frsId) {
      await handleDelete(5, frsId, 'Service');
    }
    setServiceTableData(prev => prev.map(group => {
      if (group.serviceType === serviceType) {
        const newServices = group.services.filter(s => s.se_id !== seId);
        if (newServices.length === 0) return null;
        return { ...group, services: newServices };
      }
      return group;
    }).filter(Boolean));
  };

  // Handle state selection - prefill cities if state already exists
  const handleStateChange = (value) => {
    setSelectedState(value);
    const existingArea = areaTableData.find(item => item.state === value);
    setSelectedCities(existingArea ? existingArea.cities.map(c => c.cit_id) : []);
  };

  // Handle adding area to table - merge cities
  const addAreaToTable = () => {
    if (!selectedState || selectedCities.length === 0) {
      message.error("Please select both a state and at least one city.");
      return;
    }

    setAreaTableData(prev => {
      const newList = [...prev];
      const index = newList.findIndex(item => item.state === selectedState);
      const currentCities = index >= 0 ? newList[index].cities.map(c => c.cit_id) : [];
      const newCitiesToAdd = selectedCities.filter(cId => !currentCities.includes(cId));

      if (newCitiesToAdd.length === 0) {
        message.warning("All selected cities for this state are already in your list.");
        return prev;
      }

      const addedCityObjects = newCitiesToAdd.map(cId => ({ cit_id: cId, frc_id: null }));

      if (index >= 0) {
        newList[index].cities = [...newList[index].cities, ...addedCityObjects];
      } else {
        newList.push({
          key: selectedState,
          state: selectedState,
          cities: addedCityObjects
        });
      }
      message.success("Service area(s) added successfully.");
      return newList;
    });

    setSelectedState("");
    setSelectedCities([]);
  };

  // Remove city from state
  const removeCityFromState = async (stateId, citId, frcId) => {
    if (frcId) {
      await handleDelete(6, frcId, 'City');
    }
    setAreaTableData(prev => prev.map(group => {
      if (group.state === stateId) {
        const newCities = group.cities.filter(c => c.cit_id !== citId);
        if (newCities.length === 0) return null;
        return { ...group, cities: newCities };
      }
      return group;
    }).filter(Boolean));
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 0 && newFileList[0].originFileObj && existingFileUrl && !isIdProofDeleted) {
      setIsIdProofDeleted(true);
      setExistingFileUrl(null);
    }
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
      return Upload.LIST_IGNORE;
    }
    if (!isLt10M) {
      message.error("Image must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const calculateProgress = () => {
    const fields = [
      "worktime", "paymentMethod", "amountType", "amount", "idType", "idNumber",
    ];
    const values = form.getFieldsValue(fields);
    const filledFields = fields.filter((field) => {
      const value = values[field];
      return value && (Array.isArray(value) ? value.some(v => v && v.length > 0) : value.toString().trim() !== "");
    });

    const serviceProgress = serviceTableData.length > 0 ? 2 : 0;
    const areaProgress = (areaTableData.length > 0 || form.getFieldValue('is_remote')) ? 2 : 0;

    return Math.round(((filledFields.length + serviceProgress + areaProgress) / (fields.length + 4)) * 100);
  };

  const renderVerificationBadge = () => {
    // Only show badge in freelancer mode (not registration)
    if (isRegistration || !approvalData) return null;

    const isVerified = approvalData.fa_tab_2_app === "1";
    
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

  const renderFieldVerificationBadge = (fieldKey, isActive = null) => {
    // Only show field badges if overall tab is verified and not in registration mode
    if (isRegistration || !approvalData || approvalData.fa_tab_2_app !== "1") return null;

    let isFieldVerified = false;
    
    // Handle different field types
    if (isActive !== null) {
      // For service/city active status
      isFieldVerified = isActive === 1;
    } else if (fieldKey) {
      // For approval data fields
      isFieldVerified = approvalData[fieldKey] === "1";
    }
    
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

  const onFinish = async (values) => {
    setLoading(true);

    try {
      await submitSuggestions();

      const payload = {
        worktime: values.worktime || serviceData?.u_profile?.fp_completing_time || '',
        amountType: values.amountType || serviceData?.u_profile?.fp_amount_for || '',
        amount: values.amount || serviceData?.u_profile?.fp_amt_hour || '',
        idType: values.idType || serviceData?.fe_idproof_data?.fi_type || '',
        idNumber: values.idNumber || serviceData?.fe_idproof_data?.fi_number || '',
        paymentMethod: 'Through Hyerlancer',
        is_remote: values.is_remote ? 1 : 0, // Pass remote status as 1 or 0
        cities: values.is_remote ? [] : areaTableData.flatMap(group => group.cities.map(city => `${group.state}_${city.cit_id}`)),
        services: serviceTableData.flatMap(group => group.services.map(serv => `${group.serviceType}_${serv.se_id}`)),
      };

      // Always include fi_id if it exists, regardless of deletion status
      if (existingIdProofId) {
        payload.fi_id = existingIdProofId;
      } else {
        // If no existing ID proof, set fi_id to 0 to indicate new record
        payload.fi_id = 0;
      }

      // Debug logging
      console.log('Payload being sent:', payload);
      console.log('existingIdProofId:', existingIdProofId);
      console.log('isIdProofDeleted:', isIdProofDeleted);

      let response;
      const hasNewFile = fileList.length > 0 && fileList[0].originFileObj;

      if (editMode && serviceData) {
        if (hasNewFile) {
          const formData = new FormData();
          Object.keys(payload).forEach(key => {
            if (Array.isArray(payload[key])) {
              payload[key].forEach(value => formData.append(`${key}[]`, value));
            } else {
              formData.append(key, payload[key]);
            }
          });
          formData.append('idFile', fileList[0].originFileObj);
          response = await api.post("/updateFeService", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          if (existingFileUrl && !isIdProofDeleted) {
            payload.idFile = existingFileUrl;
          }
          // Ensure fi_id is included in the payload for update operations
          if (existingIdProofId) {
            payload.fi_id = existingIdProofId;
          } else {
            payload.fi_id = 0;
          }
          response = await api.post("/updateFeService", payload);
        }
      } else {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
          if (Array.isArray(payload[key])) {
            payload[key].forEach(value => formData.append(`${key}[]`, value));
          } else {
            formData.append(key, payload[key]);
          }
        });
        if (hasNewFile) {
          formData.append('idFile', fileList[0].originFileObj);
        }
        response = await api.post("/storeService", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data) {
        message.success("Service details saved successfully!");
        setIsEditing(false);
        setEditMode(false);
        setIsIdProofDeleted(false);

        setServiceTableData([]);
        setAreaTableData([]);

        setCategorySuggestionTableData(prev => prev.filter(item => !item.isNew));
        setServiceSuggestionTableData(prev => prev.filter(item => !item.isNew));

        await fetchExistingServices();

        if (onNext) {
          onNext();
        }
      } else {
        throw new Error(response.data.message || "Failed to save service details");
      }
    } catch (error) {
      console.error("Error saving service details:", error);
      setErrorModal({
        isOpen: true,
        message: error.response?.data?.message || error.message || "Failed to save service details. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getServiceTypeName = (id) => {
    if (typeof id === 'string' && !id.match(/^\d+$/)) return id;
    const serviceType = serviceTypes.find(st => st.sc_id == id);
    return serviceType ? serviceType.sc_name : `Service Type #${id}`;
  };

  const getServiceName = (id) => {
    if (typeof id === 'string' && !id.match(/^\d+$/)) return id;
    const service = allServices.find(s => s.se_id == id);
    return service ? service.se_name : `Service #${id}`;
  };

  const getStateName = (id) => {
    if (typeof id === 'string' && !id.match(/^\d+$/)) return id;
    const state = statesList.find(s => s.s_id == id);
    return state ? state.s_name : `State #${id}`;
  };

  const getCityName = (id) => {
    if (typeof id === 'string' && !id.match(/^\d+$/)) return id;
    const city = allCities.find(c => c.cit_id == id);
    return city ? city.cit_name : `City #${id}`;
  };

  // Suggestion table columns
  const categorySuggestionColumns = [
    {
      title: 'Category',
      dataIndex: 'serviceTypeName',
      key: 'serviceTypeName',
    },
    {
      title: 'Category Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={record.isNew ? 'processing' : (status === 'pending' ? 'processing' : 'error')}>
          {record.isNew ? 'New' : (status === 'pending' ? 'Pending' : 'Rejected')}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          {isEditing && record.isNew && (
            <Button type="link" danger icon={<CloseOutlined />} onClick={() => removeCategorySuggestionFromTable(record.key)}>
              Remove
            </Button>
          )}
          {!record.isNew && (
            <Popconfirm
              title="Are you sure you want to delete this suggestion?"
              onConfirm={() => handleDelete(7, record.id, 'Suggestion')}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const serviceSuggestionColumns = [
    {
      title: 'Category',
      dataIndex: 'serviceTypeName',
      key: 'serviceTypeName',
    },
    {
      title: 'Service Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Tag color={record.isNew ? 'processing' : (status === 'pending' ? 'processing' : 'error')}>
          {record.isNew ? 'New' : (status === 'pending' ? 'Pending' : 'Rejected')}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          {isEditing && record.isNew && (
            <Button type="link" danger icon={<CloseOutlined />} onClick={() => removeServiceSuggestionFromTable(record.key)}>
              Remove
            </Button>
          )}
          {!record.isNew && (
            <Popconfirm
              title="Are you sure you want to delete this suggestion?"
              onConfirm={() => handleDelete(7, record.id, 'Suggestion')}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Service columns for edit mode
  const serviceColumns = [
    {
      title: 'Service Details',
      key: 'serviceDetails',
      render: (_, record) => (
        <div>
          <div className="mb-2">
            <Text strong className="text-blue-600">Category: </Text>
            <Text>{getServiceTypeName(record.serviceType)}</Text>
          </div>
          <div>
            <Text strong className="text-green-600">Services: </Text>
            <Space wrap>
              {record.services.map((serv, index) => (
                <Tag
                  key={index}
                  color="green"
                  closable={isEditing}
                  onClose={(e) => {
                    e.preventDefault();
                    removeServiceFromType(record.serviceType, serv.se_id, serv.frs_id);
                  }}
                >
                  {getServiceName(serv.se_id)}
                </Tag>
              ))}
            </Space>
          </div>
        </div>
      ),
    },
  ];

  // Area columns for edit mode
  const areaColumns = [
    {
      title: 'Service Area Details',
      key: 'areaDetails',
      render: (_, record) => (
        <div>
          <div className="mb-2">
            <Text strong className="text-blue-600">State: </Text>
            <Text>{getStateName(record.state)}</Text>
          </div>
          <div>
            <Text strong className="text-green-600">Cities: </Text>
            <Space wrap>
              {record.cities.map((city, index) => (
                <Tag
                  key={index}
                  color="green"
                  closable={isEditing}
                  onClose={(e) => {
                    e.preventDefault();
                    removeCityFromState(record.state, city.cit_id, city.frc_id);
                  }}
                >
                  {getCityName(city.cit_id)}
                </Tag>
              ))}
            </Space>
          </div>
        </div>
      ),
    },
  ];

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin  tip="Loading service data..." />
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
                    {isEditing ? "Service Details" : "Your Service Information"}
                  </Title>
                  {renderVerificationBadge()}
                </div>
                <Text type="secondary">
                  {isEditing ? "Provide details about your services and availability" : "View and manage your service details"}
                </Text>
              </div>
              {!isEditing && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={toggleEdit}
                  className="flex items-center"
                >
                  Edit Details
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
                initialValues={{
                  worktime: undefined,
                  paymentMethod: "Through Hyerlancer",
                  amountType: undefined,
                  amount: "",
                  idType: undefined,
                  idNumber: "",
                  is_remote: false,
                }}
              >
                {/* Service Information Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Service Information</h2>
                  <Divider className="!my-4" />

                  <Card className="mb-4">
                    <div className="mb-3">
                      <Text type="secondary" className="text-sm">
                        Select both a category and service to add them to your list
                      </Text>
                      {selectedServiceType && isOtherServiceType(selectedServiceType) && (
                        <div className="mt-2">
                          <Alert
                            message="Category Suggestion Required"
                            description="You selected 'Other' category. A suggestion modal will open automatically."
                            type="warning"
                            showIcon
                            className="text-sm"
                          />
                        </div>
                      )}
                      {selectedService && isOtherService(selectedService) && (
                        <div className="mt-2">
                          <Alert
                            message="Service Suggestion Required"
                            description="You selected 'Other' service. A suggestion modal will open automatically."
                            type="warning"
                            showIcon
                            className="text-sm"
                          />
                        </div>
                      )}
                      {selectedServiceType && selectedService && !isOtherServiceType(selectedServiceType) && !isOtherService(selectedService) && (
                        <div className="mt-2">
                          <Alert
                            message="Ready to Add"
                            description="Both category and service are selected. Click 'Add Service' to add them to your list."
                            type="success"
                            showIcon
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                    <Row gutter={16}>
                      <Col xs={24} md={10}>
                        <div className="mb-4">
                          <Tooltip title="Select the main category of your service" placement="topLeft">
                            <label className="font-medium flex items-center">
                              Categories <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </label>
                          </Tooltip>
                          <Select
                            value={selectedServiceType}
                            placeholder="Select a service type"
                            onChange={handleServiceTypeChange}
                            className="w-full"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            status={!selectedServiceType ? "" : (isOtherServiceType(selectedServiceType) ? "warning" : "success")}
                          >
                            {serviceTypes.map((serviceType) => (
                              <Option key={serviceType.sc_id} value={serviceType.sc_id}>
                                {serviceType.sc_name}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                      <Col xs={24} md={10}>
                        <div className="mb-4">
                          <Tooltip title="Select the specific service you offer" placement="topLeft">
                            <label className="font-medium flex items-center">
                              Service <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </label>
                          </Tooltip>
                          <Select
                            value={selectedService}
                            placeholder={selectedServiceType ? "Select a service" : "First select a category"}
                            className="w-full"
                            size="large"
                            onChange={handleServiceChange}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            status={selectedServiceType && selectedService ? (isOtherService(selectedService) ? "warning" : "success") : ""}
                          >
                            {getFilteredServices(selectedServiceType).map((service) => (
                              <Option key={service.se_id} value={service.se_id}>
                                {service.se_name}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                      <Col xs={24} md={4}>
                        <div className="m-1 flex items-center h-full">
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={addServiceToTable}
                            className="w-full"
                            size="large"
                            disabled={!selectedServiceType || !selectedService || isOtherServiceType(selectedServiceType) || isOtherService(selectedService)}
                          >
                            Add Service
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>

                  <Table
                    columns={serviceColumns}
                    dataSource={serviceTableData}
                    pagination={false}
                    locale={{
                      emptyText: (
                        <div className="text-center py-8">
                          <Text type="secondary">No services added yet</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            Select a category and service above, then click "Add Service"
                          </Text>
                        </div>
                      )
                    }}
                    className="mb-6"
                  />

                  {categorySuggestionTableData.length > 0 && (
                    <>
                      <Title level={5} className="!mb-4">
                        <TagOutlined className="mr-2" />
                        Category Suggestions
                      </Title>
                      <Table
                        columns={categorySuggestionColumns}
                        dataSource={categorySuggestionTableData}
                        pagination={false}
                        className="mb-6"
                        size="small"
                      />
                    </>
                  )}

                  {serviceSuggestionTableData.length > 0 && (
                    <>
                      <Title level={5} className="!mb-4">
                        <TagOutlined className="mr-2" />
                        Service Suggestions
                      </Title>
                      <Table
                        columns={serviceSuggestionColumns}
                        dataSource={serviceSuggestionTableData}
                        pagination={false}
                        className="mb-6"
                        size="small"
                      />
                    </>
                  )}

                  <Card className="mb-4">
                    <div className="mb-3">
                      <Text type="secondary" className="text-sm">
                        Select your physical service areas, or choose to work remotely.
                      </Text>
                      {selectedState && selectedCities.length > 0 && (
                        <div className="mt-2">
                          <Alert
                            message="Ready to Add Area"
                            description="Click 'Add Area' to add the selected state and cities to your list."
                            type="success"
                            showIcon
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {isRemote && (
                      <div className="mb-4">
                        <Alert
                          message={
                            <span>
                              <span className="inline-block align-middle mr-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#52c41a" style={{ verticalAlign: 'middle' }}>
                                  <circle cx="12" cy="12" r="10" fill="#f6ffed" />
                                  <path d="M9.5 12.5l2 2 4-4" stroke="#52c41a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span className="font-medium text-green-700">Ready to Add</span>
                            </span>
                          }
                          description={
                            <span className="text-gray-700 text-sm">
                              You have chosen to offer your services remotely. This means you can work with clients from anywhere, without being limited to a specific location.  to include remote work in your service areas.
                            </span>
                          }
                          type="success"
                          showIcon={false}
                          className="text-sm mb-2"
                          style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}
                        />
                      </div>
                    )}
                    <Form.Item name="is_remote" valuePropName="checked" className="mb-4">
                      <Tooltip title="Check if you offer services remotely" placement="right">
                        <Checkbox
                          onChange={(e) => {
                            setIsRemote(e.target.checked);
                            form.setFieldValue('is_remote', e.target.checked);
                          }}
                        >
                          I work remotely
                        </Checkbox>
                      </Tooltip>
                    </Form.Item>


                    <Row gutter={16}>
                      <Col xs={24} md={10}>
                        <div className="mb-4">
                          <Tooltip title="Select the state where you provide services" placement="topLeft">
                            <label className="font-medium flex items-center">
                              State <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </label>
                          </Tooltip>
                          <Select
                            value={selectedState}
                            placeholder="Select a state"
                            onChange={handleStateChange}
                            className="w-full"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            status={!selectedState ? "" : "success"}
                          >
                            {statesList.map((state) => (
                              <Option key={state.s_id} value={state.s_id}>
                                {state.s_name}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                      <Col xs={24} md={10}>
                        <div className="mb-4">
                          <Tooltip title="Select the cities within the state where you provide services" placement="topLeft">
                            <label className="font-medium flex items-center">
                              Cities <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </label>
                          </Tooltip>
                          <Select
                            mode="multiple"
                            value={selectedCities}
                            placeholder={selectedState ? "Select cities" : "First select a state"}
                            className="w-full"
                            size="large"
                            onChange={setSelectedCities}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              (option?.children ?? '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={!selectedState}
                            status={selectedState && selectedCities.length > 0 ? "success" : ""}
                          >
                            {getCitiesForState(selectedState).map((city) => (
                              <Option key={city.cit_id} value={city.cit_id}>
                                {city.cit_name}
                              </Option>
                            ))}
                          </Select>
                        </div>
                      </Col>
                      <Col xs={24} md={4}>
                        <div className="m-1 flex items-center h-full">
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={addAreaToTable}
                            className="w-full"
                            size="large"
                            disabled={!selectedState || selectedCities.length === 0}
                          >
                            Add Area
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>

                  <Table
                    columns={areaColumns}
                    dataSource={areaTableData}
                    pagination={false}
                    locale={{
                      emptyText: (
                        <div className="text-center py-8">
                          <Text type="secondary">No service areas added yet</Text>
                          <br />
                          <Text type="secondary" className="text-sm">
                            Select a state and cities above, then click "Add Area"
                          </Text>
                        </div>
                      )
                    }}
                  />

                  <Row className="mt-6">
                    <Col xs={24} md={24}>
                      <Form.Item
                        name="amountType"
                        label={
                          <Tooltip title="Select how you charge for your service (per project or hourly)" placement="topLeft">
                            <span className="font-medium flex items-center">
                              Payment Terms <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </span>
                          </Tooltip>
                        }
                      >
                        <Select
                          placeholder="Select type"
                          className="w-full"
                          size="large"
                        >
                          <Option value="work">Per project/Work</Option>
                          <Option value="hour">Hourly Basis</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                   
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="amount"
                        label={
                          <Tooltip title="Enter your standard rate in INR" placement="topLeft">
                            <span className="font-medium flex items-center">
                              Standard Rate <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </span>
                          </Tooltip>
                        }
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value || /^[0-9]+$/.test(value)) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("Please enter a valid number"));
                            }
                          }
                        ]}
                      >
                        <ValidatedAntdInput
                          placeholder="Enter amount"
                          prefix={<span className="text-gray-400">₹</span>}
                          suffix="INR"
                          className="w-full"
                          size="large"
                          validationType="text"
                          validationConfig={validationConfigs.title}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="worktime"
                        label={
                          <Tooltip title="Select the typical time to complete a service" placement="topLeft">
                            <span className="font-medium flex items-center">
                              Work Completion Time <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </span>
                          </Tooltip>
                        }
                      >
                        <Select
                          placeholder="Select time"
                          className="w-full"
                          size="large"
                        >
                          <Option value="In a Week">In a Week</Option>
                          <Option value="24 Hours">24 Hours</Option>
                          <Option value="After 2 Days">After 2 Days</Option>
                          <Option value="Tomorrow">Tomorrow</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* ID Verification Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">ID Verification</h2>
                  <Divider className="!my-4" />

                  <Card>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="idType"
                          label={
                            <Tooltip title="Select the type of identification you are providing" placement="topLeft">
                              <span className="font-medium flex items-center">
                                ID Type <InfoCircleOutlined className="ml-1 text-gray-400" />
                                {isIdProofApproved && <span className="ml-2 text-green-600 text-xs">(Approved)</span>}
                              </span>
                            </Tooltip>
                          }
                        >
                          <Select
                            placeholder="Select ID type"
                            className="w-full"
                            size="large"
                            disabled={isIdProofApproved}
                          >
                            <Option value="Aadhaar Card">Aadhar Card</Option>
                            <Option value="PAN Card">PAN Card</Option>
                            <Option value="Passport">Passport</Option>
                            <Option value="Driving License">Driving License</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="idNumber"
                          label={
                            <Tooltip title="Enter the number of your identification document" placement="topLeft">
                              <span className="font-medium flex items-center">
                                ID Number <InfoCircleOutlined className="ml-1 text-gray-400" />
                                {isIdProofApproved && <span className="ml-2 text-green-600 text-xs">(Approved)</span>}
                              </span>
                            </Tooltip>
                          }
                          dependencies={["idType"]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const type = getFieldValue('idType');
                                const v = (value || '').toString().trim();

                                if (!type || !v) {
                                  return Promise.resolve();
                                }

                                if (type === 'Aadhaar Card') {
                                  return /^\d{12}$/.test(v)
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Aadhaar must be exactly 12 digits.'));
                                }

                                if (type === 'PAN Card') {
                                  return /^[A-Z]{5}\d{4}[A-Z]$/i.test(v)
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('PAN format invalid. Example: ABCDE1234F'));
                                }

                                if (type === 'Passport') {
                                  // Option 1: 1 letter and 7 numbers (e.g., A1234567)
                                  if (/^[A-Z][0-9]{7}$/i.test(v)) {
                                    return Promise.resolve();
                                  }
                                  // Option 2: 2 letters and 6 numbers (e.g., AB123456)
                                  if (/^[A-Z]{2}[0-9]{6}$/i.test(v)) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('Passport format invalid. Example: A1234567 or AB123456'));
                                }

                                if (type === 'Driving License') {
                                  return /^[A-Z0-9\-]{6,16}$/i.test(v)
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('Driving Licence seems invalid (6-16 chars, alphanumeric).'));
                                }

                                return Promise.resolve();
                              }
                            })
                          ]}
                        >
                          <ValidatedAntdInput
                            placeholder="Enter ID number"
                            className="w-full"
                            size="large"
                            disabled={isIdProofApproved}
                            validationType="text"
                            validationConfig={validationConfigs.title}
                            onBlur={() => {
                              if (form.getFieldValue('idType') === 'PAN Card') {
                                const cur = form.getFieldValue('idNumber') || '';
                                form.setFieldsValue({ idNumber: cur.toString().toUpperCase() });
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24}>
                        <Form.Item
                          name="idFile"
                          label={
                            <Tooltip title="Upload a clear image of your ID proof" placement="topLeft">
                              <span className="font-medium flex items-center">
                                Upload ID Proof <InfoCircleOutlined className="ml-1 text-gray-400" />
                                {isIdProofApproved && <span className="ml-2 text-green-600 text-xs">(Approved)</span>}
                              </span>
                            </Tooltip>
                          }
                          extra="Upload a clear photo of your ID (JPG/PNG, max 10MB)"
                        >
                          {existingFileUrl && !isIdProofDeleted && (
                            <div className="mb-4">
                              <Image
                                width={100}
                                src={existingFileUrl}
                                alt="Current ID Proof"
                                className="mt-2"
                              />
                            </div>
                          )}
                          <Upload
                            fileList={fileList}
                            beforeUpload={beforeUpload}
                            onChange={handleFileChange}
                            maxCount={1}
                            accept="image/*"
                            listType="picture"
                            disabled={isIdProofApproved}
                            onRemove={() => {
                              setFileList([]);
                              return true;
                            }}
                          >
                            <Button
                              icon={<UploadOutlined />}
                              className="w-full"
                              size="large"
                              disabled={isIdProofApproved}
                            >
                              {isIdProofApproved ? "ID Proof Approved" : (existingFileUrl && !isIdProofDeleted ? "Upload New ID Proof" : "Click to Upload")}
                            </Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </div>

                <div className="mb-6">
                  <Tooltip title="Your progress in completing the service details" placement="top">
                    <div className="flex justify-between items-center mb-1">
                      <Text className="text-sm font-medium">Service Completion</Text>
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


                <div className="flex justify-end gap-3 mt-8">
                  {/* Always show back button if onBack is provided */}
                  {onBack && (
                    <Button
                      size="large"
                      className="flex items-center"
                      disabled={loading}
                      onClick={() => {
                        if (onBack) onBack();
                      }}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    icon={<CheckOutlined />}
                    className="flex items-center"
                  >
                    {editMode ? "Update Details" : "Save Details"}
                  </Button>
                </div>
              </Form>
            ) : (
              <div>
                <div className="mb-8">
                  <Title level={4} className="!mb-4">
                    <GlobalOutlined className="mr-2" />
                    Your Services
                  </Title>
                  <div className="space-y-6">
                    {(() => {
                      if (!serviceData?.se_service_list || serviceData.se_service_list.length === 0) return <Text type="secondary">No services added</Text>;

                      const serviceGroups = {};
                      serviceData.se_service_list.forEach(service => {
                        const serviceTypeId = service.frs_sc_id;
                        if (!serviceGroups[serviceTypeId]) {
                          serviceGroups[serviceTypeId] = {
                            key: serviceTypeId,
                            serviceType: getServiceTypeName(serviceTypeId),
                            service: []
                          };
                        }
                        const serviceName = getServiceName(service.frs_se_id);
                        if (serviceName && !serviceGroups[serviceTypeId].service.includes(serviceName)) {
                          serviceGroups[serviceTypeId].service.push(serviceName);
                        }
                      });

                      return Object.values(serviceGroups).map(group => (
                        <Card key={group.key} title={group.serviceType}>
                          <div className="mb-4">
                            <div className="flex items-center">
                              <Text strong>Services:</Text>
                            <Space wrap className="ml-2">
                              {group.service.map((serv, index) => (
                                <Tag key={index} color="green">{serv}</Tag>
                              ))}
                            </Space>
                            {renderFieldVerificationBadge(null, serviceData.se_service_list.find(s => s.frs_sc_id == group.key)?.frs_is_active)}
                            </div>
                          </div>
                          {canDelete && (
                            <div>
                              <Text strong>Actions:</Text>
                              <Space wrap className="ml-2">
                                {serviceData.se_service_list
                                  .filter(service => service.frs_sc_id == group.key)
                                  .map((service, index) => {
                                    const deleteKey = `5-${service.frs_id}`;
                                    const isDeleting = deletingItems.has(deleteKey);
                                    const isLastService = serviceData.se_service_list.length <= 1;

                                    return (
                                      <Popconfirm
                                        key={index}
                                        title="Are you sure you want to delete this service?"
                                        onConfirm={() => handleDelete(5, service.frs_id, 'Service')}
                                        okText="Yes"
                                        cancelText="No"
                                        disabled={isLastService}
                                      >
                                        <Tooltip title={isLastService ? "You must have at least one service" : ""}>
                                          <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            loading={isDeleting}
                                            size="small"
                                            disabled={isLastService}
                                          >
                                            Delete {getServiceName(service.frs_se_id)}
                                          </Button>
                                        </Tooltip>
                                      </Popconfirm>
                                    );
                                  })}
                              </Space>
                            </div>
                          )}
                        </Card>
                      ));
                    })()}
                  </div>

                  <Title level={4} className="!mb-4 mt-8">
                    <EnvironmentOutlined className="mr-2" />
                    Service Areas
                  </Title>
                  {serviceData?.u_profile?.fp_is_remote ? (
                    <Tag color="blue" style={{ fontSize: '14px', padding: '6px 10px', marginBottom: '16px' }}>
                      Works Remotely (Worldwide)
                    </Tag>
                  ) : null}

                  {serviceData?.se_city_list && serviceData.se_city_list.length > 0 ? (
                    <div className="space-y-6">
                      {(() => {
                        const stateGroups = {};
                        serviceData.se_city_list.forEach(cityData => {
                          const stateId = cityData.frc_s_id;
                          if (!stateGroups[stateId]) {
                            stateGroups[stateId] = {
                              key: stateId,
                              state: getStateName(stateId),
                              cities: []
                            };
                          }
                          stateGroups[stateId].cities.push(getCityName(cityData.frc_cit_id));
                        });

                        return Object.values(stateGroups).map(group => (
                          <Card key={group.key} title={group.state}>
                            <div className="mb-4">
                              <div className="flex items-center">
                                <Text strong>Cities:</Text>
                              <Space wrap className="ml-2">
                                {group.cities.map((city, index) => (
                                  <Tag key={index} color="green">{city}</Tag>
                                ))}
                              </Space>
                              {renderFieldVerificationBadge(null, serviceData.se_city_list.find(c => c.frc_s_id == group.key)?.frc_is_active)}
                              </div>
                            </div>
                            {canDelete && (
                              <div>
                                <Text strong>Actions:</Text>
                                <Space wrap className="ml-2">
                                  {serviceData.se_city_list
                                    .filter(cityData => cityData.frc_s_id == group.key)
                                    .map((cityData, index) => {
                                      const deleteKey = `6-${cityData.frc_id}`;
                                      const isDeleting = deletingItems.has(deleteKey);
                                      const isLastCity = serviceData.se_city_list.length <= 1;

                                      return (
                                        <Popconfirm
                                          key={index}
                                          title="Are you sure you want to delete this city?"
                                          onConfirm={() => handleDelete(6, cityData.frc_id, 'City')}
                                          okText="Yes"
                                          cancelText="No"
                                          disabled={isLastCity}
                                        >
                                          <Tooltip title={isLastCity ? "You must have at least one service area" : ""}>
                                            <Button
                                              type="link"
                                              danger
                                              icon={<DeleteOutlined />}
                                              loading={isDeleting}
                                              size="small"
                                              disabled={isLastCity}
                                            >
                                              Delete {getCityName(cityData.frc_cit_id)}
                                            </Button>
                                          </Tooltip>
                                        </Popconfirm>
                                      );
                                    })}
                                </Space>
                              </div>
                            )}
                          </Card>
                        ));
                      })()}
                    </div>
                  ) : (!serviceData?.u_profile?.fp_is_remote && (
                    <Text type="secondary">No physical service areas added</Text>
                  ))}
                  <Title level={4} className="!mb-4 mt-8">
                    <ClockCircleOutlined className="mr-2" />
                    Work Details
                  </Title>
                  <Descriptions bordered column={1} className="mb-8">
                    <Descriptions.Item 
                      label={
                        <div className="flex items-center">
                          <span>Completion Time</span>
                        </div>
                      }
                    >
                      <div className="flex items-center">
                      {serviceData?.u_profile?.fp_completing_time || "Not specified"}
                      {renderFieldVerificationBadge('fa_completing_time_app')}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={
                        <div className="flex items-center">
                          <span>Payment Method</span>
                        </div>
                      }
                    >
                      <div className="flex items-center">
                      {serviceData?.u_profile?.fp_payment_methode || "Not specified"}
                      {renderFieldVerificationBadge('fa_payment_methode_app')}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={
                        <div className="flex items-center">
                          <span>Pricing Type</span>
                        </div>
                      }
                    >
                      <div className="flex items-center">
                      {serviceData?.u_profile?.fp_amount_for || "Not specified"}
                      {renderFieldVerificationBadge('fa_amount_for_app')}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={
                        <div className="flex items-center">
                          <span>Standard Rate</span>
                          
                        </div>
                      }
                    >
                      <div className="flex items-center">
                      {serviceData?.u_profile?.fp_amt_hour
                        ? `${serviceData.u_profile.fp_amt_hour} INR`
                        : "Not specified"
                      }
                      {renderFieldVerificationBadge('fa_amt_hour_app')}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={4} className="!mb-4 flex items-center mt-5">
                    <BankOutlined className="mr-2" />
                    ID Verification{renderFieldVerificationBadge(null, serviceData?.fe_idproof_data?.fi_is_active)}
                  </Title>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="ID Type">
                      {serviceData?.fe_idproof_data?.fi_type || "Not specified"}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID Number">
                      {serviceData?.fe_idproof_data?.fi_number || "Not specified"}
                    </Descriptions.Item>
                    <Descriptions.Item label="ID Proof">
                      {serviceData?.fe_idproof_data?.fi_img
                        ? (
                          <div>
                            <Image
                              width={100}
                              src={getFullImageUrl(serviceData.fe_idproof_data.fi_img)}
                              alt="ID Proof"
                              className="mb-2"
                            />
                            <br />
                            <a
                              href={getFullImageUrl(serviceData.fe_idproof_data.fi_img)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View ID Proof
                            </a>
                            {canDelete && (
                              <div className="mt-2">
                                <Popconfirm
                                  title="Are you sure you want to delete your ID proof?"
                                  onConfirm={() => handleDelete(10, serviceData.fe_idproof_data.fi_id, 'ID Proof')}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  {/* <Button type="link" danger icon={<DeleteOutlined />}>
                                    Delete ID Proof
                                  </Button> */}
                                </Popconfirm>
                              </div>
                            )}
                          </div>
                        )
                        : "Not uploaded"
                      }
                    </Descriptions.Item>
                  </Descriptions>

                  {(categorySuggestionTableData.length > 0 || serviceSuggestionTableData.length > 0) && (
                    <>
                      <Title level={4} className="!mb-4 mt-8">
                        <TagOutlined className="mr-2" />
                        Your Suggestions
                      </Title>

                      {categorySuggestionTableData.length > 0 && (
                        <>
                          <Title level={5} className="!mb-2">Category Suggestions</Title>
                          <Table
                            columns={categorySuggestionColumns}
                            dataSource={categorySuggestionTableData}
                            pagination={false}
                            className="mb-6"
                            size="small"
                          />
                        </>
                      )}

                      {serviceSuggestionTableData.length > 0 && (
                        <>
                          <Title level={5} className="!mb-2">Service Suggestions</Title>
                          <Table
                            columns={serviceSuggestionColumns}
                            dataSource={serviceSuggestionTableData}
                            pagination={false}
                            className="mb-6"
                            size="small"
                          />
                        </>
                      )}
                    </>
                  )}
                </div>

            
                <div className="flex justify-end gap-3 mt-6">
                  {/* Always show back button if onBack is provided, regardless of isRegistration */}
                  {onBack && (
                    <Button
                      size="large"
                      className="flex items-center"
                      onClick={() => {
                        if (onBack) onBack();
                      }}
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
                            "Services Completed!",
                            "Your service offerings have been configured successfully.",
                            "Continue to Education"
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

      {/* Category Suggestion Modal */}
      <Modal
        title="Suggest New Service Category"
        open={categorySuggestionModal.isOpen}
        onCancel={() => {
          setCategorySuggestionModal({ isOpen: false, serviceTypeId: null });
          categorySuggestionForm.resetFields();
          setSelectedServiceType("");
          setSelectedService("");
        }}
        footer={null}
        width={600}
      >
        <Form
          form={categorySuggestionForm}
          layout="vertical"
          onFinish={addCategorySuggestionToTable}
        >
          <div className="mb-4">
            <Text type="secondary">
              The category "Other" was selected. Please suggest a new category name that should be added to the system.
            </Text>
          </div>

          <Form.Item
            name="suggestion"
            label={<span className="font-medium">Your Category Suggestion</span>}
            rules={[
              { required: true, message: "Please enter your suggestion" },
              { min: 3, message: "Suggestion must be at least 3 characters" },
              { max: 200, message: "Suggestion must not exceed 200 characters" }
            ]}
          >
            <ValidatedAntdTextArea
              placeholder="Enter new service category name..."
              rows={4}
              maxLength={200}
              showCount
              validationType="title"
              validationConfig={validationConfigs.title}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setCategorySuggestionModal({ isOpen: false, serviceTypeId: null });
                categorySuggestionForm.resetFields();
                setSelectedServiceType("");
                setSelectedService("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingSuggestion}
              icon={<PlusOutlined />}
            >
              Add to List
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Service Suggestion Modal */}
      <Modal
        title="Suggest New Service"
        open={serviceSuggestionModal.isOpen}
        onCancel={() => {
          setServiceSuggestionModal({ isOpen: false, serviceTypeId: null });
          serviceSuggestionForm.resetFields();
          setSelectedService("");
        }}
        footer={null}
        width={600}
      >
        <Form
          form={serviceSuggestionForm}
          layout="vertical"
          onFinish={addServiceSuggestionToTable}
        >
          <div className="mb-4">
            <Text type="secondary">
              {`The service "Other" was selected for the "${serviceSuggestionModal.serviceTypeId ? getServiceTypeName(serviceSuggestionModal.serviceTypeId) : ''}" category. Please suggest a new service name that should be added.`}
            </Text>
          </div>

          <Form.Item
            name="suggestion"
            label={<span className="font-medium">Your Service Suggestion</span>}
            rules={[
              { required: true, message: "Please enter your suggestion" },
              { min: 3, message: "Suggestion must be at least 3 characters" },
              { max: 200, message: "Suggestion must not exceed 200 characters" }
            ]}
          >
            <ValidatedAntdTextArea
              placeholder="Enter new service name..."
              rows={4}
              maxLength={200}
              showCount
              validationType="title"
              validationConfig={validationConfigs.title}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setServiceSuggestionModal({ isOpen: false, serviceTypeId: null });
                serviceSuggestionForm.resetFields();
                setSelectedService("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submittingSuggestion}
              icon={<PlusOutlined />}
            >
              Add to List
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Error Modal */}
      <Modal
        title={errorModal.type === "error" ? "Error" : "Success"}
        open={errorModal.isOpen}
        onCancel={() => setErrorModal({ ...errorModal, isOpen: false })}
        footer={[
          <Button key="ok" type="primary" onClick={() => setErrorModal({ ...errorModal, isOpen: false })}>
            OK
          </Button>
        ]}
      >
        <p>{errorModal.message}</p>
      </Modal>
    </div>
  );
};

export default ServiceTab;