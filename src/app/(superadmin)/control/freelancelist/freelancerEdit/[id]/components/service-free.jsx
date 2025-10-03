"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Form,
  Select,
  Row,
  Col,
  Table,
  Space,
  message,
  Tag,
  Input,
  Checkbox,
  Upload,
  Progress,
  Typography,
  Alert,
  Card,
  Button,
  Divider,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  LeftOutlined,
  SettingOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import adminApi from "@/config/adminApi";

const { Option } = Select;
const { Text } = Typography;

export default function AdminServicePage() {
  const params = useParams();
  const router = useRouter();
  const userIdBase64 = params?.id ? decodeURIComponent(params.id) : null;

  const [form] = Form.useForm();

  // View state - controls whether to show listing or form
  const [viewMode, setViewMode] = useState('loading'); // 'loading', 'listing', 'form'
  const [hasExistingData, setHasExistingData] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [serviceTypes, setServiceTypes] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isRemote, setIsRemote] = useState(false);
  const [existingIdProof, setExistingIdProof] = useState(null);

  // Selection state
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  // Table data
  const [serviceTableData, setServiceTableData] = useState([]);
  const [areaTableData, setAreaTableData] = useState([]);

  // Listing data for display
  const [listingData, setListingData] = useState(null);

  // Fetch dropdown data from public APIs
  const fetchDropdownData = async () => {
    try {
      setDropdownLoading(true);

      const [stateResponse, categoryResponse] = await Promise.all([
        fetch('https://backend.hyrelancer.in/api/getStatelist'),
        fetch('https://backend.hyrelancer.in/api/getCategorylist')
      ]);

      if (!stateResponse.ok || !categoryResponse.ok) {
        throw new Error('Failed to fetch dropdown data');
      }

      const [stateData, categoryData] = await Promise.all([
        stateResponse.json(),
        categoryResponse.json()
      ]);

      if (stateData.state && stateData.city) {
        setStates(stateData.state);
        setCities(stateData.city);
      }

      if (categoryData.sc_list && categoryData.se_list) {
        setServiceTypes(categoryData.sc_list);
        setAllServices(categoryData.se_list);
      }

    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      message.error("Failed to load dropdown data");
      setError("Failed to load dropdown options");
    } finally {
      setDropdownLoading(false);
    }
  };

  // Check if user has meaningful data
  const hasValidData = (data) => {
    const hasServices = data.se_sub_cate_list &&
      Array.isArray(data.se_sub_cate_list) &&
      data.se_sub_cate_list.length > 0 &&
      data.se_service_list &&
      Array.isArray(data.se_service_list) &&
      data.se_service_list.length > 0;

    const hasAreas = data.se_state_list &&
      Array.isArray(data.se_state_list) &&
      data.se_state_list.length > 0;

    const hasProfile = data.u_profile &&
      typeof data.u_profile === 'object' &&
      (data.u_profile.fp_completing_time ||
        data.u_profile.fp_amount_for ||
        (data.u_profile.fp_amt_hour && data.u_profile.fp_amt_hour !== "0" && data.u_profile.fp_amt_hour !== 0));

    const hasIdProof = data.fe_idproof_data &&
      typeof data.fe_idproof_data === 'object' &&
      (data.fe_idproof_data.fi_type ||
        data.fe_idproof_data.fi_number ||
        data.fe_idproof_data.fi_img);

    return hasServices || hasAreas || hasProfile || hasIdProof;
  };

  // Fetch user service data
  const fetchUserServiceData = async () => {
    if (!userIdBase64) return;

    try {
      setDataLoading(true);
      const response = await adminApi.get(`/getFeUService/${userIdBase64}`);
      const data = response.data;

      // Determine view mode based on data
      if (hasValidData(data)) {
        setHasExistingData(true);
        setListingData(data);
        setViewMode('listing');

        // Also process data for form (in case user clicks edit)
        processDataForForm(data);
      } else {
        setHasExistingData(false);
        setViewMode('form');
      }

    } catch (err) {
      console.error('Error fetching user service data:', err);
      setHasExistingData(false);
      setViewMode('form');
      // Don't show error for new users, just proceed to form
    } finally {
      setDataLoading(false);
    }
  };

  // Process data for form editing
  const processDataForForm = (data) => {
    // Process existing service data
    if (data.se_sub_cate_list && Array.isArray(data.se_sub_cate_list) &&
      data.se_service_list && Array.isArray(data.se_service_list)) {

      const processedServiceData = [];

      data.se_sub_cate_list.forEach(category => {
        if (category && category.frs_sc_id) {
          const categoryServices = data.se_service_list.filter(
            service => service && service.frs_sc_id === category.frs_sc_id
          );

          if (categoryServices.length > 0) {
            processedServiceData.push({
              key: `${category.frs_sc_id}-${Date.now()}`,
              serviceType: category.frs_sc_id,
              services: categoryServices.map(service => ({
                se_id: service.frs_se_id,
                se_name: service.se_name
              }))
            });
          }
        }
      });

      setServiceTableData(processedServiceData);
    }

    // Process existing area data
    if (data.se_state_list && Array.isArray(data.se_state_list) &&
      data.se_city_list && Array.isArray(data.se_city_list)) {

      const processedAreaData = [];

      data.se_state_list.forEach(state => {
        if (state && state.frc_s_id) {
          const stateCities = data.se_city_list.filter(
            city => city && city.frc_s_id === state.frc_s_id
          );

          if (stateCities.length > 0) {
            processedAreaData.push({
              key: state.frc_s_id,
              state: state.frc_s_id,
              cities: stateCities.map(city => ({
                cit_id: city.frc_cit_id,
                cit_name: city.cit_name
              }))
            });
          }
        }
      });

      setAreaTableData(processedAreaData);
    }

    // Process profile data
    if (data.u_profile && typeof data.u_profile === 'object') {
      const profileData = {
        worktime: data.u_profile.fp_completing_time || '',
        amountType: data.u_profile.fp_amount_for || '',
        amount: data.u_profile.fp_amt_hour || ''
      };

      form.setFieldsValue(profileData);
    }

    // Process ID proof data
    if (data.fe_idproof_data && typeof data.fe_idproof_data === 'object') {
      setExistingIdProof(data.fe_idproof_data);

      const idProofData = {
        idType: data.fe_idproof_data.fi_type || '',
        idNumber: data.fe_idproof_data.fi_number || ''
      };

      form.setFieldsValue(idProofData);

      if (data.fe_idproof_data.fi_img) {
        const fileName = data.fe_idproof_data.fi_img.split('/').pop() || 'id_proof.jpg';
        let fileUrl;

        if (data.fe_idproof_data.fi_img.includes('--')) {
          fileUrl = `https://backend.hyrelancer.in/${data.fe_idproof_data.fi_img.split('--')[0]}`;
        } else if (data.fe_idproof_data.fi_img.startsWith('uploads/')) {
          fileUrl = `https://backend.hyrelancer.in/${data.fe_idproof_data.fi_img}`;
        } else {
          fileUrl = `https://backend.hyrelancer.in/uploads/${data.fe_idproof_data.fi_img}`;
        }

        setFileList([{
          uid: '-1',
          name: fileName,
          status: 'done',
          url: fileUrl
        }]);
      }
    }
  };

  // Initialize data
  useEffect(() => {
    if (userIdBase64) {
      Promise.all([
        fetchDropdownData(),
        fetchUserServiceData()
      ]);
    } else {
      setError("Missing user ID in route");
      setDataLoading(false);
    }
  }, [userIdBase64]);

  // Helper functions
  const getServiceTypeName = (id) => {
    const serviceType = serviceTypes.find(st => st.sc_id == id);
    return serviceType ? serviceType.sc_name : `Service Type #${id}`;
  };

  const getServiceName = (id, serviceData = null) => {
    if (serviceData && serviceData.se_name) {
      return serviceData.se_name;
    }

    const service = allServices.find(s => s.se_id == id);
    return service ? service.se_name : `Service #${id}`;
  };

  const getStateName = (id) => {
    const state = states.find(s => s.s_id == id);
    return state ? state.s_name : `State #${id}`;
  };

  const getCityName = (id, cityData = null) => {
    if (cityData && cityData.cit_name) {
      return cityData.cit_name;
    }

    const city = cities.find(c => c.cit_id == id);
    return city ? city.cit_name : `City #${id}`;
  };

  const getCitiesForState = (stateId) => {
    return cities.filter(city => city.cit_state_id == stateId);
  };

  const getFilteredServices = (serviceTypeId) => {
    if (!serviceTypeId) return [];
    return allServices.filter(service => service.se_sc_id == serviceTypeId);
  };

  // Event handlers
  const handleServiceTypeChange = (value) => {
    setSelectedServiceType(value);
    setSelectedService("");
  };

  const handleServiceChange = (value) => {
    setSelectedService(value);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    const existingArea = areaTableData.find(item => item.state === value);
    setSelectedCities(existingArea ? existingArea.cities.map(c => c.cit_id) : []);
  };

  const addServiceToTable = () => {
    if (!selectedServiceType || !selectedService) {
      message.error("Please select both service type and service");
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
        newList[index].services.push({ se_id: selectedService });
      } else {
        newList.push({
          key: `${selectedServiceType}-${Date.now()}`,
          serviceType: selectedServiceType,
          services: [{ se_id: selectedService }]
        });
      }
      message.success("Service added to list");
      return newList;
    });

    setSelectedServiceType("");
    setSelectedService("");
  };

  const addAreaToTable = () => {
    if (!selectedState || selectedCities.length === 0) {
      message.error("Please select both state and at least one city");
      return;
    }

    setAreaTableData(prev => {
      const newList = [...prev];
      const index = newList.findIndex(item => item.state === selectedState);
      const currentCities = index >= 0 ? newList[index].cities.map(c => c.cit_id) : [];
      const newCitiesToAdd = selectedCities.filter(cId => !currentCities.includes(cId));

      if (newCitiesToAdd.length === 0) {
        message.warning("All selected cities are already in your list");
        return prev;
      }

      const addedCityObjects = newCitiesToAdd.map(cId => ({ cit_id: cId }));

      if (index >= 0) {
        newList[index].cities = [...newList[index].cities, ...addedCityObjects];
      } else {
        newList.push({
          key: selectedState,
          state: selectedState,
          cities: addedCityObjects
        });
      }
      message.success("Service area added successfully");
      return newList;
    });

    setSelectedState("");
    setSelectedCities([]);
  };

  const removeServiceFromType = (serviceType, seId) => {
    setServiceTableData(prev => prev.map(group => {
      if (group.serviceType === serviceType) {
        const newServices = group.services.filter(s => s.se_id !== seId);
        if (newServices.length === 0) return null;
        return { ...group, services: newServices };
      }
      return group;
    }).filter(Boolean));
  };

  const removeCityFromState = (stateId, citId) => {
    setAreaTableData(prev => prev.map(group => {
      if (group.state === stateId) {
        const newCities = group.cities.filter(c => c.cit_id !== citId);
        if (newCities.length === 0) return null;
        return { ...group, cities: newCities };
      }
      return group;
    }).filter(Boolean));
  };

  // File upload handlers
  const handleFileChange = ({ fileList: newFileList }) => {
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

  // Form submission
  const onFinish = async (values) => {
    if (serviceTableData.length === 0) {
      message.error("Please add at least one service");
      return;
    }

    if (!isRemote && areaTableData.length === 0) {
      message.error("Please add at least one service area or enable remote work");
      return;
    }

    const requiredFields = ['worktime', 'amountType', 'amount', 'idType', 'idNumber'];
    const missingFields = requiredFields.filter(field => !values[field] || values[field].toString().trim() === '');

    if (missingFields.length > 0) {
      message.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (!existingIdProof && (fileList.length === 0 || !fileList[0].originFileObj)) {
      message.error("Please upload your ID proof");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.append('fp_u_id', userIdBase64);

      const isUpdateOperation = !!existingIdProof;
      formData.append('is_status', isUpdateOperation ? 'update' : 'new');

      formData.append('worktime', values.worktime);
      formData.append('amountType', values.amountType);
      formData.append('amount', values.amount);
      formData.append('idType', values.idType);
      formData.append('idNumber', values.idNumber);
      formData.append('paymentMethod', 'Through Hyerlancer');

      serviceTableData.forEach(group => {
        group.services.forEach(service => {
          formData.append('services[]', `${group.serviceType}_${service.se_id}`);
        });
      });
      const uniqueCategories = [...new Set(serviceTableData.map(item => item.serviceType))];
      uniqueCategories.forEach(category => {
        formData.append('categories[]', category);
      });

      if (!isRemote) {
        areaTableData.forEach(group => {
          group.cities.forEach(city => {
            formData.append('cities[]', `${group.state}_${city.cit_id}`);
          });
        });
        const uniqueStates = [...new Set(areaTableData.map(item => item.state))];
        uniqueStates.forEach(state => {
          formData.append('states[]', state);
        });
      }

      if (isUpdateOperation && existingIdProof && existingIdProof.fi_id) {
        formData.append('fi_id', existingIdProof.fi_id);
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('idFile', fileList[0].originFileObj);
      } else if (isUpdateOperation && existingIdProof && existingIdProof.fi_img) {
        formData.append('idFile', existingIdProof.fi_img);
      }

      const apiEndpoint = isUpdateOperation ? '/updateFeUService' : '/storeFeUService';

      let response;
      if (isUpdateOperation) {
        // Use PUT method for updates
        response = await adminApi.post(apiEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      } else {
        // Use POST method for new entries
        response = await adminApi.post(apiEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      }

      const result = response.data;

      if (result.errors) {
        const errorMessages = Object.values(result.errors).flat();
        errorMessages.forEach(msg => message.error(msg));
        return;
      }

      message.success(result.message || "Service details saved successfully!");

      // After successful save, refresh data and go back to listing
      await fetchUserServiceData();

    } catch (error) {
      console.error('Error saving service details:', error);
      const errorMessage = error.message || "Failed to save service details";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const fields = ["worktime", "amountType", "amount", "idType", "idNumber"];
    const values = form.getFieldsValue(fields);
    const filledFields = fields.filter((field) => {
      const value = values[field];
      return value && value.toString().trim() !== "";
    });

    const serviceProgress = serviceTableData.length > 0 ? 2 : 0;
    const areaProgress = (areaTableData.length > 0 || isRemote) ? 2 : 0;
    const fileProgress = fileList.length > 0 ? 1 : 0;

    return Math.round(((filledFields.length + serviceProgress + areaProgress + fileProgress) / 10) * 100);
  };

  const formatImageUrl = (url) => {
    if (!url) return null;

    // Clean the URL first (remove -- suffix if present)
    const cleanUrl = url.split("--")[0];

    // Convert to absolute URL if it's a relative path
    if (!cleanUrl.startsWith('http')) {
      return `https://backend.hyrelancer.in/${cleanUrl.replace(/^\/+/, "")}`;
    }

    return cleanUrl;
  };

  // Table columns for form
  const serviceColumns = [
    {
      title: 'Service Category',
      key: 'serviceCategory',
      render: (_, record) => (
        <Text strong className="text-blue-600">
          {getServiceTypeName(record.serviceType)}
        </Text>
      ),
    },
    {
      title: 'Services',
      key: 'services',
      render: (_, record) => (
        <Space wrap>
          {record.services.map((serv, index) => (
            <Tag
              key={index}
              color="green"
              closable
              onClose={(e) => {
                e.preventDefault();
                removeServiceFromType(record.serviceType, serv.se_id);
              }}
            >
              {getServiceName(serv.se_id, serv)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  const areaColumns = [
    {
      title: 'State',
      key: 'state',
      render: (_, record) => (
        <Text strong className="text-blue-600">
          {getStateName(record.state)}
        </Text>
      ),
    },
    {
      title: 'Cities',
      key: 'cities',
      render: (_, record) => (
        <Space wrap>
          {record.cities.map((city, index) => (
            <Tag
              key={index}
              color="green"
              closable
              onClose={(e) => {
                e.preventDefault();
                removeCityFromState(record.state, city.cit_id);
              }}
            >
              {getCityName(city.cit_id, city)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  // Loading state
  if (viewMode === 'loading' || dataLoading || dropdownLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 mb-2">Loading...</p>
              <p className="text-sm text-gray-500">This may take a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dropdownLoading && !dataLoading && viewMode !== 'form') {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LISTING VIEW
  if (viewMode === 'listing' && listingData) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <EyeOutlined className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Service Details</h1>
                <p className="text-sm text-gray-500">View and manage your service information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setViewMode('form')}
              >
                Edit Services
              </Button>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LeftOutlined className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Services Section */}
            {listingData.se_sub_cate_list && listingData.se_sub_cate_list.length > 0 && (
              <Card title="Services Offered" className="mb-6">
                {serviceTableData.map((group, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-blue-600 mb-2">
                      {getServiceTypeName(group.serviceType)}
                    </h4>
                    <Space wrap>
                      {group.services.map((serv, idx) => (
                        <Tag key={idx} color="blue">
                          {getServiceName(serv.se_id, serv)}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                ))}
              </Card>
            )}

            {/* Service Areas Section */}
            {listingData.se_state_list && listingData.se_state_list.length > 0 && (
              <Card title="Service Areas" className="mb-6">
                {areaTableData.map((group, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-green-600 mb-2">
                      {getStateName(group.state)}
                    </h4>
                    <Space wrap>
                      {group.cities.map((city, idx) => (
                        <Tag key={idx} color="green">
                          {getCityName(city.cit_id, city)}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                ))}
              </Card>
            )}

            {/* Professional Details Section */}
            {listingData.u_profile && (
              <Card title="Professional Details" className="mb-6">
                <Row gutter={[24, 16]}>
                  {listingData.u_profile.fp_completing_time && (
                    <Col xs={24} md={8}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ClockCircleOutlined className="text-gray-500" />
                          <Text strong>Completion Time</Text>
                        </div>
                        <Text>{listingData.u_profile.fp_completing_time}</Text>
                      </div>
                    </Col>
                  )}
                  {listingData.u_profile.fp_amount_for && (
                    <Col xs={24} md={8}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <GlobalOutlined className="text-gray-500" />
                          <Text strong>Payment Type</Text>
                        </div>
                        <Text>{listingData.u_profile.fp_amount_for}</Text>
                      </div>
                    </Col>
                  )}
                  {listingData.u_profile.fp_amt_hour && listingData.u_profile.fp_amt_hour !== 0 && (
                    <Col xs={24} md={8}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <GlobalOutlined className="text-gray-500" />
                          <Text strong>Rate</Text>
                        </div>
                        <Text>₹{listingData.u_profile.fp_amt_hour}</Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* ID Verification Section */}
            {listingData.fe_idproof_data && (
              <Card title="ID Verification" className="mb-6">
                <Row gutter={[24, 16]}>
                  {listingData.fe_idproof_data.fi_type && (
                    <Col xs={24} md={12}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <IdcardOutlined className="text-gray-500" />
                          <Text strong>ID Type</Text>
                        </div>
                        <Text>{listingData.fe_idproof_data.fi_type}</Text>
                      </div>
                    </Col>
                  )}
                  {listingData.fe_idproof_data.fi_number && (
                    <Col xs={24} md={12}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <IdcardOutlined className="text-gray-500" />
                          <Text strong>ID Number</Text>
                        </div>
                        <Text>{listingData.fe_idproof_data.fi_number}</Text>
                      </div>
                    </Col>
                  )}
                  {listingData.fe_idproof_data.fi_img && (
                    <Col xs={24}>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <IdcardOutlined className="text-gray-500" />
                          <Text strong>ID Proof Document</Text>
                        </div>
                        <div className="mt-2">
                          <img
                            src={formatImageUrl(listingData.fe_idproof_data.fi_img)}
                            alt="ID Proof"
                            className="max-w-xs rounded-lg border"
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW (Original design restored)
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <SettingOutlined className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Service Management</h1>
              <p className="text-sm text-gray-500">Configure service offerings, areas, and professional details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasExistingData && (
              <Button
                onClick={() => setViewMode('listing')}
                className="mr-2"
              >
                View Details
              </Button>
            )}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LeftOutlined className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              paymentMethod: "Through Hyerlancer",
              is_remote: false,
            }}
          >
            {/* Service Selection Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                <GlobalOutlined className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Service Information</h3>
              </div>
              <div className="p-4">
                <Row gutter={16} className="mb-4" align="bottom">
                  <Col xs={24} md={8}>
                    <Form.Item label={<Text strong>Service Category</Text>} className="mb-0">
                      <Select
                        value={selectedServiceType}
                        placeholder="Select category"
                        onChange={handleServiceTypeChange}
                        className="w-full"
                        size="large"
                      >
                        {serviceTypes.map((serviceType) => (
                          <Option key={serviceType.sc_id} value={serviceType.sc_id}>
                            {serviceType.sc_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<Text strong>Service</Text>} className="mb-0">
                      <Select
                        value={selectedService}
                        placeholder={selectedServiceType ? "Select service" : "First select a category"}
                        className="w-full"
                        size="large"
                        onChange={handleServiceChange}
                        disabled={!selectedServiceType}
                      >
                        {getFilteredServices(selectedServiceType).map((service) => (
                          <Option key={service.se_id} value={service.se_id}>
                            {service.se_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span>&nbsp;</span>} className="mb-0">
                      <button
                        type="button"
                        onClick={addServiceToTable}
                        disabled={!selectedServiceType || !selectedService}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-10"
                      >
                        <PlusOutlined className="w-4 h-4" />
                        Add Service
                      </button>
                    </Form.Item>
                  </Col>
                </Row>

                <Table
                  columns={serviceColumns}
                  dataSource={serviceTableData}
                  pagination={false}
                  locale={{
                    emptyText: "No services added yet"
                  }}
                  size="small"
                />
              </div>
            </div>

            {/* Service Area Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                <EnvironmentOutlined className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Service Areas</h3>
              </div>
              <div className="p-4">
                <Form.Item name="is_remote" valuePropName="checked" className="mb-4">
                  <Checkbox onChange={(e) => setIsRemote(e.target.checked)}>
                    Work remotely
                  </Checkbox>
                </Form.Item>

                <Row gutter={16} className="mb-4" align="bottom">
                  <Col xs={24} md={8}>
                    <Form.Item label={<Text strong>State</Text>} className="mb-0">
                      <Select
                        value={selectedState}
                        placeholder="Select state"
                        onChange={handleStateChange}
                        className="w-full"
                        size="large"
                      >
                        {states.map((state) => (
                          <Option key={state.s_id} value={state.s_id}>
                            {state.s_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<Text strong>Cities</Text>} className="mb-0">
                      <Select
                        mode="multiple"
                        value={selectedCities}
                        placeholder={selectedState ? "Select cities" : "First select a state"}
                        className="w-full"
                        size="large"
                        onChange={setSelectedCities}
                        disabled={!selectedState}
                      >
                        {getCitiesForState(selectedState).map((city) => (
                          <Option key={city.cit_id} value={city.cit_id}>
                            {city.cit_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span>&nbsp;</span>} className="mb-0">
                      <button
                        type="button"
                        onClick={addAreaToTable}
                        disabled={!selectedState || selectedCities.length === 0}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-10"
                      >
                        <PlusOutlined className="w-4 h-4" />
                        Add Area
                      </button>
                    </Form.Item>
                  </Col>
                </Row>

                <Table
                  columns={areaColumns}
                  dataSource={areaTableData}
                  pagination={false}
                  locale={{
                    emptyText: "No service areas added yet"
                  }}
                  size="small"
                />

                {isRemote && (
                  <Alert
                    message="Remote Work Enabled"
                    description="You can work with clients worldwide without geographical restrictions."
                    type="success"
                    showIcon
                    className="mt-4"
                  />
                )}
              </div>
            </div>

            {/* Work Details Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                <ClockCircleOutlined className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">Work Details</h3>
              </div>
              <div className="p-4">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="worktime"
                      label="Work Completion Time"
                    >
                      <Select placeholder="Select time" size="large">
                        <Option value="In a Week">In a Week</Option>
                        <Option value="24 Hours">24 Hours</Option>
                        <Option value="After 2 Days">After 2 Days</Option>
                        <Option value="Tomorrow">Tomorrow</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="amountType"
                      label="Payment Terms"
                    >
                      <Select placeholder="Select type" size="large">
                        <Option value="work">Per project/work</Option>
                        <Option value="hour">Hourly Basis</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="amount"
                      label="Standard Rate (INR)"
                    >
                      <Input
                        placeholder="Enter amount"
                        prefix={<span style={{ fontWeight: 600 }}>₹</span>}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>

            {/* ID Verification Card */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                <IdcardOutlined className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">ID Verification</h3>
              </div>
              <div className="p-4">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="idType"
                      label="ID Type"
                    >
                      <Select placeholder="Select ID type" size="large">
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
                      label="ID Number"
                    >
                      <Input placeholder="Enter ID number" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="idFile"
                      label="Upload ID Proof"
                    >
                      <Upload
                        fileList={fileList}
                        beforeUpload={beforeUpload}
                        onChange={handleFileChange}
                        maxCount={1}
                        accept="image/*"
                        listType="picture"
                      >
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <UploadOutlined className="w-4 h-4" />
                          Upload ID Proof
                        </button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Progress and Submit */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Text strong>Completion Progress</Text>
                <Text>{calculateProgress()}%</Text>
              </div>
              <Progress percent={calculateProgress()} strokeColor="#1890ff" />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div></div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading ? 'Saving...' : 'Save Service Details'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
} 