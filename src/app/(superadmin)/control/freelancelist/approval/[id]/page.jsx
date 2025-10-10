"use client";
import React, { useState, useEffect, use } from "react";
import { Tabs, Button, Card, message, Spin, Badge, Space } from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  ToolOutlined,
  ScheduleOutlined,
  GlobalOutlined,
  TrophyOutlined,
  FolderOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Base64 } from 'js-base64';
import adminApi from '@/config/adminApi';

// Import your existing components from the freelancerEdit folder
import ProfileForm from "../[id]/components/ProfileForm";
import Service from "../[id]/components/service-free";
import Education from "../[id]/components/Education";
import Scoialmedia from "../[id]/components/Socialmedia";
import Portfolio from "../[id]/components/portfolio";

export default function FreelancerApprovalPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [activeKey, setActiveKey] = useState("1");
  const [freelancerData, setFreelancerData] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [tabData, setTabData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState({});
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Fetch initial freelancer data and approval status
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await adminApi.get(`/getFeUProfile/${id}`);
        setFreelancerData(response.data.u_profile);
        setApprovalStatus(response.data.u_approval);
        
        // Pre-load first tab data
        await loadTabData('1');
      } catch (error) {
        console.error('Error fetching freelancer data:', error);
        message.error('Failed to load freelancer data');
        router.push('/control/freelancelist/approval');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInitialData();
    }
  }, [id, router]);

  // Load tab-specific data
  const loadTabData = async (tabKey) => {
    if (tabData[tabKey]) return; // Already loaded

    try {
      setTabLoading(prev => ({ ...prev, [tabKey]: true }));
      
      const apiEndpoints = {
        '1': `/getFeUProfile/${id}`,
        '2': `/getFeUService/${id}`,
        '3': `/getFeUProfessional/${id}`,
        '4': `/getFeUsocial/${id}`,
        '5': `/getFeUPortfolio/${id}`
      };

      const response = await adminApi.get(apiEndpoints[tabKey]);
      setTabData(prev => ({ ...prev, [tabKey]: response.data }));
    } catch (error) {
      console.error(`Error loading tab ${tabKey} data:`, error);
      message.error(`Failed to load ${getTabName(tabKey)} data`);
    } finally {
      setTabLoading(prev => ({ ...prev, [tabKey]: false }));
    }
  };

  // Get tab name for error messages
  const getTabName = (tabKey) => {
    const names = {
      '1': 'Profile',
      '2': 'Service',
      '3': 'Career',
      '4': 'Social Media',
      '5': 'Portfolio'
    };
    return names[tabKey] || 'Unknown';
  };

  // Check if tab is approved
  const isTabApproved = (tabKey) => {
    if (!approvalStatus) return false;
    return approvalStatus[`fa_tab_${tabKey}_app`] === "1";
  };

  // Handle tab change with lazy loading
  const handleTabChange = async (key) => {
    setActiveKey(key);
    await loadTabData(key);
  };

  // Handle tab-specific approval
  const handleTabApprove = async (tabKey) => {
    try {
      setApproving(true);
      
      // Backend expects GET with path params: /approveFeUTabData/{type}/{base64UserId}
      const response = await adminApi.get(`/approveFeUTabData/${tabKey}/${id}`);
      
      message.success(`${getTabName(tabKey)} section approved successfully!`);
      
      // Refresh approval status to update UI
      const updatedResponse = await adminApi.get(`/getFeUProfile/${id}`);
      setApprovalStatus(updatedResponse.data.u_approval);
      
    } catch (error) {
      console.error('Error approving tab:', error);
      
      let errorMessage = 'Failed to approve section';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 500) {
        errorMessage = `Server error (500) for tab ${tabKey}. Check server logs for details.`;
      }
      
      message.error(errorMessage);
    } finally {
      setApproving(false);
    }
  };

  // Handle complete rejection
  const handleReject = async () => {
    try {
      setRejecting(true);
      await adminApi.patch(`/freelancers/${id}`, { 
        is_active: '0' // Set to inactive/rejected
      });
      message.success('Freelancer application rejected!');
      router.push('/control/freelancelist/approval');
    } catch (error) {
      console.error('Error rejecting freelancer:', error);
      message.error('Failed to reject freelancer');
    } finally {
      setRejecting(false);
    }
  };

  const tabItems = [
    {
      key: "1",
      label: (
        <Space>
          <UserOutlined />
          <span>Profile</span>
        </Space>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Profile Information</h3>
              <p className="text-sm text-gray-600">Review freelancer's basic profile details</p>
            </div>
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTabApprove('1')}
              loading={approving}
              disabled={isTabApproved('1')}
              className={isTabApproved('1') 
                ? "bg-gray-400 border-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              }
            >
              {isTabApproved('1') ? 'Approved' : 'Approve Profile'}
            </Button>
          </div>
          {tabLoading['1'] ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <ProfileForm freelancerId={id} isApprovalMode={true} />
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <Space>
          <GlobalOutlined />
          <span>Service</span>
        </Space>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Service Details</h3>
              <p className="text-sm text-gray-600">Review services offered and pricing information</p>
            </div>
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTabApprove('2')}
              loading={approving}
              disabled={isTabApproved('2')}
              className={isTabApproved('2') 
                ? "bg-gray-400 border-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              }
            >
              {isTabApproved('2') ? 'Approved' : 'Approve Service'}
            </Button>
          </div>
          {tabLoading['2'] ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Service freelancerId={id} isApprovalMode={true} />
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <Space>
          <ScheduleOutlined />
          <span>Career</span>
        </Space>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Career Information</h3>
              <p className="text-sm text-gray-600">Review education, experience and certifications</p>
            </div>
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTabApprove('3')}
              loading={approving}
              disabled={isTabApproved('3')}
              className={isTabApproved('3') 
                ? "bg-gray-400 border-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              }
            >
              {isTabApproved('3') ? 'Approved' : 'Approve Career'}
            </Button>
          </div>
          {tabLoading['3'] ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Education freelancerId={id} isApprovalMode={true} />
          )}
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <Space>
          <TrophyOutlined />
          <span>Social Media</span>
        </Space>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Social Media Links</h3>
              <p className="text-sm text-gray-600">Review social media profiles and website links</p>
            </div>
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTabApprove('4')}
              loading={approving}
              disabled={isTabApproved('4')}
              className={isTabApproved('4') 
                ? "bg-gray-400 border-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              }
            >
              {isTabApproved('4') ? 'Approved' : 'Approve Social Media'}
            </Button>
          </div>
          {tabLoading['4'] ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Scoialmedia freelancerId={id} isApprovalMode={true} />
          )}
        </div>
      ),
    },
    {
      key: "5",
      label: (
        <Space>
          <FolderOutlined />
          <span>Portfolio</span>
        </Space>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Portfolio & Skills</h3>
              <p className="text-sm text-gray-600">Review portfolio items and skill listings</p>
            </div>
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTabApprove('5')}
              loading={approving}
              disabled={isTabApproved('5')}
              className={isTabApproved('5') 
                ? "bg-gray-400 border-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              }
            >
              {isTabApproved('5') ? 'Approved' : 'Approve Portfolio'}
            </Button>
          </div>
          {tabLoading['5'] ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <Portfolio freelancerId={id} isApprovalMode={true} />
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-6">

          {/* Main Header Card */}
          <Card className="shadow-sm border-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Title and Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800 m-0">
                    Review Freelancer Application
                  </h1>
                  <Badge 
                    status="processing" 
                    text="Pending Review" 
                    className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-sm"
                  />
                </div>
                {freelancerData && (
                  <div className="text-gray-600">
                    <p className="m-0 text-lg font-medium">{freelancerData.name}</p>
                    <p className="m-0 text-sm">{freelancerData.email}</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons intentionally removed for display-only view */}
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Card className="shadow-sm border-0">
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            items={tabItems}
            className="approval-tabs-horizontal"
            size="large"
          />
        </Card>
      </div>

      <style jsx global>{`
        .approval-tabs-horizontal {
          margin: 0 !important;
        }

        .approval-tabs-horizontal .ant-tabs-nav {
          margin: 0 !important;
          padding: 0 !important;
        }

        .approval-tabs-horizontal .ant-tabs-nav-wrap {
          padding: 0 !important;
        }

        .approval-tabs-horizontal .ant-tabs-nav-list {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          display: flex !important;
        }

        .approval-tabs-horizontal .ant-tabs-tab {
          padding: 12px 24px !important;
          margin: 0 !important;
          font-weight: 500 !important;
          color: #64748b !important;
          border-radius: 8px 8px 0 0 !important;
          transition: all 0.2s ease !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-bottom: none !important;
          border-right: none !important;
          position: relative !important;
          flex: 1 !important;
          text-align: center !important;
          justify-content: center !important;
        }

        .approval-tabs-horizontal .ant-tabs-tab:last-child {
          border-right: 1px solid #e2e8f0 !important;
        }

        .approval-tabs-horizontal .ant-tabs-tab:first-child {
          border-radius: 8px 0 0 0 !important;
        }

        .approval-tabs-horizontal .ant-tabs-tab:last-child {
          border-radius: 0 8px 0 0 !important;
        }

        .approval-tabs-horizontal .ant-tabs-tab:hover {
          color: #3b82f6 !important;
          background: #f1f5f9 !important;
        }

        .approval-tabs-horizontal .ant-tabs-tab-active {
          color: #3b82f6 !important;
          background: white !important;
          border-color: #e2e8f0 !important;
          border-bottom: 1px solid white !important;
          z-index: 1 !important;
        }

        .approval-tabs-horizontal .ant-tabs-nav::before {
          border-bottom: 1px solid #e2e8f0 !important;
          position: absolute !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          content: '' !important;
        }

        .approval-tabs-horizontal .ant-tabs-content-holder {
          margin-top: 0 !important;
          padding: 24px !important;
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-top: none !important;
          border-radius: 0 0 8px 8px !important;
        }

        .approval-tabs-horizontal .ant-tabs-ink-bar {
          display: none !important;
        }

        .approval-tabs-horizontal .ant-tabs-tab-btn {
          color: inherit !important;
        }

        /* Remove extra spacing */
        .approval-tabs-horizontal .ant-tabs-content {
          margin-top: 0 !important;
        }

        /* Custom Badge Styling */
        .ant-badge-status-dot {
          display: none !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .approval-tabs-horizontal .ant-tabs-tab {
            padding: 8px 16px !important;
            margin-right: 4px !important;
            font-size: 14px !important;
          }

          .approval-tabs-horizontal .ant-tabs-content-holder {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}