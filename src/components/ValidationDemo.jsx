'use client'
import { useState } from 'react';
import { Form, Button, Card, Typography, Space, Divider } from 'antd';
import { ValidatedAntdInput, ValidatedAntdTextArea } from '@/components/ValidatedAntdInput';
import ValidatedFormInput from '@/components/auth/ValidatedFormInput';
import { validationConfigs } from '@/utils/inputValidation';

const { Title, Text } = Typography;

const ValidationDemo = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});

  const handleFormChange = (changedValues, allValues) => {
    setFormData(allValues);
  };

  const handleSubmit = (values) => {
    console.log('Form submitted with values:', values);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <Title level={2}>Character Restriction Validation Demo</Title>
        <Text type="secondary">
          Try typing restricted characters to see the tooltip and visual indicators
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ant Design Components */}
        <Card title="Ant Design Components" className="h-fit">
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormChange}
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <Form.Item
              name="name"
              label="Name (Strict Validation)"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <ValidatedAntdInput
                placeholder="Enter your name (no special chars)"
                validationType="name"
                validationConfig={validationConfigs.name}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <ValidatedAntdInput
                placeholder="Enter your email"
                validationType="email"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
            >
              <ValidatedAntdInput
                placeholder="Enter phone number"
                validationType="phone"
              />
            </Form.Item>

            <Form.Item
              name="title"
              label="Job Title"
            >
              <ValidatedAntdInput
                placeholder="Enter job title"
                validationType="title"
                validationConfig={validationConfigs.title}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
            >
              <ValidatedAntdTextArea
                placeholder="Enter description"
                validationType="description"
                validationConfig={validationConfigs.description}
                rows={4}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit Form
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Custom Form Components */}
        <Card title="Custom Form Components" className="h-fit">
          <div className="space-y-4">
            <ValidatedFormInput
              label="Display Name"
              name="displayName"
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              validationType="name"
              validationConfig={validationConfigs.name}
              placeholder="Enter display name"
              required
            />

            <ValidatedFormInput
              label="Email Address"
              name="emailAddress"
              type="email"
              value={formData.emailAddress || ''}
              onChange={(e) => setFormData({...formData, emailAddress: e.target.value})}
              validationType="email"
              placeholder="Enter email address"
              required
            />

            <ValidatedFormInput
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              validationType="phone"
              placeholder="Enter phone number"
            />

            <ValidatedFormInput
              label="Project Title"
              name="projectTitle"
              type="text"
              value={formData.projectTitle || ''}
              onChange={(e) => setFormData({...formData, projectTitle: e.target.value})}
              validationType="title"
              validationConfig={validationConfigs.title}
              placeholder="Enter project title"
            />

            <ValidatedFormInput
              label="Message"
              name="message"
              type="textarea"
              value={formData.message || ''}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              validationType="message"
              validationConfig={validationConfigs.message}
              placeholder="Enter your message"
              maxLength={500}
            />
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card title="How to Test" className="mt-8">
        <div className="space-y-4">
          <div>
            <Title level={4}>Try typing these restricted characters:</Title>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>&lt; &gt;</code> - Angle brackets</li>
              <li><code>&#123; &#125;</code> - Curly braces</li>
              <li><code>[ ]</code> - Square brackets</li>
              <li><code>\ |</code> - Backslash and pipe</li>
              <li><code>` ~</code> - Backtick and tilde</li>
              <li><code>; $ ^</code> - Semicolon, dollar, caret</li>
              <li><code>&</code> - Ampersand (in name fields)</li>
            </ul>
          </div>
          
          <Divider />
          
          <div>
            <Title level={4}>What you'll see:</Title>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Tooltip:</strong> Appears when you try to type a restricted character</li>
              <li><strong>Character Indicator:</strong> Shows below the input with current validation status</li>
              <li><strong>Real-time Prevention:</strong> Restricted characters are blocked from being typed</li>
              <li><strong>Visual Feedback:</strong> Green checkmark for valid input, red warning for restricted characters</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ValidationDemo;

