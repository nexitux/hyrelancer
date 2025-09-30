"use client";
import React, { useState } from "react";
import { Input, Button, Form, Row, Col, Card, Typography, message } from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined
} from "@ant-design/icons";
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

const { Title } = Typography;

// --- Import admin API ---
import adminApi from '@/config/adminApi';

export default function AddFreelancer() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize router

  const onFinish = async (values) => {
    setLoading(true);

    // Payload matches backend validation rules
    const payload = {
      name: values.name,
      email: values.email,
      mobile: values.mobile,
      password: values.password,
    };

    try {
      const response = await adminApi.post('/freelancers', payload);

      // --- Success Case ---
      message.success('Freelancer created successfully!');
      form.resetFields();
      
      // Redirect to freelancer list page after 1 second delay
      setTimeout(() => {
        router.push('/control/freelancelist'); 
      }, 1000);

    } catch (error) {
      console.error("API Error:", error);
      
      if (error.response?.status === 422 && error.response.data.errors) {
        // --- Backend Validation Error Handling ---
        // Maps validation errors (e.g., "email already exists") to form fields.
        const formErrors = Object.keys(error.response.data.errors).map(key => ({
          name: key,
          errors: error.response.data.errors[key],
        }));
        form.setFields(formErrors);
        message.error('Validation failed. Please check the form fields.');
      } else {
        // Other API errors (e.g., server error)
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Add padding to a parent div if necessary, e.g., <div className="p-8">
    <div className="p-8"> 
      <Card className="rounded-2xl shadow-md">
        <Title level={3} className="!mb-6">Add Freelancer</Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
        >
          {/* Name, Mobile, Email */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mobile"
                label="Mobile"
                rules={[{ required: true, message: "Please enter mobile number" }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Mobile" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email", message: "Enter valid email" }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>

          {/* Password, Confirm Password */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
              Save Freelancer
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}