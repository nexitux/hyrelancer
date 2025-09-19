"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Spin, Alert, Avatar, Tag, Button, Divider, message } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  CalendarOutlined,
  IdcardOutlined,
  EditOutlined,
  HomeOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import Link from 'next/link';

// --- API Configuration ---
const API_BASE_URL = 'https://test.hyrelancer.in/api/admin';

const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
  },
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminToken', token);
    }
  }
};

// --- Status Helper Functions ---
const getStatusInfo = (freelancer) => {
  const isActive = freelancer.is_active;
  const isActiveAcc = freelancer.is_active_acc;
  const isRegiComplete = freelancer.is_regi_complete;
  
  if (isActiveAcc === '0') {
    return { 
      status: 'Blocked', 
      color: 'red',
      icon: <CloseCircleOutlined />
    };
  }
  
  if (isActive === '0') {
    return { 
      status: 'Inactive', 
      color: 'default',
      icon: <CloseCircleOutlined />
    };
  }
  
  if (isActive === '1') {
    return { 
      status: 'Active', 
      color: 'green',
      icon: <CheckCircleOutlined />
    };
  }
  
  if (isActive === '2') {
    if (isRegiComplete === '0') {
      return { 
        status: 'Registration Incomplete', 
        color: 'orange',
        icon: <CloseCircleOutlined />
      };
    }
    return { 
      status: 'Pending Approval', 
      color: 'gold',
      icon: <CheckCircleOutlined />
    };
  }
  
  return { 
    status: 'Unknown', 
    color: 'default',
    icon: <CloseCircleOutlined />
  };
};

const getRegistrationStatusInfo = (status) => {
  switch (status) {
    case '0':
      return { text: 'Incomplete', color: 'orange' };
    case '1':
      return { text: 'Complete', color: 'green' };
    case '2':
      return { text: 'Under Review', color: 'blue' };
    default:
      return { text: 'Unknown', color: 'default' };
  }
};

