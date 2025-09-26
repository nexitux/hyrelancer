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
  EditOutlined
} from "@ant-design/icons";
import Link from 'next/link';
import adminApi from '@/config/adminApi';

// Using centralized adminApi config

const CustomerProfile = () => {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminApi.get(`/customers/${customerId}`);
        const data = response.data?.data || response.data;
        setCustomerData(data);
        
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError(err.message || 'Failed to load customer data');
        message.error('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId, router]);

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case '1': return 'green';
      case '0': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case '1': return 'Active';
      case '0': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const getAccountStatusText = (status) => {
    switch (status) {
      case '1': return 'Complete';
      case '0': return 'Incomplete';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      <div className="p-4">
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          action={
            <Button size="small" danger onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="p-4">
        <Alert 
          message="Not Found" 
          description="Customer not found" 
          type="warning" 
          showIcon 
          action={
            <Button size="small" onClick={() => router.back()}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            onClick={() => router.back()} 
            className="mb-4"
          >
            ← Back to Customers
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Customer Profile</h1>
        </div>

        <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
          {/* Header Section */}
          <div className="relative px-6 pt-10 pb-12 text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
            <div className="flex relative justify-center">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                className="border-4 border-white shadow-xl bg-blue-500"
              />

              {/* Action Buttons */}
              <div className="flex absolute -bottom-8 left-1/2 space-x-3 transform -translate-x-1/2">
              <Link href={`/control/customerlist/editCustomer/${customerId}`}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  className="flex gap-1 items-center px-4 py-2 text-blue-600 bg-white rounded-lg border-none shadow-md transition-all hover:bg-gray-100 hover:scale-105"
                  onClick={() => message.info('Edit functionality coming soon')}
                >
                  Edit
                </Button>
                </Link>
                <Link href={`/control/customerlist/message`}>
                  <Button 
                    icon={<MessageOutlined />}
                    size="small"
                    className="flex gap-1 items-center px-4 py-2 text-white bg-green-600 rounded-lg border-none shadow-md transition-all hover:bg-green-700 hover:scale-105"
                  >
                    Message
                  </Button>
                </Link>
              </div>
            </div>

            <h2 className="mt-12 mb-2 text-2xl font-bold text-white drop-shadow-lg">
              {customerData.name || 'N/A'}
            </h2>
            <p className="text-lg font-medium text-blue-100">Customer</p>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Status Tags */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Tag 
                color={getStatusColor(customerData.is_active)} 
                icon={customerData.is_active === '1' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-1 text-sm font-medium"
              >
                Account: {getStatusText(customerData.is_active)}
              </Tag>
              <Tag 
                color={getStatusColor(customerData.is_active_acc)} 
                icon={customerData.is_active_acc === '1' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-1 text-sm font-medium"
              >
                Profile: {getAccountStatusText(customerData.is_active_acc)}
              </Tag>
              <Tag 
                color={getStatusColor(customerData.is_regi_complete)} 
                icon={customerData.is_regi_complete === '1' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-1 text-sm font-medium"
              >
                Registration: {getAccountStatusText(customerData.is_regi_complete)}
              </Tag>
              <Tag 
                color={customerData.is_status === 'new' ? 'blue' : 'default'}
                className="px-3 py-1 text-sm font-medium"
              >
                Status: {customerData.is_status === 'new' ? 'New Customer' : 'Existing Customer'}
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
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center items-center mr-4 w-10 h-10 text-blue-600 bg-blue-100 rounded-full">
                      <MailOutlined />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email Address</p>
                      <p className="text-gray-800 font-medium">{customerData.email || 'Not provided'}</p>
                      {customerData.email_verified_at && (
                        <Tag color="green" size="small" className="mt-1">Verified</Tag>
                      )}
                    </div>
                  </div>

                  {customerData.mobile && (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-center items-center mr-4 w-10 h-10 text-green-600 bg-green-100 rounded-full">
                        <PhoneOutlined />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Mobile Number</p>
                        <p className="text-gray-800 font-medium">{customerData.mobile}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center items-center mr-4 w-10 h-10 text-purple-600 bg-purple-100 rounded-full">
                      <IdcardOutlined />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Customer ID</p>
                      <p className="text-gray-800 font-medium">#{customerData.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Account Details
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <CalendarOutlined className="mr-2 text-blue-600" />
                      <span className="text-sm text-gray-500 font-medium">Member Since</span>
                    </div>
                    <p className="text-gray-800 font-medium ml-6">{formatDate(customerData.created_at)}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <CalendarOutlined className="mr-2 text-green-600" />
                      <span className="text-sm text-gray-500 font-medium">Last Updated</span>
                    </div>
                    <p className="text-gray-800 font-medium ml-6">{formatDate(customerData.updated_at)}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <UserOutlined className="mr-2 text-orange-600" />
                      <span className="text-sm text-gray-500 font-medium">User Type</span>
                    </div>
                    <p className="text-gray-800 font-medium ml-6">{customerData.user_type}</p>
                  </div>

                  {customerData.email_verified_at && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-3">
                        <CheckCircleOutlined className="mr-2 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Email Verified</span>
                      </div>
                      <p className="text-green-800 font-medium ml-6">{formatDate(customerData.email_verified_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Notes Section */}
            {/* <Divider /> */}
            {/* <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Account Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{customerData.is_active === '1' ? 'Active' : 'Inactive'}</p>
                  <p className="text-sm text-gray-600">Account Status</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{customerData.is_regi_complete === '1' ? 'Complete' : 'Incomplete'}</p>
                  <p className="text-sm text-gray-600">Registration</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{customerData.is_status === 'new' ? 'New' : 'Existing'}</p>
                  <p className="text-sm text-gray-600">Customer Type</p>
                </div>
              </div>
            </div> */}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;