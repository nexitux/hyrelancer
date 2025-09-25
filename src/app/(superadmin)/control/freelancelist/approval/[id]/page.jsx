"use client";
import React, { useState, useEffect } from "react";
import { Tabs, Button, Card, message, Spin } from "antd";
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
  const { id } = params;
  const router = useRouter();
  const [activeKey, setActiveKey] = useState("1");
  const [freelancerData, setFreelancerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // Fetch freelancer data
  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        setLoading(true);
        const decodedId = Base64.decode(id);
        const response = await adminApi.get(`/freelancers/${id}`);
        setFreelancerData(response.data);
      } catch (error) {
        console.error('Error fetching freelancer data:', error);
        message.error('Failed to load freelancer data');
        router.push('/control/freelancelist/approval');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFreelancerData();
    }
  }, [id, router]);

  // Handle approval
  const handleApprove = async () => {
    try {
      setApproving(true);
      await adminApi.patch(`/freelancers/${id}`, { 
        is_active: '1' // Set to approved
      });
      message.success('Freelancer approved successfully!');
      router.push('/control/freelancelist/approval');
    } catch (error) {
      console.error('Error approving freelancer:', error);
      message.error('Failed to approve freelancer');
    } finally {
      setApproving(false);
    }
  };

  // Handle rejection
  const handleReject = async () => {
    try {
      setRejecting(true);
      await adminApi.patch(`/freelancers/${id}`, { 
        is_active: '0' // Set to inactive/rejected
      });
      message.success('Freelancer rejected successfully!');
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
        <div className="flex gap-2 items-center px-2 py-3">
          <UserOutlined className="text-lg" />
          <span>Profile</span>
        </div>
      ),
      children: <ProfileForm freelancerId={id} isApprovalMode={true} />,
    },
    {
      key: "2",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <GlobalOutlined className="text-lg" />
          <span>Service</span>
        </div>
      ),
      children: <Service freelancerId={id} isApprovalMode={true} />,
    },
    {
      key: "3",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <ScheduleOutlined className="text-lg" />
          <span>Career</span>
        </div>
      ),
      children: <Education freelancerId={id} isApprovalMode={true} />,
    },
    {
      key: "4",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <TrophyOutlined className="text-lg" />
          <span>Social Media</span>
        </div>
      ),
      children: <Scoialmedia freelancerId={id} isApprovalMode={true} />,
    },
    {
      key: "5",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <FolderOutlined className="text-lg" />
          <span>Portfolio</span>
        </div>
      ),
      children: <Portfolio freelancerId={id} isApprovalMode={true} />,
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
      <div className="mx-auto max-w-7xl">
        {/* Header with Back Button and Actions */}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/control/freelancelist/approval')}
                type="text"
              >
                Back to Approval List
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Review Freelancer Application
                </h1>
                {freelancerData && (
                  <p className="text-gray-600">
                    {freelancerData.name} - {freelancerData.email}
                  </p>
                )}
              </div>
            </div>
            
            {/* Approval Action Buttons */}
            <div className="flex gap-3">
              <Button 
                type="primary" 
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleReject}
                loading={rejecting}
                size="large"
              >
                Reject Application
              </Button>
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
                loading={approving}
                size="large"
              >
                Approve Freelancer
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          tabPosition="left"
          items={tabItems}
          className="approval-tabs"
          tabBarStyle={{
            width: "220px",
            height: "calc(100vh - 12rem)",
            maxHeight: "calc(100vh - 12rem)",
            backgroundColor: "#3a599c",
            borderRadius: "8px",
            padding: "3px 0",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        />
      </div>

      <style jsx global>{`
        .approval-tabs .ant-tabs-nav {
          margin-right: 0 !important;
          min-width: 220px;
          max-height: calc(100vh - 12rem) !important;
        }

        .approval-tabs .ant-tabs-nav-wrap {
          max-height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }

        .approval-tabs .ant-tabs-nav-list {
          height: auto !important;
          flex-direction: column !important;
        }

        .approval-tabs .ant-tabs-tab {
          height: 60px !important;
          line-height: 60px !important;
          margin: 0 !important;
          transition: all 0.3s ease;
          color: white !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: relative;
          text-align: center;
          white-space: nowrap;
          flex-shrink: 0 !important;
        }

        .approval-tabs .ant-tabs-tab:not(:last-child)::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 16px;
          right: 16px;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .approval-tabs .ant-tabs-tab:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .approval-tabs .ant-tabs-tab-active {
          background-color: #2d4373 !important;
          font-weight: 500 !important;
        }

        .approval-tabs .ant-tabs-tab-btn {
          width: 100% !important;
          color: inherit !important;
        }

        .approval-tabs .ant-tabs-ink-bar {
          display: none !important;
        }

        .approval-tabs .ant-tabs-content-holder {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          margin-left: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          min-height: 600px;
          overflow-y: auto;
        }

        .approval-tabs .ant-tabs-nav::before {
          border-bottom: none !important;
        }

        .approval-tabs .ant-tabs-nav-wrap::-webkit-scrollbar {
          width: 6px;
        }

        .approval-tabs .ant-tabs-nav-wrap::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .approval-tabs .ant-tabs-nav-wrap::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .approval-tabs .ant-tabs-nav-wrap::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}