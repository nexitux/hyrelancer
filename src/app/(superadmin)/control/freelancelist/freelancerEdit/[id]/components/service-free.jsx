"use client";
import React, { useState } from "react";
import {
  Form,
  Select,
  Button,
  Divider,
  Row,
  Col,
  Table,
  Space,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const data = {
  services: ["Wedding & Events", "Catering", "Photography"],
  categories: {
    "Wedding & Events": ["Wedding Planning", "Event Decoration", "DJ Services"],
    Catering: ["Buffet", "Fine Dining", "Desserts"],
    Photography: ["Portrait", "Event", "Product"],
  },
};

export default function ServicePage() {
  const [form] = Form.useForm();
  const [serviceFields, setServiceFields] = useState([{ key: Date.now() }]);
  const [categories, setCategories] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Handle Service Change → load categories
  const handleServiceChange = (value, index) => {
    const selectedCategories = data.categories[value] || [];
    setCategories(selectedCategories);
    form.setFieldValue(["categories", index], []); // reset categories on change
  };

  // Add another service group
  const addServiceField = () => {
    setServiceFields([...serviceFields, { key: Date.now() }]);
  };

  // Remove service group
  const removeServiceField = (key) => {
    setServiceFields(serviceFields.filter((field) => field.key !== key));
  };

  // Save service group to table
  const onFinish = (values) => {
    const newData = values.services.map((service, i) => ({
      key: Date.now() + i,
      service,
      categories: values.categories[i],
    }));

    setTableData([...tableData, ...newData]);
    form.resetFields();
    setServiceFields([{ key: Date.now() }]);
    message.success("Service added successfully!");
  };

  // Delete row
  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  // Columns for table
  const columns = [
    {
      title: "Service Type",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Categories",
      dataIndex: "categories",
      key: "categories",
      render: (cats) =>
        cats.map((c, i) => (
          <span
            key={i}
            className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md mr-2"
          >
            {c}
          </span>
        )),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => message.info("Edit logic to be added")}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Service Information
      </h2>
      <Divider />

      <Form form={form} onFinish={onFinish} layout="vertical">
        {serviceFields.map((field, index) => (
          <div
            key={field.key}
            className="border border-gray-200 p-4 mb-4 rounded-lg"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={["services", index]}
                  label="Service Type"
                  rules={[{ required: true, message: "Please select a service" }]}
                >
                  <Select
                    placeholder="Select services you offer"
                    onChange={(value) => handleServiceChange(value, index)}
                    size="large"
                  >
                    {data.services.map((service) => (
                      <Option key={service} value={service}>
                        {service}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={["categories", index]}
                  label="Service Categories"
                  rules={[
                    { required: true, message: "Please select categories" },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select relevant categories"
                    size="large"
                    disabled={!categories.length}
                  >
                    {categories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {serviceFields.length > 1 && (
              <Button
                type="dashed"
                danger
                onClick={() => removeServiceField(field.key)}
                size="small"
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addServiceField}
          className="w-full mt-2"
          size="large"
        >
          Add Another Service Group
        </Button>

        <div className="text-right mt-4">
          <Button type="primary" htmlType="submit" size="large">
            Save
          </Button>
        </div>
      </Form>

      <Divider />

      <Table
        dataSource={tableData}
        columns={columns}
        pagination={false}
        bordered
      />
    </div>
  );
}
