"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, message, Card, Alert } from "antd";
import { 
  CheckCircleOutlined, 
  StopOutlined, 
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  BellOutlined,
  UserOutlined
} from "@ant-design/icons";

export default function AccountStatusPage() {
  const [accountStatus, setAccountStatus] = useState(1); // 1 = Active, 0 = Deactive
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // JWT token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const backendUrl = "http://test.hyrelancer.in/api/account/status";

  // Fetch current status from backend
  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await axios.get(backendUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "success") {
        setAccountStatus(res.data.user.is_active === "1" ? 1 : 0);
      }
    } catch (error) {
      console.error("Failed to fetch account status:", error);
      message.error("Unable to fetch account status. Please try again.");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleToggleClick = () => setIsModalOpen(true);

  const handleConfirmToggle = async () => {
    if (!token) {
      message.error("Authentication required. Please login.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(backendUrl, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === "success") {
        const newStatus = res.data.user.is_active === "1" ? 1 : 0;
        setAccountStatus(newStatus);
        setShowNotification(true);

        message.success({
          content: newStatus === 1 
            ? "Account activated! Your profile is now visible to customers." 
            : "Account deactivated! Your profile is hidden and you cannot post jobs.",
          duration: 4,
          style: { marginTop: "10vh" }
        });
      } else {
        message.error(res.data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        message.error("Unauthorized. Please login again.");
      } else {
        message.error("Server error. Try again.");
      }
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const getStatusColor = () =>
    accountStatus === 1 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
  const getStatusIcon = () =>
    accountStatus === 1 ? <CheckCircleOutlined className="text-green-500 text-3xl" /> : <StopOutlined className="text-red-500 text-3xl" />;
  const getVisibilityIcon = () =>
    accountStatus === 1 ? <EyeOutlined className="text-blue-500 text-3xl" /> : <EyeInvisibleOutlined className="text-gray-500 text-3xl" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-pulse">
          <Alert
            message={
              <div className="flex items-center justify-center space-x-2">
                <BellOutlined className="text-lg" />
                <span className="font-medium">
                  {accountStatus === 1
                    ? "Account activated! Your profile is now visible to customers."
                    : "Account deactivated! Your profile is hidden and you cannot post jobs until reactivated."}
                </span>
              </div>
            }
            type={accountStatus === 1 ? "success" : "warning"}
            banner
            showIcon={false}
            className="text-center"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-12 lg:py-20 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Account Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your account status and profile visibility</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className={`${getStatusColor()} border-2 shadow-lg rounded-2xl`}>
            <div className="text-center p-4">
              <div className="mb-4">{getStatusIcon()}</div>
              <h3 className="text-xl font-semibold mb-2">Account Status</h3>
              <p className={`text-lg font-bold ${accountStatus === 1 ? "text-green-600" : "text-red-600"}`}>
                {accountStatus === 1 ? "Active" : "Deactivated"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {accountStatus === 1 
                  ? "Your account is fully operational"
                  : "Your account is temporarily disabled. You cannot post jobs."}
              </p>
            </div>
          </Card>

          <Card className="bg-white border-2 border-gray-200 shadow-lg rounded-2xl">
            <div className="text-center p-4">
              <div className="mb-4 flex justify-center space-x-2">
                {getVisibilityIcon()}
                <UserOutlined className="text-gray-500 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Profile Visibility</h3>
              <p className={`text-lg font-bold ${accountStatus === 1 ? "text-blue-600" : "text-gray-600"}`}>
                {accountStatus === 1 ? "Visible to Customers" : "Hidden from Customers"}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {accountStatus === 1 
                  ? "Customers can find and contact you"
                  : "Your profile is not searchable"}
              </p>
            </div>
          </Card>
        </div>

        <Card className="shadow-2xl rounded-3xl bg-white border-0 overflow-hidden">
          <div className="bg-blue-600 text-white p-6 text-center rounded-t-3xl">
            <h2 className="text-2xl font-bold mb-2">Account Control</h2>
            <p className="opacity-90">
              {accountStatus === 1 
                ? "Deactivating will hide your profile from customers temporarily" 
                : "Activating will make your profile visible to customers again"
              }
            </p>
          </div>
          
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${accountStatus === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {getStatusIcon()}
                <span className="ml-2 font-semibold">
                  Currently {accountStatus === 1 ? "Active" : "Deactivated"}
                </span>
              </div>
            </div>

            <Button
              type={accountStatus === 1 ? "default" : "primary"}
              danger={accountStatus === 1}
              size="large"
              icon={accountStatus === 1 ? <StopOutlined /> : <CheckCircleOutlined />}
              loading={loading}
              onClick={handleToggleClick}
              className="px-12 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
            >
              {accountStatus === 1 ? "Deactivate Account" : "Activate Account"}
            </Button>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <ExclamationCircleOutlined className="mr-2" />
                {accountStatus === 1 
                  ? "Deactivating temporarily removes your profile from customer searches and prevents job posting"
                  : "Activating restores full account functionality and customer visibility"
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        title={
          <div className="flex items-center text-lg">
            <ExclamationCircleOutlined className="mr-2 text-orange-500" />
            Confirm Status Change
          </div>
        }
        open={isModalOpen}
        onOk={handleConfirmToggle}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
        okText={`Yes, ${accountStatus === 1 ? "Deactivate" : "Activate"}`}
        cancelText="Cancel"
        okButtonProps={{ danger: accountStatus === 1, size: "large" }}
        cancelButtonProps={{ size: "large" }}
        className="rounded-2xl"
        width={500}
      >
        <div className="py-4">
          <div className={`p-4 rounded-xl mb-4 ${accountStatus === 1 ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-gray-700 text-lg mb-3">
              Are you sure you want to {accountStatus === 1 ? "deactivate" : "activate"} your account?
            </p>
            
            <div className="space-y-2 text-sm">
              <p className={accountStatus === 1 ? "text-red-600" : "text-green-600"}>
                <strong>This will {accountStatus === 1 ? "immediately" : "instantly"}:</strong>
              </p>
              <ul className="ml-4 space-y-1">
                <li>• {accountStatus === 1 ? "Hide" : "Show"} your profile from customer searches</li>
                <li>• {accountStatus === 1 ? "Pause" : "Resume"} incoming customer notifications</li>
                <li>• {accountStatus === 1 ? "Temporarily disable" : "Fully restore"} your account functionality (cannot post jobs when deactivated)</li>
              </ul>
            </div>
          </div>
          
          <p className="text-gray-600 text-center">
            You can change this setting back at any time.
          </p>
        </div>
      </Modal>
    </div>
  );
}
