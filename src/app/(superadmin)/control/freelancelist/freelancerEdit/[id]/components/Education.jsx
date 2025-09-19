"use client";
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Table,
  Space,
  message,
  Select,
  Spin,
  Checkbox,
  Typography,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  BookOutlined,
  LaptopOutlined,
  SaveOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

// Mock API functions - replace with actual API calls
const mockApi = {
  getFeUProfessional: async (id) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        u_profile: {
          fp_occupation: "Software Developer",
          fp_ex_year: "2 to 5 year",
          fp_add_edu_profile: "1",
        },
        fe_edu: [
          {
            fc_id: 1,
            fc_type: "UG",
            fc_title: "Computer Science",
            fc_year: "2020",
            fc_collage: "ABC University",
          },
          {
            fc_id: 2,
            fc_type: "PG",
            fc_title: "Software Engineering",
            fc_year: "2022",
            fc_collage: "XYZ University",
          },
        ],
        fe_work: [
          {
            fj_id: 1,
            fj_position: "Frontend Developer at Tech Corp",
            fj_year: "2020-2022",
            fj_desc:
              "Developed responsive web applications using React and Vue.js",
          },
          {
            fj_id: 2,
            fj_position: "Full Stack Developer at StartupXYZ",
            fj_year: "2022-Present",
            fj_desc: "Built complete web solutions using MERN stack",
          },
        ],
      },
    };
  },
  storeFeUProfessional: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Store All Professional Data:", data);
    return { data: { message: "Professional info saved" } };
  },
  updateFeUProfessional: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Update Professional Info:", data);
    return { data: { message: "Professional info updated" } };
  },
  updateFeUEducation: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Update Education Data:", data);
    return { data: { message: "Education updated" } };
  },
  updateFeUExperience: async (id, data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Update Experience Data:", data);
    return { data: { message: "Experience updated" } };
  },
};

const FieldGroup = ({ title, children, onRemove, canRemove }) => (
  <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 relative">
    <div className="flex justify-between items-start mb-4">
      <Text strong className="text-gray-700">
        {title}
      </Text>
      {canRemove && (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={onRemove}
          size="small"
          className="absolute top-2 right-2"
        />
      )}
    </div>
    {children}
  </div>
);

