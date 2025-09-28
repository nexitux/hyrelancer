"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  Button,
  message,
  Alert,
  Spin
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  LeftOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import adminApi from "@/config/adminApi";

const { Text, Title } = Typography;

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

export default function ServiceDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const userIdBase64 = params?.id ? decodeURIComponent(params.id) : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listingData, setListingData] = useState(null);
  const [serviceTableData, setServiceTableData] = useState([]);
  const [areaTableData, setAreaTableData] = useState([]);

  // Helper functions to get names from IDs
  const getServiceTypeName = (id, serviceTypes = []) => {
    const serviceType = serviceTypes.find(st => st.sc_id == id);
    return serviceType ? serviceType.sc_name : `Service Type #${id}`;
  };

  const getServiceName = (id, allServices = [], serviceData = null) => {
    if (serviceData && serviceData.se_name) {
      return serviceData.se_name;
    }
    const service = allServices.find(s => s.se_id == id);
    return service ? service.se_name : `Service #${id}`;
  };

  const getStateName = (id, states = []) => {
    const state = states.find(s => s.s_id == id);
    return state ? state.s_name : `State #${id}`;
  };

  const getCityName = (id, cities = [], cityData = null) => {
    if (cityData && cityData.cit_name) {
      return cityData.cit_name;
    }
    const city = cities.find(c => c.cit_id == id);
    return city ? city.cit_name : `City #${id}`;
  };

  const formatImageUrl = (url) => {
    if (!url) return null;
    const cleanUrl = url.split("--")[0];
    if (!cleanUrl.startsWith('http')) {
      return `https://test.hyrelancer.in/${cleanUrl.replace(/^\/+/, "")}`;
    }
    return cleanUrl;
  };

  // Fetch dropdown data (states, cities, service types, services)
  const fetchDropdownData = async () => {
    try {
      const [stateResponse, categoryResponse] = await Promise.all([
        fetch('https://test.hyrelancer.in/api/getStatelist'),
        fetch('https://test.hyrelancer.in/api/getCategorylist')
      ]);

      if (!stateResponse.ok || !categoryResponse.ok) {
        throw new Error('Failed to fetch dropdown data');
      }

      const [stateData, categoryData] = await Promise.all([
        stateResponse.json(),
        categoryResponse.json()
      ]);

      return {
        states: stateData.state || [],
        cities: stateData.city || [],
        serviceTypes: categoryData.sc_list || [],
        allServices: categoryData.se_list || []
      };
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      return {
        states: [],
        cities: [],
        serviceTypes: [],
        allServices: []
      };
    }
  };

  // Process data for display
  const processDataForDisplay = (data, dropdownData) => {
    const { serviceTypes, allServices, states, cities } = dropdownData;

    // Process service data
    const processedServiceData = [];
    if (data.se_sub_cate_list && Array.isArray(data.se_sub_cate_list) &&
        data.se_service_list && Array.isArray(data.se_service_list)) {
      
      data.se_sub_cate_list.forEach(category => {
        if (category && category.frs_sc_id) {
          const categoryServices = data.se_service_list.filter(
            service => service && service.frs_sc_id === category.frs_sc_id
          );

          if (categoryServices.length > 0) {
            processedServiceData.push({
              key: category.frs_sc_id,
              serviceType: category.frs_sc_id,
              services: categoryServices.map(service => ({
                se_id: service.frs_se_id,
                se_name: service.se_name,
                ...service
              }))
            });
          }
        }
      });
    }

    // Process area data
    const processedAreaData = [];
    if (data.se_state_list && Array.isArray(data.se_state_list) &&
        data.se_city_list && Array.isArray(data.se_city_list)) {
      
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
                cit_name: city.cit_name,
                ...city
              }))
            });
          }
        }
      });
    }

    return {
      serviceTableData: processedServiceData,
      areaTableData: processedAreaData,
      serviceTypes,
      allServices,
      states,
      cities
    };
  };

  // Fetch user service data
  const fetchUserServiceData = async () => {
    if (!userIdBase64) {
      setError("Missing user ID in route");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch both dropdown data and user data in parallel
      const [dropdownData, userResponse] = await Promise.all([
        fetchDropdownData(),
        adminApi.get(`/getFeUService/${userIdBase64}`)
      ]);

      const userData = userResponse.data;

      if (!userData) {
        throw new Error("No data received from server");
      }

      // Check if user has meaningful data
      const hasValidData = userData.se_sub_cate_list?.length > 0 || 
                          userData.se_service_list?.length > 0 ||
                          userData.se_state_list?.length > 0 ||
                          userData.u_profile ||
                          userData.fe_idproof_data;

      if (!hasValidData) {
        setError("No service data found for this user");
        setLoading(false);
        return;
      }

      // Process the data for display
      const processedData = processDataForDisplay(userData, dropdownData);
      
      setListingData(userData);
      setServiceTableData(processedData.serviceTableData);
      setAreaTableData(processedData.areaTableData);

    } catch (err) {
      console.error('Error fetching user service data:', err);
      
      if (err.response?.status === 401) {
        TokenManager.clearToken();
        setError("Unauthorized. Redirecting to login...");
        setTimeout(() => router.push("/admin/login"), 2000);
        return;
      }

      setError(err.message || "Failed to load service data");
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchUserServiceData();
  }, [userIdBase64]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
            <div className="ml-4">
              <p className="text-gray-600 mb-2">Loading service details...</p>
              <p className="text-sm text-gray-500">This may take a moment</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Alert
              message="Error Loading Data"
              description={error}
              type="error"
              showIcon
              className="max-w-md mx-auto"
            />
            <Button
              onClick={fetchUserServiceData}
              type="primary"
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!listingData) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Alert
              message="No Service Data"
              description="This user hasn't set up any service information yet."
              type="info"
              showIcon
              className="max-w-md mx-auto"
            />
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <EyeOutlined className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Title level={2} className="!mb-1">Service Details</Title>
              <Text type="secondary">View and manage service information</Text>
            </div>
          </div>
          
        </div>

        <div className="p-6">
          {/* Services Section */}
          {serviceTableData.length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <GlobalOutlined className="text-blue-500" />
                  <span>Services Offered</span>
                </div>
              } 
              className="mb-6"
            >
              {serviceTableData.map((group, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <Title level={4} className="text-blue-600 mb-3">
                    {getServiceTypeName(group.serviceType, listingData.sc_list || [])}
                  </Title>
                  <Space wrap size="small">
                    {group.services.map((serv, idx) => (
                      <Tag key={idx} color="blue" className="text-sm py-1 px-2">
                        {getServiceName(serv.se_id, listingData.se_list || [], serv)}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ))}
            </Card>
          )}

          {/* Service Areas Section */}
          {areaTableData.length > 0 && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-green-500" />
                  <span>Service Areas</span>
                </div>
              } 
              className="mb-6"
            >
              {areaTableData.map((group, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <Title level={4} className="text-green-600 mb-3">
                    {getStateName(group.state, listingData.state || [])}
                  </Title>
                  <Space wrap size="small">
                    {group.cities.map((city, idx) => (
                      <Tag key={idx} color="green" className="text-sm py-1 px-2">
                        {getCityName(city.cit_id, listingData.city || [], city)}
                      </Tag>
                    ))}
                  </Space>
                </div>
              ))}
            </Card>
          )}

          {/* Professional Details Section */}
          {listingData.u_profile && (
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-orange-500" />
                  <span>Professional Details</span>
                </div>
              } 
              className="mb-6"
            >
              <Row gutter={[24, 16]}>
                {listingData.u_profile.fp_completing_time && (
                  <Col xs={24} md={8}>
                    <div className="p-4 bg-gray-50 rounded-lg h-full">
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
                    <div className="p-4 bg-gray-50 rounded-lg h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <GlobalOutlined className="text-gray-500" />
                        <Text strong>Payment Type</Text>
                      </div>
                      <Text className="capitalize">{listingData.u_profile.fp_amount_for}</Text>
                    </div>
                  </Col>
                )}
                {listingData.u_profile.fp_amt_hour && listingData.u_profile.fp_amt_hour !== "0" && (
                  <Col xs={24} md={8}>
                    <div className="p-4 bg-gray-50 rounded-lg h-full">
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
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <IdcardOutlined className="text-purple-500" />
                  <span>ID Verification</span>
                </div>
              } 
              className="mb-6"
            >
              <Row gutter={[24, 16]}>
                {listingData.fe_idproof_data.fi_type && (
                  <Col xs={24} md={12}>
                    <div className="p-4 bg-gray-50 rounded-lg h-full">
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
                    <div className="p-4 bg-gray-50 rounded-lg h-full">
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }} className="text-gray-500 italic">
                          Image not available or failed to load
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          )}

          {/* Empty state if no data sections */}
          {serviceTableData.length === 0 && 
           areaTableData.length === 0 && 
           !listingData.u_profile && 
           !listingData.fe_idproof_data && (
            <div className="text-center py-8">
              <Alert
                message="No Service Information"
                description="This user hasn't provided any service details yet."
                type="info"
                showIcon
                className="max-w-md mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}