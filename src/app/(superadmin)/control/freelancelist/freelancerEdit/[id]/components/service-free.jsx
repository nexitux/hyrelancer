import React, { useState, useEffect } from "react";
import {
  Form,Select,Button,Card,Row,Col,Table,Space,message,Popconfirm,Tag,Input,Modal,
  Checkbox,Upload,Progress,Typography,Divider,Alert
} from "antd";
import {
  PlusOutlined,EditOutlined,DeleteOutlined,CheckOutlined,CloseOutlined,UploadOutlined,
  GlobalOutlined,EnvironmentOutlined,ClockCircleOutlined,DollarOutlined,IdcardOutlined
} from "@ant-design/icons";

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

// Mock data - replace with actual API calls
const mockData = {
  serviceTypes: [
    { sc_id: 1, sc_name: "Web Development" },
    { sc_id: 2, sc_name: "Graphic Design" },
    { sc_id: 3, sc_name: "Digital Marketing" },
    { sc_id: 4, sc_name: "Other" }
  ],
  services: [
    { se_id: 1, se_sc_id: 1, se_name: "Frontend Development" },
    { se_id: 2, se_sc_id: 1, se_name: "Backend Development" },
    { se_id: 3, se_sc_id: 2, se_name: "Logo Design" },
    { se_id: 4, se_sc_id: 2, se_name: "Web Design" },
    { se_id: 5, se_sc_id: 3, se_name: "SEO" },
    { se_id: 6, se_sc_id: 1, se_name: "Other" }
  ],
  states: [
    { s_id: 1, s_name: "Kerala" },
    { s_id: 2, s_name: "Tamil Nadu" },
    { s_id: 3, s_name: "Karnataka" }
  ],
  cities: [
    { cit_id: 1, cit_state_id: 1, cit_name: "Kochi" },
    { cit_id: 2, cit_state_id: 1, cit_name: "Thiruvananthapuram" },
    { cit_id: 3, cit_state_id: 2, cit_name: "Chennai" },
    { cit_id: 4, cit_state_id: 3, cit_name: "Bangalore" }
  ]
};

