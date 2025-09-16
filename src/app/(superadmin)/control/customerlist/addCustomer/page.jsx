"use client";
import React, { useState } from "react";
import { Input, Button, Form, Row, Col, Card, Typography, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  HomeOutlined
} from "@ant-design/icons";
import { useRouter } from 'next/navigation';

const { Title } = Typography;

// API configuration and Token Manager (assuming it exists)
const API_BASE_URL = 'https://test.hyrelancer.in/api/admin';
const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }
};

export default function AddCustomer() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);

    const payload = {
      name: values.name,
      email: values.email,
      mobile: values.mobile,
      address: values.address,
      username: values.username,
      password: values.password,
    };

    try {
      const token = TokenManager.getToken();

      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 422 && result.errors) {
          // Backend validation errors
          const formErrors = Object.keys(result.errors).map(key => ({
            name: key,
            errors: result.errors[key],
          }));
          form.setFields(formErrors);
          message.error('Validation failed. Please check the form.');
        } else {
          // Other API errors
          const errorMessage = result.message || 'Failed to create customer.';
          message.error(errorMessage);
        }
        return;
      }

      // Success case
      message.success('Customer created successfully!');
      form.resetFields();
      // Optional: Redirect to customer list page
      setTimeout(() => {
        router.push('/control/customerlist');
      }, 1000); // 1-second delay for the success message to be visible


    } catch (error) {
      console.error("API Error:", error);
      message.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card className="rounded-2xl shadow-md">
        <Title level={3} className="!mb-6">Add Customer</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
        >
          {/* Main User Information */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter your full name" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mobile"
                label="Mobile"
                rules={[{ required: true, message: "Please enter your mobile number" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Mobile" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Please enter your address" }]}
              >
                <Input prefix={<HomeOutlined />} placeholder="Address" />
              </Form.Item>
            </Col>
          </Row>

          {/* Login Credentials */}
          <Title level={5} className="!mt-8 !mb-4">Login Credentials</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Please enter a username" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please enter a password" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
              </Form.Item>
            </Col>
          </Row>

          {/* Save Button */}
          <Form.Item className="!mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-32 h-10 rounded-lg"
            >
              Save Customer
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}