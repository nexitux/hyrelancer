"use client";

import { useState } from "react";
import { Input, Button, Modal, message, Card } from "antd";
import { ExclamationCircleOutlined, LockOutlined } from "@ant-design/icons";

export default function DeleteProfile() {
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showDeleteModal = () => {
    if (!password) {
      message.warning("Please enter your password to continue.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
      message.success("Your profile has been deleted successfully.");
    }, 5500);
  };

  return (
    <div className="flex flex-col min-h-screen justify-between bg-gray-50">
      {/* Main Container */}
      <div className="flex flex-col items-center px-4 py-12 lg:py-20 container mx-auto w-full lg:w-2/3">
        <Card
          title={<h2 className="text-2xl font-bold text-gray-800">Delete Profile</h2>}
          bordered={false}
          className="shadow-md rounded-lg w-full"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-500 text-2xl" />
            Are you sure you want to delete your profile?
          </h3>
          <p className="text-gray-500 mt-2">This action cannot be undone!</p>

          <div className="mt-6">
            <label className="block font-medium">
              Please enter your password to confirm:
              <span className="text-red-500">*</span>
            </label>
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full lg:w-1/2"
            />
          </div>

          <Button
            type="primary"
            danger
            className="mt-8 px-6 py-2"
            onClick={showDeleteModal}
          >
            Delete Profile
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 bg-white shadow-inner text-center text-gray-500 text-sm">
        ©2024 Hyrelancer. All Rights Reserved
      </footer>

      {/* Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isModalOpen}
        onOk={handleDelete}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
      >
        <p className="text-gray-700">
          Are you absolutely sure you want to delete your profile? This action is permanent.
        </p>
      </Modal>
    </div>
  );
}
