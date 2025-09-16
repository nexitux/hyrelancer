// components/tabs/BasicDetails.jsx
import React from 'react';
import { Form, Input, Button, Row, Col } from 'antd';

const { TextArea } = Input;

const BasicDetails = () => {
  const [form] = Form.useForm();

  const handleSave = (values) => {
    console.log('Form values:', values);
    // Handle save logic here
  };

  const handleAddToSite = () => {
    console.log('Add to site clicked');
    // Handle add to site logic here
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          name: 'SHINE CS',
          mobile: '7894561235',
          email: 'shinecs.work@gmail.com',
          address: '0',
          username: 'shinecs.work@gmail.com'
        }}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input placeholder="Enter your name" className="h-12" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[{ required: true, message: 'Please input your mobile number!' }]}
            >
              <Input placeholder="Enter your mobile number" className="h-12" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="Enter your email" className="h-12" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input placeholder="Enter your username" className="h-12" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label="Address"
              name="address"
            >
              <TextArea 
                rows={4} 
                placeholder="Enter your address"
                className="resize-none"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex gap-4 mt-8">
          <Button 
            type="primary" 
            onClick={handleAddToSite}
            className="px-8 h-12 font-medium bg-blue-600 border-blue-600 hover:bg-blue-700"
          >
            Add To Site
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            className="px-8 h-12 font-medium bg-blue-600 border-blue-600 hover:bg-blue-700"
          >
            Save
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default BasicDetails;