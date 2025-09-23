"use client"
import { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { Table, Tag, Button, Modal, Form, Input, Select, Upload, message, Spin, Card, Row, Col, Popconfirm } from 'antd';
import adminApi from '../../../../config/adminApi';

const BadgesTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [form] = Form.useForm();
  const [badges, setBadges] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/getBadges');
      const transformedBadges = response.data.b_list.map(badge => ({
        ...badge,
        key: badge.b_id.toString()
      }));
      setBadges(transformedBadges);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching badges:', error);
      message.error('Failed to load badges');
      setLoading(false);
    }
  };

  const handleDelete = async (badgeId, badgeName) => {
    try {
      setDeleteLoading(badgeId);
      console.log('Attempting to delete badge:', { badgeId, badgeName });
      
      const encodedId = btoa(badgeId.toString());
      console.log('Deleting with encoded ID:', encodedId);
      
      const deleteResponse = await adminApi.delete(`/deleteBadge/${encodedId}`);
      console.log('Delete response:', deleteResponse);

      if (deleteResponse.status === 200 || deleteResponse.status === 204) {
        setBadges(prev => prev.filter(badge => badge.b_id !== badgeId));
        message.success(`Badge "${badgeName}" deleted successfully`);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      message.error(`Failed to delete badge: ${error.response?.data?.message || error.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setModalLoading(true);

    try {
      form.setFieldsValue({
        b_name: badge.b_name,
        b_point: badge.b_point,
        b_type: badge.b_type,
        b_desc: badge.b_desc,
        b_is_active: badge.b_is_active,
      });

      let imgUrl = badge.b_img;
      if (imgUrl && !imgUrl.startsWith('http')) {
        imgUrl = `https://test.hyrelancer.in${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
      }
      setImagePreview(imgUrl);

      setIsModalVisible(true);
    } catch (error) {
      console.error('Error loading badge details:', error);
      message.error('Failed to load badge details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBadge(null);
    setImageFile(null);
    setImagePreview(null);
    form.resetFields();
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      if (editingBadge) {
        const updateData = {
          b_id: btoa(editingBadge.b_id.toString()),
          b_name: values.b_name,
          b_desc: values.b_desc,
          b_point: values.b_point,
          b_type: values.b_type,
          b_is_active: values.b_is_active
        };

        if (imageFile) {
          try {
            const base64Image = await getBase64(imageFile);
            updateData.b_pic_file = base64Image;
          } catch (error) {
            console.error('Error converting image to base64:', error);
            message.error('Failed to process image');
            setModalLoading(false);
            return;
          }
        }

        await adminApi.put('/updateBadges', updateData);
        await fetchBadges();
        message.success('Badge updated successfully');
      }

      handleCancel();
    } catch (err) {
      console.error(err);
      // Check if the error is specifically about b_name validation
      if (err.errorFields && err.errorFields.some(field => field.name[0] === 'b_name')) {
        message.error('Please enter a valid badge name');
      } else {
        message.error('Failed to save badge');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      
      // Check file size (limit to 2MB)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return Upload.LIST_IGNORE;
      }
      
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      return false; // prevent automatic upload
    },
    onChange: (info) => {
      if (info.file.status === 'removed') {
        setImageFile(null);
        setImagePreview(editingBadge?.b_img || null);
      }
    },
    showUploadList: false,
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'b_img',
      key: 'b_img',
      width: 100,
      render: (b_img) => {
        let imgUrl = b_img;
        if (imgUrl && !imgUrl.startsWith('http')) {
          imgUrl = `https://test.hyrelancer.in${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
        }
        return (
          <div className="flex justify-center items-center">
            <img 
              src={imgUrl} 
              alt="Badge" 
              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/64?text=No+Image';
              }}
            />
          </div>
        )
      }
    },
    {
      title: 'Name',
      dataIndex: 'b_name',
      key: 'b_name',
      sorter: (a, b) => a.b_name.localeCompare(b.b_name),
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>
    },
    {
      title: 'Description',
      dataIndex: 'b_desc',
      key: 'b_desc',
      render: (text) => <span className="text-gray-600">{text || 'No description'}</span>
    },
    {
      title: 'Points',
      dataIndex: 'b_point',
      key: 'b_point',
      sorter: (a, b) => (a.b_point || '').localeCompare(b.b_point || ''),
      render: (points) => points ? (
        <Tag color="blue" className="px-3 py-1 font-medium">{points}</Tag>
      ) : (
        <Tag color="default" className="px-3 py-1 font-medium">No points</Tag>
      )
    },
    {
      title: 'Type',
      dataIndex: 'b_type',
      key: 'b_type',
      render: (type) => (
        <Tag color="default" className="px-2 py-1 rounded-md">{type || 'No type'}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'b_is_active',
      key: 'b_is_active',
      filters: [
        { text: 'Active', value: 1 },
        { text: 'Inactive', value: 0 }
      ],
      onFilter: (value, record) => record.b_is_active === value,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'} className="px-2 py-1 rounded-md">
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex gap-2 items-center">
          <Popconfirm
            title="Delete Badge"
            description={`Are you sure you want to delete "${record.b_name}"?`}
            onConfirm={() => handleDelete(record.b_id, record.b_name)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
            placement="topRight"
            disabled={deleteLoading === record.b_id}
          >
            <Button 
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.b_id}
              className="flex items-center justify-center"
              title="Delete Badge"
            >
              Delete
            </Button>
          </Popconfirm>

          <Button 
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="flex items-center justify-center"
            title="Edit Badge"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Badges Management</h1>
          <p className="text-gray-600">Manage your badges and their requirements</p>
        </div>
        
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card className="text-center">
              <div className="text-blue-500 text-2xl mb-2"><TrophyOutlined/></div>
              <h3 className="font-semibold">Total Badges</h3>
              <p className="text-2xl font-bold">{badges.length}</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center">
              <div className="text-green-500 text-2xl mb-2"><TrophyOutlined/></div>
              <h3 className="font-semibold">Active Badges</h3>
              <p className="text-2xl font-bold">{badges.filter(b => b.b_is_active).length}</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center">
              <div className="text-orange-500 text-2xl mb-2"><TrophyOutlined/></div>
              <h3 className="font-semibold">Verification Badges</h3>
              <p className="text-2xl font-bold">{badges.filter(b => b.b_type && b.b_type.includes('verify')).length}</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="text-center">
              <div className="text-purple-500 text-2xl mb-2"><TrophyOutlined/></div>
              <h3 className="font-semibold">Point Badges</h3>
              <p className="text-2xl font-bold">{badges.filter(b => b.b_point && b.b_point !== '').length}</p>
            </Card>
          </Col>
        </Row>

        <Card title="Badges List" className="rounded-xl shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <Table 
              columns={columns} 
              dataSource={badges} 
              pagination={{ 
                pageSize: 5, 
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} badges`
              }} 
              className="rounded-lg overflow-hidden" 
              scroll={{ x: 1000 }}
            />
          )}
        </Card>
        
        <Modal 
          title="Edit Badge" 
          open={isModalVisible} 
          onOk={handleOk} 
          onCancel={handleCancel}
          okText="Update Badge"
          cancelText="Cancel"
          width={600}
          confirmLoading={modalLoading}
        >
          <Form form={form} layout="vertical" className="mt-4">
            <div className="flex space-x-6">
              <Form.Item label="Badge Image" className="flex-1">
                <Upload {...uploadProps} listType="picture-card">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Badge" className="w-full h-full object-cover rounded-lg"/>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2">
                      <div className="text-2xl mb-2">+</div>
                      <div className="text-xs">Upload</div>
                    </div>
                  )}
                </Upload>
                <div className="text-xs text-gray-500 mt-2">
                  Click to upload a new image (max 2MB)
                </div>
              </Form.Item>
              <div className="flex-1 space-y-4">
                <Form.Item 
                  name="b_name" 
                  label="Badge Name" 
                  rules={[{ required: true, message: 'Please enter a badge name' }]}
                >
                  <Input placeholder="e.g., Registration Complete"/>
                </Form.Item>
                <Form.Item name="b_point" label="Points/Reward">
                  <Input placeholder="e.g., 50%, 100 points, etc."/>
                </Form.Item>
                <Form.Item 
                  name="b_type" 
                  label="Type" 
                  rules={[{ required: true, message: 'Please enter a badge type' }]}
                >
                  <Input placeholder="Badge Type"/>
                </Form.Item>
              </div>
            </div>
            <Form.Item 
              name="b_desc" 
              label="Description" 
              rules={[{ required: true, message: 'Please enter a description' }]}
            >
              <Input.TextArea rows={3} placeholder="Describe what this badge represents..."/>
            </Form.Item>
            <Form.Item name="b_is_active" label="Status" rules={[{ required: true }]} >
              <Select>
                <Select.Option value={1}>Active</Select.Option>
                <Select.Option value={0}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default BadgesTable;