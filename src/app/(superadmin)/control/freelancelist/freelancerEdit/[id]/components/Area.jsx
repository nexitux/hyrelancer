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
  states: ["Andhra Pradesh", "Tamil Nadu", "Karnataka"],
  cities: {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Karnataka: ["Bengaluru", "Mysuru", "Hubli"],
  },
};

export default function StateCityPage() {
  const [form] = Form.useForm();
  const [stateFields, setStateFields] = useState([{ key: Date.now() }]);
  const [cities, setCities] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Handle State Change → load cities
  const handleStateChange = (value, index) => {
    const selectedCities = data.cities[value] || [];
    setCities(selectedCities);
    form.setFieldValue(["cities", index], []); // reset cities on change
  };

  // Add another state group
  const addStateField = () => {
    setStateFields([...stateFields, { key: Date.now() }]);
  };

  // Remove state group
  const removeStateField = (key) => {
    setStateFields(stateFields.filter((field) => field.key !== key));
  };

  // Save state group to table
  const onFinish = (values) => {
    const newData = values.states.map((state, i) => ({
      key: Date.now() + i,
      state,
      cities: values.cities[i],
    }));

    setTableData([...tableData, ...newData]);
    form.resetFields();
    setStateFields([{ key: Date.now() }]);
    message.success("State & Cities added successfully!");
  };

  // Delete row
  const handleDelete = (key) => {
    setTableData(tableData.filter((item) => item.key !== key));
  };

  // Columns for table
  const columns = [
    {
      title: "State",
      dataIndex: "state",
      key: "state",
    },
    {
      title: "Cities",
      dataIndex: "cities",
      key: "cities",
      render: (cities) =>
        cities.map((c, i) => (
          <span
            key={i}
            className="bg-green-100 text-green-600 px-2 py-1 rounded-md mr-2"
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
        State & Cities Information
      </h2>
      <Divider />

      <Form form={form} onFinish={onFinish} layout="vertical">
        {stateFields.map((field, index) => (
          <div
            key={field.key}
            className="border border-gray-200 p-4 mb-4 rounded-lg"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={["states", index]}
                  label="State"
                  rules={[{ required: true, message: "Please select a state" }]}
                >
                  <Select
                    placeholder="Select state"
                    onChange={(value) => handleStateChange(value, index)}
                    size="large"
                  >
                    {data.states.map((state) => (
                      <Option key={state} value={state}>
                        {state}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name={["cities", index]}
                  label="Cities"
                  rules={[{ required: true, message: "Please select cities" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Select cities"
                    size="large"
                    disabled={!cities.length}
                  >
                    {cities.map((city) => (
                      <Option key={city} value={city}>
                        {city}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {stateFields.length > 1 && (
              <Button
                type="dashed"
                danger
                onClick={() => removeStateField(field.key)}
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
          onClick={addStateField}
          className="w-full mt-2"
          size="large"
        >
          Add Another State Group
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