export default function AdminServicePage() {
  const [form] = Form.useForm();
  const [categorySuggestionForm] = Form.useForm();
  const [serviceSuggestionForm] = Form.useForm();
  
  // State management
  const [serviceTypes, setServiceTypes] = useState(mockData.serviceTypes);
  const [allServices, setAllServices] = useState(mockData.services);
  const [states, setStates] = useState(mockData.states);
  const [cities, setCities] = useState(mockData.cities);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRemote, setIsRemote] = useState(false);

  // Selection state
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  // Table data
  const [serviceTableData, setServiceTableData] = useState([]);
  const [areaTableData, setAreaTableData] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [serviceSuggestions, setServiceSuggestions] = useState([]);

  // Modal state
  const [categorySuggestionModal, setCategorySuggestionModal] = useState({
    isOpen: false,
    serviceTypeId: null
  });
  const [serviceSuggestionModal, setServiceSuggestionModal] = useState({
    isOpen: false,
    serviceTypeId: null
  });

  // Helper functions
  const getServiceTypeName = (id) => {
    const serviceType = serviceTypes.find(st => st.sc_id == id);
    return serviceType ? serviceType.sc_name : `Service Type #${id}`;
  };

  const getServiceName = (id) => {
    const service = allServices.find(s => s.se_id == id);
    return service ? service.se_name : `Service #${id}`;
  };

  const getStateName = (id) => {
    const state = states.find(s => s.s_id == id);
    return state ? state.s_name : `State #${id}`;
  };

  const getCityName = (id) => {
    const city = cities.find(c => c.cit_id == id);
    return city ? city.cit_name : `City #${id}`;
  };

  const getCitiesForState = (stateId) => {
    return cities.filter(city => city.cit_state_id == stateId);
  };

  const getFilteredServices = (serviceTypeId) => {
    if (!serviceTypeId) return [];
    return allServices.filter(service => service.se_sc_id == serviceTypeId);
  };

  const isOtherServiceType = (serviceTypeId) => {
    const serviceType = serviceTypes.find(st => st.sc_id == serviceTypeId);
    return serviceType && serviceType.sc_name && serviceType.sc_name.toLowerCase() === 'other';
  };

  const isOtherService = (serviceId) => {
    const service = allServices.find(s => s.se_id == serviceId);
    return service && service.se_name && service.se_name.toLowerCase() === 'other';
  };

  // Event handlers
  const handleServiceTypeChange = (value) => {
    setSelectedServiceType(value);
    setSelectedService("");

    if (isOtherServiceType(value)) {
      setCategorySuggestionModal({
        isOpen: true,
        serviceTypeId: value
      });
    }
  };

  const handleServiceChange = (value) => {
    setSelectedService(value);

    if (isOtherService(value)) {
      setServiceSuggestionModal({
        isOpen: true,
        serviceTypeId: selectedServiceType
      });
    }
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    const existingArea = areaTableData.find(item => item.state === value);
    setSelectedCities(existingArea ? existingArea.cities.map(c => c.cit_id) : []);
  };

  const addServiceToTable = () => {
    if (!selectedServiceType || !selectedService) {
      message.error("Please select both service type and service");
      return;
    }

    if (isOtherServiceType(selectedServiceType) || isOtherService(selectedService)) {
      message.warning("Please complete the suggestion process for 'Other' options");
      return;
    }

    setServiceTableData(prev => {
      const newList = [...prev];
      const index = newList.findIndex(item => item.serviceType === selectedServiceType);

      if (index >= 0) {
        if (newList[index].services.some(s => s.se_id === selectedService)) {
          message.warning("This service is already in your list");
          return prev;
        }
        newList[index].services.push({ se_id: selectedService });
      } else {
        newList.push({
          key: `${selectedServiceType}-${Date.now()}`,
          serviceType: selectedServiceType,
          services: [{ se_id: selectedService }]
        });
      }
      message.success("Service added to list");
      return newList;
    });

    setSelectedServiceType("");
    setSelectedService("");
  };

  const addAreaToTable = () => {
    if (!selectedState || selectedCities.length === 0) {
      message.error("Please select both state and at least one city");
      return;
    }

    setAreaTableData(prev => {
      const newList = [...prev];
      const index = newList.findIndex(item => item.state === selectedState);
      const currentCities = index >= 0 ? newList[index].cities.map(c => c.cit_id) : [];
      const newCitiesToAdd = selectedCities.filter(cId => !currentCities.includes(cId));

      if (newCitiesToAdd.length === 0) {
        message.warning("All selected cities are already in your list");
        return prev;
      }

      const addedCityObjects = newCitiesToAdd.map(cId => ({ cit_id: cId }));

      if (index >= 0) {
        newList[index].cities = [...newList[index].cities, ...addedCityObjects];
      } else {
        newList.push({
          key: selectedState,
          state: selectedState,
          cities: addedCityObjects
        });
      }
      message.success("Service area added successfully");
      return newList;
    });

    setSelectedState("");
    setSelectedCities([]);
  };

  const removeServiceFromType = (serviceType, seId) => {
    setServiceTableData(prev => prev.map(group => {
      if (group.serviceType === serviceType) {
        const newServices = group.services.filter(s => s.se_id !== seId);
        if (newServices.length === 0) return null;
        return { ...group, services: newServices };
      }
      return group;
    }).filter(Boolean));
  };

  const removeCityFromState = (stateId, citId) => {
    setAreaTableData(prev => prev.map(group => {
      if (group.state === stateId) {
        const newCities = group.cities.filter(c => c.cit_id !== citId);
        if (newCities.length === 0) return null;
        return { ...group, cities: newCities };
      }
      return group;
    }).filter(Boolean));
  };

  // Suggestion handlers
  const addCategorySuggestionToTable = () => {
    const values = categorySuggestionForm.getFieldsValue();

    if (!values.suggestion || values.suggestion.trim() === '') {
      message.error("Please enter your suggestion");
      return;
    }

    const newSuggestion = {
      key: `category-${Date.now()}`,
      serviceTypeId: categorySuggestionModal.serviceTypeId,
      serviceTypeName: getServiceTypeName(categorySuggestionModal.serviceTypeId),
      suggestion: values.suggestion.trim(),
      status: 'pending',
      type: 'category'
    };

    setCategorySuggestions(prev => [...prev, newSuggestion]);
    categorySuggestionForm.resetFields();
    setCategorySuggestionModal({ isOpen: false, serviceTypeId: null });
    setSelectedServiceType("");
    message.success("Category suggestion added");

    // Open service suggestion modal
    setTimeout(() => {
      setServiceSuggestionModal({
        isOpen: true,
        serviceTypeId: categorySuggestionModal.serviceTypeId
      });
    }, 200);
  };

  const addServiceSuggestionToTable = () => {
    const values = serviceSuggestionForm.getFieldsValue();

    if (!values.suggestion || values.suggestion.trim() === '') {
      message.error("Please enter your suggestion");
      return;
    }

    const newSuggestion = {
      key: `service-${Date.now()}`,
      serviceTypeId: serviceSuggestionModal.serviceTypeId,
      serviceTypeName: getServiceTypeName(serviceSuggestionModal.serviceTypeId),
      serviceId: selectedService,
      serviceName: getServiceName(selectedService),
      suggestion: values.suggestion.trim(),
      status: 'pending',
      type: 'service'
    };

    setServiceSuggestions(prev => [...prev, newSuggestion]);
    setSelectedServiceType("");
    setSelectedService("");
    setServiceSuggestionModal({ isOpen: false, serviceTypeId: null });
    serviceSuggestionForm.resetFields();
    message.success("Service suggestion added");
  };

  const removeCategorySuggestion = (key) => {
    setCategorySuggestions(prev => prev.filter(item => item.key !== key));
  };

  const removeServiceSuggestion = (key) => {
    setServiceSuggestions(prev => prev.filter(item => item.key !== key));
  };

  // File upload handlers
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
      return Upload.LIST_IGNORE;
    }
    if (!isLt10M) {
      message.error("Image must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  // Form submission
  const onFinish = async (values) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const payload = {
        worktime: values.worktime,
        amountType: values.amountType,
        amount: values.amount,
        idType: values.idType,
        idNumber: values.idNumber,
        paymentMethod: 'Through Hyerlancer',
        is_remote: values.is_remote ? 1 : 0,
        cities: values.is_remote ? [] : areaTableData.flatMap(group => 
          group.cities.map(city => `${group.state}_${city.cit_id}`)
        ),
        services: serviceTableData.flatMap(group => 
          group.services.map(serv => `${group.serviceType}_${serv.se_id}`)
        ),
        categorySuggestions: categorySuggestions,
        serviceSuggestions: serviceSuggestions
      };

      console.log('Payload:', payload);
      message.success("Service details saved successfully!");
      
      // Reset form
      form.resetFields();
      setServiceTableData([]);
      setAreaTableData([]);
      setCategorySuggestions([]);
      setServiceSuggestions([]);
      setFileList([]);
      setIsRemote(false);
      
    } catch (error) {
      message.error("Failed to save service details");
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const fields = ["worktime", "amountType", "amount", "idType", "idNumber"];
    const values = form.getFieldsValue(fields);
    const filledFields = fields.filter((field) => {
      const value = values[field];
      return value && value.toString().trim() !== "";
    });

    const serviceProgress = serviceTableData.length > 0 ? 2 : 0;
    const areaProgress = (areaTableData.length > 0 || isRemote) ? 2 : 0;
    const fileProgress = fileList.length > 0 ? 1 : 0;

    return Math.round(((filledFields.length + serviceProgress + areaProgress + fileProgress) / 10) * 100);
  };

  // Table columns
  const serviceColumns = [
    {
      title: 'Service Category',
      key: 'serviceCategory',
      render: (_, record) => (
        <Text strong className="text-blue-600">
          {getServiceTypeName(record.serviceType)}
        </Text>
      ),
    },
    {
      title: 'Services',
      key: 'services',
      render: (_, record) => (
        <Space wrap>
          {record.services.map((serv, index) => (
            <Tag
              key={index}
              color="green"
              closable
              onClose={(e) => {
                e.preventDefault();
                removeServiceFromType(record.serviceType, serv.se_id);
              }}
            >
              {getServiceName(serv.se_id)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  const areaColumns = [
    {
      title: 'State',
      key: 'state',
      render: (_, record) => (
        <Text strong className="text-blue-600">
          {getStateName(record.state)}
        </Text>
      ),
    },
    {
      title: 'Cities',
      key: 'cities',
      render: (_, record) => (
        <Space wrap>
          {record.cities.map((city, index) => (
            <Tag
              key={index}
              color="green"
              closable
              onClose={(e) => {
                e.preventDefault();
                removeCityFromState(record.state, city.cit_id);
              }}
            >
              {getCityName(city.cit_id)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  const suggestionColumns = [
    {
      title: 'Category',
      dataIndex: 'serviceTypeName',
      key: 'serviceTypeName',
    },
    {
      title: 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text) => text || '-',
    },
    {
      title: 'Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'category' ? 'blue' : 'green'}>
          {type === 'category' ? 'Category' : 'Service'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="processing">Pending</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            if (record.type === 'category') {
              removeCategorySuggestion(record.key);
            } else {
              removeServiceSuggestion(record.key);
            }
          }}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <div className="mb-6">
          <Title level={3} className="!mb-2">Service Management</Title>
          <Text type="secondary">Configure service offerings, areas, and professional details</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            paymentMethod: "Through Hyerlancer",
            is_remote: false,
          }}
        >
          {/* Service Selection */}
          <Card className="mb-6" title={<><GlobalOutlined className="mr-2" />Service Information</>}>
            <Row gutter={16} className="mb-4" align="bottom">
              <Col xs={24} md={8}>
                <Form.Item label={<Text strong>Service Category</Text>} className="mb-0">
                  <Select
                    value={selectedServiceType}
                    placeholder="Select category"
                    onChange={handleServiceTypeChange}
                    className="w-full"
                    size="large"
                  >
                    {serviceTypes.map((serviceType) => (
                      <Option key={serviceType.sc_id} value={serviceType.sc_id}>
                        {serviceType.sc_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label={<Text strong>Service</Text>} className="mb-0">
                  <Select
                    value={selectedService}
                    placeholder={selectedServiceType ? "Select service" : "First select a category"}
                    className="w-full"
                    size="large"
                    onChange={handleServiceChange}
                    disabled={!selectedServiceType}
                  >
                    {getFilteredServices(selectedServiceType).map((service) => (
                      <Option key={service.se_id} value={service.se_id}>
                        {service.se_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label={<span>&nbsp;</span>} className="mb-0">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addServiceToTable}
                    size="large"
                    className="w-full"
                    disabled={!selectedServiceType || !selectedService}
                  >
                    Add Service
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            <Table
              columns={serviceColumns}
              dataSource={serviceTableData}
              pagination={false}
              locale={{
                emptyText: "No services added yet"
              }}
            />
          </Card>

          {/* Service Area Selection */}
          <Card className="mb-6" title={<><EnvironmentOutlined className="mr-2" />Service Areas</>}>
            <Form.Item name="is_remote" valuePropName="checked" className="mb-4">
              <Checkbox onChange={(e) => setIsRemote(e.target.checked)}>
                Work remotely (worldwide)
              </Checkbox>
            </Form.Item>

            {!isRemote && (
              <>
                <Row gutter={16} className="mb-4" align="bottom">
                  <Col xs={24} md={8}>
                    <Form.Item label={<Text strong>State</Text>} className="mb-0">
                      <Select
                        value={selectedState}
                        placeholder="Select state"
                        onChange={handleStateChange}
                        className="w-full"
                        size="large"
                      >
                        {states.map((state) => (
                          <Option key={state.s_id} value={state.s_id}>
                            {state.s_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<Text strong>Cities</Text>} className="mb-0">
                      <Select
                        mode="multiple"
                        value={selectedCities}
                        placeholder={selectedState ? "Select cities" : "First select a state"}
                        className="w-full"
                        size="large"
                        onChange={setSelectedCities}
                        disabled={!selectedState}
                      >
                        {getCitiesForState(selectedState).map((city) => (
                          <Option key={city.cit_id} value={city.cit_id}>
                            {city.cit_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label={<span>&nbsp;</span>} className="mb-0">
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addAreaToTable}
                        size="large"
                        className="w-full"
                        disabled={!selectedState || selectedCities.length === 0}
                      >
                        Add Area
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>

                <Table
                  columns={areaColumns}
                  dataSource={areaTableData}
                  pagination={false}
                  locale={{
                    emptyText: "No service areas added yet"
                  }}
                />
              </>
            )}

            {isRemote && (
              <Alert
                message="Remote Work Enabled"
                description="You can work with clients worldwide without geographical restrictions."
                type="success"
                showIcon
                className="mt-4"
              />
            )}
          </Card>

          {/* Work Details */}
          <Card className="mb-6" title={<><ClockCircleOutlined className="mr-2" />Work Details</>}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="worktime"
                  label="Work Completion Time"
                >
                  <Select placeholder="Select time" size="large">
                    <Option value="In a Week">In a Week</Option>
                    <Option value="24 Hours">24 Hours</Option>
                    <Option value="After 2 Days">After 2 Days</Option>
                    <Option value="Tomorrow">Tomorrow</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="amountType"
                  label="Payment Terms"
                >
                  <Select placeholder="Select type" size="large">
                    <Option value="Work">Per project/Work</Option>
                    <Option value="Hour">Hourly Basis</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="amount"
                  label="Standard Rate (INR)"
                >
                  <Input
                    placeholder="Enter amount"
                    prefix={<DollarOutlined />}
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ID Verification */}
          <Card className="mb-6" title={<><IdcardOutlined className="mr-2" />ID Verification</>}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="idType"
                  label="ID Type"
                >
                  <Select placeholder="Select ID type" size="large">
                    <Option value="Aadhaar Card">Aadhar Card</Option>
                    <Option value="PAN Card">PAN Card</Option>
                    <Option value="Passport">Passport</Option>
                    <Option value="Driving License">Driving License</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="idNumber"
                  label="ID Number"
                >
                  <Input placeholder="Enter ID number" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="idFile"
                  label="Upload ID Proof"
                >
                  <Upload
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={handleFileChange}
                    maxCount={1}
                    accept="image/*"
                    listType="picture"
                  >
                    <Button icon={<UploadOutlined />} size="large">
                      Upload ID Proof
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Suggestions */}
          {(categorySuggestions.length > 0 || serviceSuggestions.length > 0) && (
            <Card className="mb-6" title="Suggestions">
              <Table
                columns={suggestionColumns}
                dataSource={[...categorySuggestions, ...serviceSuggestions]}
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {/* Progress and Submit */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <Text strong>Completion Progress</Text>
              <Text>{calculateProgress()}%</Text>
            </div>
            <Progress percent={calculateProgress()} strokeColor="#1890ff" />
          </div>

          <div className="text-center">
            <Button type="primary" htmlType="submit" size="large" loading={loading} icon={<CheckOutlined />}>
              Save Service Details
            </Button>
          </div>
        </Form>
      </Card>

      {/* Category Suggestion Modal */}
      <Modal
        title="Suggest New Category"
        open={categorySuggestionModal.isOpen}
        onCancel={() => {
          setCategorySuggestionModal({ isOpen: false, serviceTypeId: null });
          categorySuggestionForm.resetFields();
          setSelectedServiceType("");
        }}
        footer={null}
      >
        <Form
          form={categorySuggestionForm}
          layout="vertical"
          onFinish={addCategorySuggestionToTable}
        >
          <Form.Item
            name="suggestion"
            label="Category Suggestion"
            rules={[
              { required: true, message: "Please enter your suggestion" },
              { min: 3, message: "Suggestion must be at least 3 characters" }
            ]}
          >
            <TextArea
              placeholder="Enter new category name..."
              rows={3}
              maxLength={200}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => {
              setCategorySuggestionModal({ isOpen: false, serviceTypeId: null });
              categorySuggestionForm.resetFields();
              setSelectedServiceType("");
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Add Suggestion
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Service Suggestion Modal */}
      <Modal
        title="Suggest New Service"
        open={serviceSuggestionModal.isOpen}
        onCancel={() => {
          setServiceSuggestionModal({ isOpen: false, serviceTypeId: null });
          serviceSuggestionForm.resetFields();
          setSelectedService("");
        }}
        footer={null}
      >
        <Form
          form={serviceSuggestionForm}
          layout="vertical"
          onFinish={addServiceSuggestionToTable}
        >
          <Form.Item
            name="suggestion"
            label="Service Suggestion"
            rules={[
              { required: true, message: "Please enter your suggestion" },
              { min: 3, message: "Suggestion must be at least 3 characters" }
            ]}
          >
            <TextArea
              placeholder="Enter new service name..."
              rows={3}
              maxLength={200}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => {
              setServiceSuggestionModal({ isOpen: false, serviceTypeId: null });
              serviceSuggestionForm.resetFields();
              setSelectedService("");
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Add Suggestion
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}