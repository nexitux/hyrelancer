'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Input, Button, Form, Row, Col, Card, Typography, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  HomeOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';

const { Title } = Typography;

// Import admin API
import adminApi from '@/config/adminApi';

const decodeId = (encodedId) => {
  try {
    return Base64.decode(encodedId);
  } catch (error) {
    return null;
  }
};

export default function EditCustomer({ params }) {
  const { id: encodedId } = params;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const router = useRouter();

  const decodedId = encodedId ? decodeId(encodedId) : null;

  // Function to fetch existing customer data
  const fetchCustomerData = useCallback(async () => {
    if (!decodedId) {
      message.error("Invalid customer ID provided.");
      setInitialDataLoading(false);
      return;
    }

    try {
      const response = await adminApi.get(`/customers/${encodedId}`);
      form.setFieldsValue(response.data); // Prefill form with fetched data
    } catch (error) {
      console.error("API Error:", error);
      message.error(error.response?.data?.message || 'Failed to load customer data.');
    } finally {
      setInitialDataLoading(false);
    }
  }, [decodedId, encodedId, form]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const onFinish = async (values) => {
    setLoading(true);

    const { confirmPassword, ...payload } = values;

    try {
      const response = await adminApi.put(`/customers/${encodedId}`, payload);

      message.success('Customer updated successfully!');
      setTimeout(() => {
        router.push('/control/customerlist');
      }, 1000);

    } catch (error) {
      console.error("API Error:", error);
      
      if (error.response?.status === 422 && error.response.data.errors) {
        const formErrors = Object.keys(error.response.data.errors).map(key => ({
          name: key,
          errors: error.response.data.errors[key],
        }));
        form.setFields(formErrors);
        message.error('Validation failed. Please check the form.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialDataLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card className="rounded-2xl shadow-md">
        <Title level={3} className="!mb-6">Edit Customer</Title>

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
            {/* <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Please enter your address" }]}
              >
                <Input prefix={<HomeOutlined />} placeholder="Address" />
              </Form.Item>
            </Col> */}
          </Row>

          {/* Login Credentials */}
          {/* <Title level={5} className="!mt-8 !mb-4">Login Credentials</Title>
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
          </Row> */}

          {/* Save Button */}
          <Form.Item className="!mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-32 h-10 rounded-lg"
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}