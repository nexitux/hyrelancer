"use client";
import React, { useState } from "react";
import { Form, Input, Button, Row, Col, Tabs } from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  ToolOutlined,
  ScheduleOutlined,
  GlobalOutlined,
  ClusterOutlined,
  GraduationCapOutlined,
  TrophyOutlined,
  FolderOutlined,
  LockOutlined,
} from "@ant-design/icons";

// Import tab content components
import BasicDetails from "./[id]/components/BasicDetails";
import ProfileForm from "./[id]/components/ProfileForm";
import Skills from "./[id]/components/Skills";
import Service from "./[id]/components/service-free";
import Education from "./[id]/components/Education";
import Scoialmedia from "./[id]/components/Socialmedia";
import Portfolio from "./[id]/components/portfolio";
import ChnagePassword from "./[id]/components/ChangePassword";

export default function ProfilePage({ params }) {
  const { id } = params;
  const [activeKey, setActiveKey] = useState("1");

  const tabItems = [
    {
      key: "1",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <ToolOutlined className="text-lg" />
          <span>Basic Details</span>
        </div>
      ),
      children: <BasicDetails />,
    },
    {
      key: "2",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <UserOutlined className="text-lg" />
          <span>Profile</span>
        </div>
      ),
      children: <ProfileForm />,
    },
    {
      key: "3",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <GlobalOutlined className="text-lg" />
          <span>Service</span>
        </div>
      ),
      children: <Service />,
    },
    {
      key: "4",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <ScheduleOutlined className="text-lg" />
          <span>Career</span>
        </div>
      ),
      children: <Education />,
    },
    // {
    //   key: "8",
    //   label: (
    //     <div className="flex gap-2 items-center px-2 py-3">
    //       <ScheduleOutlined className="text-lg" />
    //       <span>Skills</span>
    //     </div>
    //   ),
    //   children: <Skills />,
    // },
    {
      key: "9",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <TrophyOutlined className="text-lg" />
          <span>Scoialmedia</span>
        </div>
      ),
      children: <Scoialmedia />,
    },
    {
      key: "10",
      label: (
        <div className="flex gap-2 items-center px-2 py-3">
          <FolderOutlined className="text-lg" />
          <span>Portfolio</span>
        </div>
      ),
      children: <Portfolio />,
    },
    // {
    //   key: "11",
    //   label: (
    //     <div className="flex gap-2 items-center px-2 py-3">
    //       <LockOutlined className="text-lg" />
    //       <span>Change Password</span>
    //     </div>
    //   ),
    //   children: <ChnagePassword />,
    // },
  ];

  return (
    <div className="p-4 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          tabPosition="left"
          items={tabItems}
          className="profile-tabs"
          tabBarStyle={{
            width: "220px",
            height: "calc(100vh - 2rem)", // Use viewport height minus padding
            maxHeight: "calc(100vh - 2rem)",
            backgroundColor: "#3a599c",
            borderRadius: "8px",
            padding: "3px 0",
            overflowY: "hidden", // Enable vertical scrolling
            overflowX: "hidden", // Hide horizontal scrollbar
          }}
        />
      </div>

      <style jsx global>{`
        .profile-tabs .ant-tabs-nav {
          margin-right: 0 !important;
          min-width: 220px;
          height: calc(100vh - 2rem) !important;
          max-height: calc(100vh - 2rem) !important;
        }

        .profile-tabs .ant-tabs-nav-wrap {
          height: 100% !important;
          max-height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }

        .profile-tabs .ant-tabs-nav-list {
          height: auto !important;
          flex-direction: column !important;
        }

        .profile-tabs .ant-tabs-tab {
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
          flex-shrink: 0 !important; /* Prevent tabs from shrinking */
        }

        /* Add divider after each tab except the last one */
        .profile-tabs .ant-tabs-tab:not(:last-child)::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 16px;
          right: 16px;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .profile-tabs .ant-tabs-tab:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }

        .profile-tabs .ant-tabs-tab-active {
          background-color: #2d4373 !important;
          font-weight: 500 !important;
        }

        .profile-tabs .ant-tabs-tab-btn {
          width: 100% !important;
          color: inherit !important;
        }

        .profile-tabs .ant-tabs-ink-bar {
          display: none !important;
        }

        .profile-tabs .ant-tabs-content-holder {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          margin-left: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          min-height: 600px;
          height: calc(100vh - 2rem);
          overflow-y: auto;
        }

        .profile-tabs .ant-tabs-nav::before {
          border-bottom: none !important;
        }

        /* Custom scrollbar styling for the sidebar */
        .profile-tabs .ant-tabs-nav-wrap::-webkit-scrollbar {
          width: 6px;
        }

        .profile-tabs .ant-tabs-nav-wrap::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .profile-tabs .ant-tabs-nav-wrap::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .profile-tabs .ant-tabs-nav-wrap::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}