const FreelancerProfile = () => {
  const params = useParams();
  const router = useRouter();
  const freelancerId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [freelancerData, setFreelancerData] = useState(null);

  useEffect(() => {
    const fetchFreelancerData = async () => {
      if (!freelancerId) {
        setError('No freelancer ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const token = TokenManager.getToken();
        if (!token) {
          message.error('Authentication token not found. Please login again.');
          TokenManager.removeToken();
          router.push('/gateway');
          return;
        }

        console.log('Fetching freelancer data for ID:', freelancerId);
        console.log('API URL:', `${API_BASE_URL}/freelancers/${freelancerId}`);

        const response = await fetch(`${API_BASE_URL}/freelancers/${freelancerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.status === 401) {
          message.error('Authentication failed. Please login again.');
          TokenManager.removeToken();
          router.push('/gateway');
          return;
        }

        if (response.status === 404) {
          setError('Freelancer not found');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
          }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log('Response data:', responseData);

        // Handle the API response structure - data is wrapped in 'data' property
        if (responseData.data) {
          setFreelancerData(responseData.data);
          
          // Update token if provided
          if (responseData.token) {
            TokenManager.setToken(responseData.token);
          }
        } else if (responseData.id) {
          // Fallback in case data is not wrapped
          setFreelancerData(responseData);
        } else {
          throw new Error('Invalid response format');
        }
        
      } catch (err) {
        console.error('Error fetching freelancer:', err);
        const errorMessage = err.message || 'Failed to load freelancer data';
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, [freelancerId, router]);

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/control/freelancelist/freelancerEdit/${freelancerId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" tip="Loading freelancer data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Button 
          onClick={handleBack} 
          className="mb-4"
          icon={<ArrowLeftOutlined />}
        >
          Back to Freelancers
        </Button>
        <Alert 
          message="Error Loading Data" 
          description={error} 
          type="error" 
          showIcon 
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!freelancerData) {
    return (
      <div className="p-4 md:p-8">
        <Button 
          onClick={handleBack} 
          className="mb-4"
          icon={<ArrowLeftOutlined />}
        >
          Back to Freelancers
        </Button>
        <Alert 
          message="Not Found" 
          description="Freelancer data could not be found." 
          type="warning" 
          showIcon 
        />
      </div>
    );
  }

  const statusInfo = getStatusInfo(freelancerData);
  const registrationInfo = getRegistrationStatusInfo(freelancerData.is_regi_complete);

  return (
    <div className="p-4 min-h-screen bg-gray-50 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button and Header */}
        <div className="mb-6">
          <Button 
            onClick={handleBack} 
            className="mb-4"
            icon={<ArrowLeftOutlined />}
          >
            Back to Freelancers
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Freelancer Profile</h1>
          <p className="text-gray-600 mt-2">View and manage freelancer information</p>
        </div>

        <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
          {/* Profile Header */}
          <div className="relative px-6 pt-10 pb-12 text-center bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              className="border-4 border-white shadow-xl bg-purple-500"
            />
            <h2 className="mt-4 mb-2 text-2xl font-bold text-white drop-shadow-lg">
              {freelancerData.name || 'N/A'}
            </h2>
            <p className="text-lg font-medium text-purple-100">{freelancerData.user_type || 'Freelancer'}</p>
            <div className="flex absolute -bottom-9 left-1/2 space-x-3 transform -translate-x-1/2">
              <Button
                icon={<EditOutlined />}
                className="flex gap-1 items-center px-4 py-2 text-purple-600 bg-white rounded-lg border-none shadow-md transition-all hover:bg-gray-100 hover:scale-105"
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button 
                icon={<MessageOutlined />}
                className="flex gap-1 items-center px-4 py-2 text-white bg-green-600 rounded-lg border-none shadow-md transition-all hover:bg-green-700 hover:scale-105"
              >
                Message
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 mt-4">
            {/* Status Tags */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Tag 
                color={statusInfo.color} 
                icon={statusInfo.icon}
                className="px-3 py-1 text-sm font-medium"
              >
                Status: {statusInfo.status}
              </Tag>
              <Tag 
                color={registrationInfo.color} 
                icon={freelancerData.is_regi_complete === '1' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-1 text-sm font-medium"
              >
                Registration: {registrationInfo.text}
              </Tag>
              <Tag 
                color={freelancerData.is_active_acc === '1' ? 'green' : 'red'} 
                icon={freelancerData.is_active_acc === '1' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-1 text-sm font-medium"
              >
                Account: {freelancerData.is_active_acc === '1' ? 'Active' : 'Blocked'}
              </Tag>
            </div>

            <Divider />

            {/* Information Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <InfoItem 
                    icon={<MailOutlined />} 
                    label="Email Address" 
                    value={freelancerData.email}
                    verified={freelancerData.email_verified_at}
                  />
                  <InfoItem 
                    icon={<PhoneOutlined />} 
                    label="Mobile Number" 
                    value={freelancerData.mobile}
                    verified={freelancerData.mobile_verified_at}
                  />
                  <InfoItem 
                    icon={<HomeOutlined />} 
                    label="Address" 
                    value={freelancerData.address || 'Not provided'} 
                  />
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Account Details
                </h3>
                <div className="space-y-4">
                  <InfoItem 
                    icon={<IdcardOutlined />} 
                    label="Freelancer ID" 
                    value={`#${freelancerData.id}`} 
                  />
                  <InfoItem 
                    icon={<UserOutlined />} 
                    label="Username" 
                    value={freelancerData.username} 
                  />
                  <InfoItem 
                    icon={<CalendarOutlined />} 
                    label="Member Since" 
                    value={formatDate(freelancerData.created_at)} 
                  />
                  <InfoItem 
                    icon={<CalendarOutlined />} 
                    label="Last Updated" 
                    value={formatDate(freelancerData.updated_at)} 
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <Divider />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">Account Type</p>
                  <p className="text-gray-800 font-medium">{freelancerData.user_type || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <p className="text-gray-800 font-medium">{freelancerData.is_status || 'N/A'}</p>
                </div>
                {freelancerData.google_id && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 font-medium">Google Account</p>
                    <p className="text-gray-800 font-medium">Connected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Enhanced InfoItem Component ---
const InfoItem = ({ icon, label, value, verified }) => (
  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
    <div className="flex justify-center items-center mr-4 w-10 h-10 text-gray-600 bg-gray-100 rounded-full">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-gray-800 font-medium">{value || 'Not provided'}</p>
        {verified && (
          <Tag color="green" size="small">
            <CheckCircleOutlined className="mr-1" />
            Verified
          </Tag>
        )}
      </div>
    </div>
  </div>
);

export default FreelancerProfile;