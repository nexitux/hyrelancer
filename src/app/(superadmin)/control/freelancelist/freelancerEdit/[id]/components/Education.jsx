"use client";
import React, { useState } from "react";
import {
  Form,
  Select,
  Input,
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

export default function ServicePage() {
  const [form] = Form.useForm();
  const [fields, setFields] = useState([{ key: Date.now() }]);
  const [tableData, setTableData] = useState([]);

  // Add new group
  const addField = () => {
    setFields([...fields, { key: Date.now() }]);
  };

  // Remove group
  const removeField = (key) => {
    setFields(fields.filter((field) => field.key !== key));
  };

  // Save to table
  const onFinish = (values) => {
    const newData = values.entries.map((entry, i) => ({
      key: Date.now() + i,
      ...entry,
    }));

    setTableData([...tableData, ...newData]);
    form.resetFields();
    setFields([{ key: Date.now() }]);
    message.success("Entry added successfully!");
  };

  // Delete row
  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  // Table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "type",
      key: "type",
      render: (_, record) => {
        if (record.type === "UG" || record.type === "PG") {
          return `${record.type} - ${record.specialization || ""} - ${
            record.college || ""
          } - ${record.year || ""}`;
        }
        if (record.type === "Freelance Expertise") {
          return `${record.type} - ${record.specialization || ""} - ${
            record.year || ""
          }`;
        }
        if (record.type === "High School") {
          return `${record.type} - ${record.year || ""}`;
        }
        return record.type;
      },
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
        Education / Service Information
      </h2>
      <Divider />

      <Form form={form} onFinish={onFinish} layout="vertical">
        {fields.map((field, index) => (
          <div
            key={field.key}
            className="border border-gray-200 p-4 mb-4 rounded-lg"
          >
            <Row gutter={16}>
              {/* Type */}
              <Col xs={24} md={12}>
                <Form.Item
                  name={["entries", index, "type"]}
                  label="Type"
                  rules={[{ required: true, message: "Please select type" }]}
                >
                  <Select placeholder="Select type" size="large">
                    <Option value="UG">UG</Option>
                    <Option value="PG">PG</Option>
                    <Option value="Freelance Expertise">
                      Freelance Expertise
                    </Option>
                    <Option value="High School">High School</Option>
                  </Select>
                </Form.Item>
              </Col>

              {/* Year */}
              <Col xs={24} md={12}>
                <Form.Item
                  shouldUpdate={(prev, curr) =>
                    prev?.entries?.[index]?.type !==
                    curr?.entries?.[index]?.type
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    const type = getFieldValue(["entries", index, "type"]);
                    if (!type) return null;
                    return (
                      <Form.Item
                        name={["entries", index, "year"]}
                        label="Year"
                        rules={[
                          { required: true, message: "Please enter year" },
                        ]}
                      >
                        <Input placeholder="Enter year" size="large" />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* Specialization */}
              <Col xs={24} md={12}>
                <Form.Item
                  shouldUpdate={(prev, curr) =>
                    prev?.entries?.[index]?.type !==
                    curr?.entries?.[index]?.type
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    const type = getFieldValue(["entries", index, "type"]);
                    if (type === "UG" || type === "PG" || type === "Freelance Expertise") {
                      return (
                        <Form.Item
                          name={["entries", index, "specialization"]}
                          label="Specialization"
                          rules={[
                            {
                              required: true,
                              message: "Please enter specialization",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Enter specialization"
                            size="large"
                          />
                        </Form.Item>
                      );
                    }
                    return null;
                  }}
                </Form.Item>
              </Col>

              {/* College */}
              <Col xs={24} md={12}>
                <Form.Item
                  shouldUpdate={(prev, curr) =>
                    prev?.entries?.[index]?.type !==
                    curr?.entries?.[index]?.type
                  }
                  noStyle
                >
                  {({ getFieldValue }) => {
                    const type = getFieldValue(["entries", index, "type"]);
                    if (type === "UG" || type === "PG") {
                      return (
                        <Form.Item
                          name={["entries", index, "college"]}
                          label="College"
                          rules={[
                            { required: true, message: "Please enter college" },
                          ]}
                        >
                          <Input placeholder="Enter college" size="large" />
                        </Form.Item>
                      );
                    }
                    return null;
                  }}
                </Form.Item>
              </Col>
            </Row>

            {fields.length > 1 && (
              <Button
                type="dashed"
                danger
                onClick={() => removeField(field.key)}
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
          onClick={addField}
          className="w-full mt-2"
          size="large"
        >
          Add Another Entry
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
