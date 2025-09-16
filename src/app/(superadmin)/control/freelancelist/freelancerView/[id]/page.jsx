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
  HomeOutlined
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
  }
};

const FreelancerProfile = () => {
  const params = useParams();
  const router = useRouter();
  const freelancerId = params.id; // Assuming the URL is /.../freelancers/[id]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [freelancerData, setFreelancerData] = useState(null);

  useEffect(() => {
    const fetchFreelancerData = async () => {
      if (!freelancerId) return;

      try {
        setLoading(true);
        setError(null);
        
        const token = TokenManager.getToken();
        if (!token) {
          TokenManager.removeToken();
          router.push('/gateway'); // Redirect to login if no token
          return;
        }

        const response = await fetch(`${API_BASE_URL}/freelancers/${freelancerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (response.status === 401) {
          TokenManager.removeToken();
          router.push('/gateway');
          return;
        }

        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || `Failed to fetch freelancer data`);
        }

        const data = await response.json();
        setFreelancerData(data);
        
      } catch (err) {
        console.error('Error fetching freelancer:', err);
        setError(err.message || 'Failed to load freelancer data');
        message.error(err.message || 'Failed to load freelancer data');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, [freelancerId, router]);

  // --- Helper Functions ---
  const getStatusColor = (status) => (status === '1' ? 'green' : 'red');
  const getStatusText = (status) => (status === '1' ? 'Active' : 'Inactive');
  const getCompletionStatusText = (status) => (status === '1' ? 'Complete' : 'Incomplete');
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
        />
      </div>
    );
  }

  if (!freelancerData) {
    return (
      <div className="p-4 md:p-8">
        <Alert 
          message="Not Found" 
          description="Freelancer could not be found." 
          type="warning" 
          showIcon 
        />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button and Header */}
        <div className="mb-6">
          <Button onClick={() => router.back()} className="mb-4">
            ← Back to Freelancers
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Freelancer Profile</h1>
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
            <p className="text-lg font-medium text-purple-100">{freelancerData.user_type}</p>
             <div className="flex absolute -bottom-9 left-1/2 space-x-3 transform -translate-x-1/2">
                <Button
                  icon={<EditOutlined />}
                  className="flex gap-1 items-center px-4 py-2 text-purple-600 bg-white rounded-lg border-none shadow-md transition-all hover:bg-gray-100 hover:scale-105"
                  // onClick={() => router.push(`/path/to/edit-freelancer/${freelancerId}`)}
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
                color={getStatusColor(freelancerData.is_active)} 
                icon={freelancerData.is_active === '1' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-1 text-sm font-medium"
              >
                Account: {getStatusText(freelancerData.is_active)}
              </Tag>
              <Tag 
                color={getStatusColor(freelancerData.is_regi_complete)} 
                icon={freelancerData.is_regi_complete === '1' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-1 text-sm font-medium"
              >
                Registration: {getCompletionStatusText(freelancerData.is_regi_complete)}
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
                  <InfoItem icon={<MailOutlined />} label="Email Address" value={freelancerData.email} />
                  <InfoItem icon={<PhoneOutlined />} label="Mobile Number" value={freelancerData.mobile} />
                  <InfoItem icon={<HomeOutlined />} label="Address" value={freelancerData.address} />
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Account Details
                </h3>
                <div className="space-y-4">
                   <InfoItem icon={<IdcardOutlined />} label="Freelancer ID" value={`#${freelancerData.id}`} />
                   <InfoItem icon={<UserOutlined />} label="Username" value={freelancerData.username} />
                   <InfoItem icon={<CalendarOutlined />} label="Member Since" value={formatDate(freelancerData.created_at)} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Reusable InfoItem Component for cleaner code ---
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
    <div className="flex justify-center items-center mr-4 w-10 h-10 text-gray-600 bg-gray-100 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-gray-800 font-medium">{value || 'Not provided'}</p>
    </div>
  </div>
);

export default FreelancerProfile;