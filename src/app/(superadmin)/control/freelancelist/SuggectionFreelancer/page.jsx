"use client";
import { Table, Select, Typography, Card, Tag, Button } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

export default function FreelancerSuggestionList() {
  // Dummy data
  const data = [
    {
      key: '1',
      name: 'John Smith',
      category: 'Web Development',
      service: 'React Development',
      suggestion: 'Great for frontend projects',
      status: 'Active',
    },
    {
      key: '2',
      name: 'Sarah Johnson',
      category: 'Graphic Design',
      service: 'Logo Design',
      suggestion: 'Creative designs with quick turnaround',
      status: 'Pending',
    },
    {
      key: '3',
      name: 'Michael Brown',
      category: 'Content Writing',
      service: 'Blog Writing',
      suggestion: 'SEO-optimized content specialist',
      status: 'Active',
    },
    {
      key: '4',
      name: 'Emily Davis',
      category: 'Digital Marketing',
      service: 'Social Media Management',
      suggestion: 'Excellent engagement rates',
      status: 'Rejected',
    },
    {
      key: '5',
      name: 'Robert Wilson',
      category: 'Mobile Development',
      service: 'Flutter Development',
      suggestion: 'Cross-platform app expert',
      status: 'Active',
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'Active':
            color = 'green';
            break;
          case 'Pending':
            color = 'orange';
            break;
          case 'Rejected':
            color = 'red';
            break;
          default:
            color = 'blue';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button icon={<EditOutlined />} size="small" />
          <Button icon={<DeleteOutlined />} size="small" danger />
        </div>
      ),
    },
  ];

  return (
    <Card className="rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">Freelancer Suggestion List</Title>
        
        <div className="flex items-center">
          <Text className="mr-2">Show</Text>
          <Select defaultValue="10" style={{ width: 80 }}>
            <Option value="10">10</Option>
            <Option value="25">25</Option>
            <Option value="50">50</Option>
            <Option value="100">100</Option>
          </Select>
          <Text className="ml-2">entries</Text>
        </div>
      </div>

      <div className="mb-4">
   
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          position: ['bottomCenter'],
          showSizeChanger: false,
          pageSize: 5,
          showTotal: (total, range) => (
            <Text>
              Showing {range[0]} to {range[1]} of {total} entries
            </Text>
          ),
        }}
        className="rounded-lg"
      />
    </Card>
  );
}