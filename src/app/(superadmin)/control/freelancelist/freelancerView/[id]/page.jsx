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
import FreelancerAssignedJobsModal from '../../components/FreelancerAssignedJobsModal';
import FreelancerAppliedJobsModal from '../../components/FreelancerAppliedJobsModal';

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

  // Modal states for assigned and applied jobs
  const [isAssignedModalOpen, setIsAssignedModalOpen] = useState(false);
  const [isAppliedModalOpen, setIsAppliedModalOpen] = useState(false);

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

  const openAssignedJobsModal = () => {
    setIsAssignedModalOpen(true);
  };

  const closeAssignedJobsModal = () => {
    setIsAssignedModalOpen(false);
  };

  const openAppliedJobsModal = () => {
    setIsAppliedModalOpen(true);
  };

  const closeAppliedJobsModal = () => {
    setIsAppliedModalOpen(false);
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
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Freelancer Profile</h1>
          <p className="text-gray-600 mt-2">View and manage freelancer information</p>
        </div>

        <Card className="overflow-hidden rounded-xl border-0 shadow-lg">
          {/* Compact Profile Header */}
          <div className="px-6 py-6 bg-gradient-to-r from-slate-700 to-slate-800">
            <div className="flex items-center space-x-4">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                className="border-2 border-white shadow-lg bg-slate-600"
              />
              <div className="flex-1 ml-4">
                <h2 className="text-xl font-bold text-white">
                  {freelancerData.name || 'N/A'}
                </h2>
                <p className="text-slate-200 text-sm">{freelancerData.user_type || 'Freelancer'}</p>
                {/* <div className="mt-2">
                  <Tag 
                    color={statusInfo.color} 
                    icon={statusInfo.icon}
                    className="text-xs"
                  >
                    {statusInfo.status}
                  </Tag>
                </div> */}
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex flex-wrap gap-3">
              <Button
                icon={<EditOutlined />}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-0 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
              <Button 
                icon={<MessageOutlined />}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white border-0 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Messages
              </Button>
              <Button 
                icon={<IdcardOutlined />}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white border-0 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                onClick={openAssignedJobsModal}
              >
                Assigned Jobs
              </Button>
              <Button 
                icon={<CalendarOutlined />}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white border-0 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                onClick={openAppliedJobsModal}
              >
                Applied Jobs
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">

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

      {/* Assigned Jobs Modal */}
      <FreelancerAssignedJobsModal
        isOpen={isAssignedModalOpen}
        onClose={closeAssignedJobsModal}
        freelancerId={freelancerData?.id}
      />
      
      {/* Applied Jobs Modal */}
      <FreelancerAppliedJobsModal
        isOpen={isAppliedModalOpen}
        onClose={closeAppliedJobsModal}
        freelancer={freelancerData}
      />
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