export default function AdminProfessionalPage({ userId = "123" }) {
  // --- STATE MANAGEMENT ---
  const [professionalForm] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [experienceForm] = Form.useForm();

  // Loading states
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSavingProfessional, setIsSavingProfessional] = useState(false);
  const [isSavingEducation, setIsSavingEducation] = useState(false);
  const [isSavingExperience, setIsSavingExperience] = useState(false);

  // Edit mode states
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);

  const [hasExistingData, setHasExistingData] = useState(false);

  // Data states
  const [professionalData, setProfessionalData] = useState(null);
  const [educationData, setEducationData] = useState([]);
  const [experienceData, setExperienceData] = useState([]);

  // --- CONSTANTS ---
  const educationTypes = [
    { value: "High School", label: "High School" },
    { value: "UG", label: "Undergraduate (UG)" },
    { value: "PG", label: "Postgraduate (PG)" },
    { value: "Other", label: "Freelancer Expertise" },
  ];

  const experienceYears = [
    { value: "0 to 1 year", label: "0 to 1 year" },
    { value: "1 to 2 year", label: "1 to 2 year" },
    { value: "2 to 5 year", label: "2 to 5 year" },
    { value: "5 to 10 year", label: "5 to 10 year" },
    { value: "10 above", label: "10+ years" },
  ];

  // --- DATA FETCHING ---
  const fetchProfessionalData = async () => {
    try {
      setIsDataLoading(true);
      const response = await mockApi.getFeUProfessional(userId);

      if (response.data && response.data.u_profile) {
        const { u_profile, fe_edu, fe_work } = response.data;
        setHasExistingData(true);
        setProfessionalData(u_profile);
        setEducationData(fe_edu || []);
        setExperienceData(fe_work || []);

        professionalForm.setFieldsValue({
          occupation: u_profile?.fp_occupation,
          yearsOfExperience: u_profile?.fp_ex_year,
          fp_add_edu_profile: u_profile?.fp_add_edu_profile === "1",
        });
        educationForm.setFieldsValue({ education: fe_edu || [] });
        experienceForm.setFieldsValue({ experience: fe_work || [] });
      } else {
        setHasExistingData(false);
        setIsEditingProfessional(true);
        setIsEditingEducation(true);
        setIsEditingExperience(true);
      }
    } catch (error) {
      console.error("Error fetching professional data:", error);
      message.error("Failed to load professional data");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionalData();
  }, [userId]);

  // --- FORM HANDLERS ---
  const onFinishProfessional = async (values) => {
    setIsSavingProfessional(true);
    try {
      const payload = {
        ...values,
        fp_add_edu_profile: values.fp_add_edu_profile ? "1" : "0",
      };
      await mockApi.updateFeUProfessional(userId, payload);
      message.success("Professional info updated successfully!");
      setIsEditingProfessional(false);
      await fetchProfessionalData();
    } catch (error) {
      message.error("Failed to save professional info.");
    } finally {
      setIsSavingProfessional(false);
    }
  };

  const onFinishEducation = async (values) => {
    setIsSavingEducation(true);
    const { education } = values;
    try {
      const updatePromises = education
        .filter((edu) => edu && edu.fc_type && edu.fc_year)
        .map((edu) => {
          const payload = {
            fc_type: edu.fc_type,
            fc_title: edu.fc_title || null,
            fc_collage: edu.fc_collage || null,
            fc_year: edu.fc_year,
          };
          if (edu.fc_id) {
            payload.fc_id = btoa(edu.fc_id.toString());
          }
          return mockApi.updateFeUEducation(userId, payload);
        });

      await Promise.all(updatePromises);
      message.success("Education details saved successfully!");
      setIsEditingEducation(false);
      await fetchProfessionalData();
    } catch (error) {
      message.error("An error occurred while saving education details.");
    } finally {
      setIsSavingEducation(false);
    }
  };

  const onFinishExperience = async (values) => {
    setIsSavingExperience(true);
    const { experience } = values;
    try {
      const updatePromises = experience
        .filter((exp) => exp && (exp.fj_position || exp.fj_desc))
        .map((exp) => {
          const payload = {
            fj_position: exp.fj_position,
            fj_year: exp.fj_year,
            fj_desc: exp.fj_desc,
          };
          if (exp.fj_id) {
            payload.fj_id = btoa(exp.fj_id.toString());
          }
          return mockApi.updateFeUExperience(userId, payload);
        });
      await Promise.all(updatePromises);
      message.success("Work experience saved successfully!");
      setIsEditingExperience(false);
      await fetchProfessionalData();
    } catch (error) {
      message.error("An error occurred while saving work experience.");
    } finally {
      setIsSavingExperience(false);
    }
  };

  // --- RENDER LOGIC ---
  if (isDataLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Loading professional data...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // --- UI COMPONENTS ---
  const ProfessionalDisplay = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Text strong>Occupation: </Text>
        <Text>{professionalData?.fp_occupation || "Not specified"}</Text>
      </Col>
      <Col xs={24} md={8}>
        <Text strong>Experience: </Text>
        <Text>{professionalData?.fp_ex_year || "Not specified"}</Text>
      </Col>
      <Col xs={24} md={8}>
        <Text strong>Show Education on Profile: </Text>
        <Tag color={professionalData?.fp_add_edu_profile === "1" ? "green" : "red"}>
          {professionalData?.fp_add_edu_profile === "1" ? "Yes" : "No"}
        </Tag>
      </Col>
    </Row>
  );

  const ProfessionalForm = () => (
    <Form form={professionalForm} layout="vertical" onFinish={onFinishProfessional} initialValues={{ fp_add_edu_profile: professionalData?.fp_add_edu_profile === "1" }}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="occupation" label="Current Occupation" rules={[{ required: true, message: "Please enter occupation" }]}>
            <Input placeholder="e.g., Software Engineer" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="yearsOfExperience" label="Total Experience" rules={[{ required: true, message: "Please select experience" }]}>
            <Select placeholder="Select experience" size="large">
              {experienceYears.map((exp) => (<Option key={exp.value} value={exp.value}>{exp.label}</Option>))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item name="fp_add_edu_profile" valuePropName="checked">
            <Checkbox>Add education details to user's public profile</Checkbox>
          </Form.Item>
        </Col>
      </Row>
      <Space>
        <Button type="primary" htmlType="submit" loading={isSavingProfessional} icon={<SaveOutlined />}>Save</Button>
        <Button onClick={() => setIsEditingProfessional(false)} icon={<CloseCircleOutlined />}>Cancel</Button>
      </Space>
    </Form>
  );

  const EducationDisplay = () => (
    <Table
      columns={[
        { title: "Type", dataIndex: "fc_type", key: "type", render: (text) => <Tag color="blue">{text}</Tag> },
        { title: "Title/Specialization", dataIndex: "fc_title", key: "title" },
        { title: "Institution", dataIndex: "fc_collage", key: "institution" },
        { title: "Year", dataIndex: "fc_year", key: "year" },
      ]}
      dataSource={educationData}
      pagination={false}
      size="small"
      rowKey="fc_id"
      locale={{ emptyText: "No education records found." }}
    />
  );

  // Sub-component for a single education item to handle conditional logic
  const EducationFormItem = ({ form, name, restField }) => {
    const educationType = Form.useWatch(["education", name, "fc_type"], form);

    return (
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item {...restField} name={[name, "fc_type"]} label="Education Type" rules={[{ required: true }]}>
            <Select placeholder="Select type" size="large">
              {educationTypes.map((type) => (<Option key={type.value} value={type.value}>{type.label}</Option>))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item {...restField} name={[name, "fc_year"]} label="Year" rules={[{ required: true, message: "Year is required" }]}>
            <Input placeholder="e.g., 2020" size="large" />
          </Form.Item>
        </Col>

        {/* Conditional Specialization/Title */}
        {educationType !== "High School" && (
          <Col xs={24} md={12}>
            <Form.Item
              {...restField}
              name={[name, "fc_title"]}
              label="Title/Specialization"
              rules={[{ required: educationType === "Other", message: "Specialization is required for Freelancer Expertise" }]}
            >
              <Input placeholder="e.g., Web Development" size="large" />
            </Form.Item>
          </Col>
        )}

        {/* Conditional Institution */}
        {(educationType === "UG" || educationType === "PG") && (
          <Col xs={24} md={12}>
            <Form.Item {...restField} name={[name, "fc_collage"]} label="Institution">
              <Input placeholder="e.g., XYZ University" size="large" />
            </Form.Item>
          </Col>
        )}
        
        <Form.Item {...restField} name={[name, 'fc_id']} hidden><Input /></Form.Item>
      </Row>
    );
  };

  const EducationForm = () => (
    <Form form={educationForm} onFinish={onFinishEducation} autoComplete="off">
      <Form.List name="education">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <FieldGroup key={key} title={`Education Entry ${name + 1}`} onRemove={() => remove(name)} canRemove={fields.length > 0}>
                <EducationFormItem form={educationForm} name={name} restField={restField} />
              </FieldGroup>
            ))}
            <Button type="dashed" onClick={() => add({ fc_type: 'UG', fc_year: '', fc_title: '', fc_collage: '' })} block icon={<PlusOutlined />} size="large">
              Add Education
            </Button>
          </>
        )}
      </Form.List>
      <Space className="mt-4">
        <Button type="primary" htmlType="submit" loading={isSavingEducation} icon={<SaveOutlined />}>Save Education</Button>
        <Button onClick={() => { setIsEditingEducation(false); educationForm.resetFields(); }} icon={<CloseCircleOutlined />}>Cancel</Button>
      </Space>
    </Form>
  );

  const ExperienceDisplay = () => (
    <Table
      columns={[
        { title: "Position", dataIndex: "fj_position", key: "position" },
        { title: "Duration", dataIndex: "fj_year", key: "duration", render: (text) => <Tag color="green">{text}</Tag> },
        { title: "Description", dataIndex: "fj_desc", key: "description" },
      ]}
      dataSource={experienceData}
      pagination={false}
      size="small"
      rowKey="fj_id"
      locale={{ emptyText: "No experience records found." }}
    />
  );

  const ExperienceForm = () => (
    <Form form={experienceForm} onFinish={onFinishExperience} autoComplete="off">
      <Form.List name="experience">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <FieldGroup key={key} title={`Experience Entry ${name + 1}`} onRemove={() => remove(name)} canRemove={fields.length > 0}>
                <Row gutter={16}>
                  <Col xs={24} md={12}><Form.Item {...restField} name={[name, "fj_position"]} label="Position & Company" rules={[{ required: true }]}>
                    <Input placeholder="e.g., Senior Developer at Tech Corp" size="large" />
                  </Form.Item></Col>
                  <Col xs={24} md={12}><Form.Item {...restField} name={[name, "fj_year"]} label="Duration" rules={[{ required: true }]}>
                    <Input placeholder="e.g., 2020-2022" size="large" />
                  </Form.Item></Col>
                  <Col xs={24}><Form.Item {...restField} name={[name, "fj_desc"]} label="Job Description" rules={[{ required: true }]}>
                    <TextArea rows={3} placeholder="Describe responsibilities..." />
                  </Form.Item></Col>
                </Row>
                <Form.Item {...restField} name={[name, "fj_id"]} hidden><Input /></Form.Item>
              </FieldGroup>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">Add Experience</Button>
          </>
        )}
      </Form.List>
      <Space className="mt-4">
        <Button type="primary" htmlType="submit" loading={isSavingExperience} icon={<SaveOutlined />}>Save Experience</Button>
        <Button onClick={() => { setIsEditingExperience(false); experienceForm.resetFields(); }} icon={<CloseCircleOutlined />}>Cancel</Button>
      </Space>
    </Form>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={3} className="!mb-2"><UserOutlined className="mr-2" />Professional Management</Title>
          <Text type="secondary">Manage details for User #{userId}</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchProfessionalData} loading={isDataLoading}>Refresh</Button>
      </div>

      <Space direction="vertical" size="large" className="w-full">
        <Card
          title="Professional Information"
          extra={!isEditingProfessional && hasExistingData && <Button icon={<EditOutlined />} onClick={() => setIsEditingProfessional(true)}>Edit</Button>}
        >
          {isEditingProfessional ? <ProfessionalForm /> : <ProfessionalDisplay />}
        </Card>

        <Card
          title="Education"
          extra={!isEditingEducation && hasExistingData && <Button icon={<EditOutlined />} onClick={() => setIsEditingEducation(true)}>Edit</Button>}
        >
          {isEditingEducation ? <EducationForm /> : <EducationDisplay />}
        </Card>

        <Card
          title="Work Experience"
          extra={!isEditingExperience && hasExistingData && <Button icon={<EditOutlined />} onClick={() => setIsEditingExperience(true)}>Edit</Button>}
        >
          {isEditingExperience ? <ExperienceForm /> : <ExperienceDisplay />}
        </Card>
      </Space>
    </div>
  );
}