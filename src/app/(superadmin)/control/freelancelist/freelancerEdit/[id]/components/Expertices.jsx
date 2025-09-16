"use client";
import { useState } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";

export default function ExpericesPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      message.success(`Skill "${values.skill}" saved successfully!`);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl">
        <Form layout="vertical" onFinish={onFinish}>
          <Row gutter={16} align="bottom">
            <Col span={20}>
              <Form.Item
                label="Enter a Expertise"
                name="skill"
                rules={[{ required: true, message: "Please enter a  Expertise" }]}
              >
                <Input placeholder="Expertise" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="&nbsp;"> {/* invisible label for alignment */}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full bg-[#3a599c]"
                >
                  Save
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
