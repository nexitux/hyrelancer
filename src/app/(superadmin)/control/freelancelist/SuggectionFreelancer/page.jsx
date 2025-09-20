"use client";
import { Table, Select, Typography, Card, Tag, Button, Modal, Spin, message } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import AddCategory from './add-category/page';
import AddService from './addService/page';
import { Base64 } from 'js-base64';

const { Option } = Select;
const { Title, Text } = Typography;

// API Configuration
const API_BASE_URL = 'https://test.hyrelancer.in/api/admin';
const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }
};

export default function FreelancerSuggestionList() {
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [suggestionDetails, setSuggestionDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestionDetails = async (fsuId) => {
    try {
      setDetailsLoading(true);
      const token = TokenManager.getToken();
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      const encodedId = Base64.encode(fsuId.toString());
      const response = await fetch(`${API_BASE_URL}/addSuggestion/${encodedId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 401) {
        message.error('Authentication failed. Please log in again.');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setSuggestionDetails(result);
      
    } catch (error) {
      message.error('Error fetching suggestion details: ' + error.message);
      console.error('Fetch details error:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/getSuggestion`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 401) {
        message.error('Authentication failed. Please log in again.');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      const suggestionsData = Array.isArray(result) ? result : result.data;
      
      if (suggestionsData && suggestionsData.length > 0) {
        const formattedData = suggestionsData.map((item, index) => {
          let type = 'Unknown';
          let suggestion = '';

          // Determine type based on API response
          if (item.fsu_se_id === 0) {
            type = 'Category';
            suggestion = item.fsu_suggestion || 'No Suggestion';
          } else if (item.fsu_se_id === 1) {
            type = 'Service';
            suggestion = item.fsu_suggestion || 'No Suggestion';
          }

          return {
            key: item.fsu_id || index,
            userId: item.fsu_u_id,
            userName: item.name || `User ${item.fsu_u_id}`,
            type,
            suggestion,
            categoryId: item.fsu_ca_id,
            subCategoryId: item.fsu_sc_id,
            serviceId: item.fsu_se_id,
            originalData: item,
          };
        });
        
        setData(formattedData);
      } else {
        message.warning('No suggestions found');
        setData([]);
      }
    } catch (error) {
      message.error('Error fetching data: ' + error.message);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showCategoryModal = async (record) => {
    setSelectedRecord(record);
    await fetchSuggestionDetails(record.key);
    setIsCategoryModalVisible(true);
  };

  const showServiceModal = async (record) => {
    setSelectedRecord(record);
    await fetchSuggestionDetails(record.key);
    setIsServiceModalVisible(true);
  };

  const handleCategoryOk = () => {
    setIsCategoryModalVisible(false);
    setSelectedRecord(null);
    setSuggestionDetails(null);
    fetchSuggestions();
  };

  const handleServiceOk = () => {
    setIsServiceModalVisible(false);
    setSelectedRecord(null);
    setSuggestionDetails(null);
    fetchSuggestions();
  };

  const handleCategoryCancel = () => {
    setIsCategoryModalVisible(false);
    setSelectedRecord(null);
    setSuggestionDetails(null);
  };

  const handleServiceCancel = () => {
    setIsServiceModalVisible(false);
    setSelectedRecord(null);
    setSuggestionDetails(null);
  };

  const handleDelete = async (record) => {
    try {
      const token = TokenManager.getToken();
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      const encodedId = Base64.encode(record.key.toString());
      const response = await fetch(`${API_BASE_URL}/deleteSuggestion/${encodedId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        message.success(result.message || 'Suggestion deleted successfully');
        fetchSuggestions(); // Refresh the list
      } else {
        message.error('Failed to delete suggestion');
      }
    } catch (error) {
      message.error('Error deleting suggestion: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      render: (userName) => <Text strong>{userName}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'Category' ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
      render: (suggestion) => <Text>{suggestion}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          {record.type === 'Service' && (
            <Button
              type="primary"
              size="small"
              onClick={() => showServiceModal(record)}
            >
              Add Service
            </Button>
          )}
          {record.type === 'Category' && (
            <Button
              type="default"
              size="small"
              onClick={() => showCategoryModal(record)}
            >
              Add Category
            </Button>
          )}
          <Button
            type="default"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className="rounded-2xl shadow-md p-10">
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

        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : (
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
        )}
      </Card>

      {/* Category Modal */}
      <Modal
        title="Add Category"
        open={isCategoryModalVisible}
        onOk={handleCategoryOk}
        onCancel={handleCategoryCancel}
        width={1100}
        footer={[
          <Button key="reject" danger onClick={handleCategoryCancel}>
            Reject
          </Button>,
          <Button key="submit" type="primary" onClick={handleCategoryOk}>
            Add Category
          </Button>,
        ]}
      >
        {detailsLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <AddCategory record={selectedRecord} suggestionDetails={suggestionDetails} />
        )}
      </Modal>

      {/* Service Modal */}
      <Modal
        title="Add Service"
        open={isServiceModalVisible}
        onOk={handleServiceOk}
        onCancel={handleServiceCancel}
        width={1100}
        footer={[
          <Button key="reject" danger onClick={handleServiceCancel}>
            Reject
          </Button>,
          <Button key="submit" type="primary" onClick={handleServiceOk}>
            Add Service
          </Button>,
        ]}
      >
        {detailsLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <AddService record={selectedRecord} suggestionDetails={suggestionDetails} />
        )}
      </Modal>
    </>
  );
}