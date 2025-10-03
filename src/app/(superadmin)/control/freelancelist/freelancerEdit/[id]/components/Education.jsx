"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Table,
  Space,
  message,
  Select,
  Checkbox,
  Typography,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  BookOutlined,
  CarryOutOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

const TokenManager = {
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken");
    }
    return null;
  },
  clearToken: () => {
    if (typeof window !== "undefined") localStorage.removeItem("adminToken");
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

export default function AdminProfessionalPage() {
  const params = useParams();
  const router = useRouter();
  const userIdBase64 = params?.id ? decodeURIComponent(params.id) : null;

  // --- STATE MANAGEMENT ---
  const [allForm] = Form.useForm(); // Single form for initial submission
  const [professionalForm] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [experienceForm] = Form.useForm();

  // Loading states
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSavingAll, setIsSavingAll] = useState(false); // For initial submission
  const [isSavingProfessional, setIsSavingProfessional] = useState(false);
  const [isSavingEducation, setIsSavingEducation] = useState(false);
  const [isSavingExperience, setIsSavingExperience] = useState(false);

  // Edit mode states
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);

  const [hasExistingData, setHasExistingData] = useState(false);
  const [error, setError] = useState(null);

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
    if (!userIdBase64) {
      setIsDataLoading(false);
      setError("Missing user ID in route.");
      return;
    }

    try {
      setIsDataLoading(true);
      setError(null);
      
      const token = TokenManager.getToken();
      const response = await fetch(`https://backend.hyrelancer.in/api/admin/getFeUProfessional/${userIdBase64}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error("Failed to parse response:", responseText);
        data = responseText;
      }

      if (!response.ok) {
        if (response.status === 401) {
          TokenManager.clearToken();
          setError("Unauthorized. Redirecting to login...");
          router.push("/admin/login");
          return;
        }
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      if (data && data.u_profile) {
        const { u_profile, fe_edu, fe_work } = data;
        
        // Check if user actually has meaningful data (not just default values)
        const hasRealProfessionalData = u_profile?.fp_occupation && 
                                       u_profile?.fp_occupation !== '' && 
                                       u_profile?.fp_occupation !== '0';
        
        const hasRealEducationData = fe_edu && fe_edu.length > 0 && 
                                   fe_edu.some(edu => edu.fc_type && edu.fc_year);
        
        const hasRealExperienceData = fe_work && fe_work.length > 0 && 
                                    fe_work.some(exp => exp.fj_position);

        // Only consider as existing data if user has real meaningful data
        if (hasRealProfessionalData || hasRealEducationData || hasRealExperienceData) {
          setHasExistingData(true);
          setProfessionalData(u_profile);
          setEducationData(fe_edu || []);
          setExperienceData(fe_work || []);

          // Set individual forms for editing mode
          professionalForm.setFieldsValue({
            occupation: u_profile?.fp_occupation,
            yearsOfExperience: u_profile?.fp_ex_year,
            fp_add_edu_profile: u_profile?.fp_add_edu_profile === "1",
          });
          educationForm.setFieldsValue({ education: fe_edu || [] });
          experienceForm.setFieldsValue({ experience: fe_work || [] });
        } else {
          // Has structure but no real data - show initial form
          setHasExistingData(false);
          // Initialize with default values for the all-in-one form
          allForm.setFieldsValue({
            education: [{ fc_type: 'UG', fc_year: '', fc_title: '', fc_collage: '' }],
            experience: [{ fj_position: '', experience_from: '', experience_to: '', fj_desc: '' }]
          });
        }
      } else {
        // No existing data - show initial form
        setHasExistingData(false);
        // Initialize with default values for the all-in-one form
        allForm.setFieldsValue({
          education: [{ fc_type: 'UG', fc_year: '', fc_title: '', fc_collage: '' }],
          experience: [{ fj_position: '', experience_from: '', experience_to: '', fj_desc: '' }]
        });
      }
    } catch (error) {
      console.error("Error fetching professional data:", error);
      setError(error.message || "Failed to load professional data");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionalData();
  }, [userIdBase64, router]);

  // --- FORM HANDLERS ---

  // Initial submission using store API
  const onFinishAll = async (values) => {
    setIsSavingAll(true);
    setError(null);
    
    try {
      const token = TokenManager.getToken();
      
      // Prepare arrays for education
      const validEducation = values.education?.filter(edu => edu?.fc_type && edu?.fc_year) || [];
      const types = validEducation.map(edu => edu.fc_type);
      const titles = validEducation.map(edu => edu.fc_title || '');
      const years = validEducation.map(edu => edu.fc_year);
      const colleges = validEducation.map(edu => edu.fc_collage || '');
      
      // Prepare arrays for experience
      const validExperience = values.experience?.filter(exp => exp?.fj_position) || [];
      const positions = validExperience.map(exp => exp.fj_position);
      const experienceFrom = validExperience.map(exp => exp.experience_from || '');
      const experienceTo = validExperience.map(exp => exp.experience_to || '');
      const descriptions = validExperience.map(exp => exp.fj_desc || '');

      const payload = {
        fp_u_id: userIdBase64,
        is_status: "new",
        occupation: values.occupation,
        yearsOfExperience: values.yearsOfExperience,
        fp_add_edu_profile: values.fp_add_edu_profile || false,
        type: types,
        title: titles,
        year: years,
        collage: colleges,
        position: positions,
        experience_from: experienceFrom,
        experience_to: experienceTo,
        description: descriptions,
      };

      const response = await fetch("https://backend.hyrelancer.in/api/admin/storeFeUProfessional", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error("Failed to parse response:", responseText);
        data = responseText;
      }

      if (!response.ok) {
        if (response.status === 401) {
          TokenManager.clearToken();
          setError("Unauthorized. Redirecting to login...");
          router.push("/admin/login");
          return;
        }
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      message.success(data?.message || "Professional data saved successfully!");
      await fetchProfessionalData(); // Refresh data
    } catch (error) {
      setError(error.message || "Failed to save professional data");
      message.error(error.message || "Failed to save professional data");
    } finally {
      setIsSavingAll(false);
    }
  };

  const onFinishProfessional = async (values) => {
    setIsSavingProfessional(true);
    setError(null);
    
    try {
      const token = TokenManager.getToken();
      const payload = {
        fp_u_id: userIdBase64,
        is_status: hasExistingData ? "old" : "new",
        occupation: values.occupation,
        yearsOfExperience: values.yearsOfExperience,
        fp_add_edu_profile: values.fp_add_edu_profile || false,
      };

      const response = await fetch("https://backend.hyrelancer.in/api/admin/updateFeUProfessional", {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error("Failed to parse response:", responseText);
        data = responseText;
      }

      if (!response.ok) {
        if (response.status === 401) {
          TokenManager.clearToken();
          setError("Unauthorized. Redirecting to login...");
          router.push("/admin/login");
          return;
        }
        throw new Error(data?.message || `HTTP ${response.status}`);
      }

      message.success(data?.message || "Professional info updated successfully!");
      setIsEditingProfessional(false);
      await fetchProfessionalData();
    } catch (error) {
      setError(error.message || "Failed to save professional info");
      message.error(error.message || "Failed to save professional info");
    } finally {
      setIsSavingProfessional(false);
    }
  };

  const onFinishEducation = async (values) => {
    setIsSavingEducation(true);
    setError(null);
    
    const { education } = values;
    try {
      const token = TokenManager.getToken();
      const validEducation = education.filter((edu) => edu && edu.fc_type && edu.fc_year);
      
      const updatePromises = validEducation.map(async (edu) => {
        const payload = {
          fp_u_id: userIdBase64,
          is_status: hasExistingData ? "old" : "new",
          type: edu.fc_type,
          title: edu.fc_title || "",
          collage: edu.fc_collage || "",
          year: edu.fc_year,
        };
        
        if (edu.fc_id) {
          payload.fc_id = btoa(edu.fc_id.toString());
        }

        const response = await fetch("https://backend.hyrelancer.in/api/admin/updateFeUEducation", {
          method: "PUT",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Education update failed: ${errorText}`);
        }

        return response.json();
      });

      await Promise.all(updatePromises);
      message.success("Education details saved successfully!");
      setIsEditingEducation(false);
      await fetchProfessionalData();
    } catch (error) {
      setError(error.message || "Failed to save education details");
      message.error(error.message || "An error occurred while saving education details");
    } finally {
      setIsSavingEducation(false);
    }
  };

  const onFinishExperience = async (values) => {
    setIsSavingExperience(true);
    setError(null);
    
    const { experience } = values;
    try {
      const token = TokenManager.getToken();
      const validExperience = experience.filter((exp) => exp && (exp.fj_position || exp.fj_desc));
      
      const updatePromises = validExperience.map(async (exp) => {
        // Handle duration format
        let duration = '';
        if (exp.experience_from && exp.experience_to) {
          duration = `${exp.experience_from}-${exp.experience_to}`;
        } else if (exp.fj_year) {
          duration = exp.fj_year;
        }

        const payload = {
          fp_u_id: userIdBase64,
          is_status: hasExistingData ? "old" : "new",
          position: exp.fj_position,
          duration: duration,
          description: exp.fj_desc,
        };
        
        if (exp.fj_id) {
          payload.fj_id = btoa(exp.fj_id.toString());
        }

        const response = await fetch("https://backend.hyrelancer.in/api/admin/updateFeUExperience", {
          method: "PUT",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Experience update failed: ${errorText}`);
        }

        return response.json();
      });

      await Promise.all(updatePromises);
      message.success("Work experience saved successfully!");
      setIsEditingExperience(false);
      await fetchProfessionalData();
    } catch (error) {
      setError(error.message || "Failed to save work experience");
      message.error(error.message || "An error occurred while saving work experience");
    } finally {
      setIsSavingExperience(false);
    }
  };

  // --- RENDER LOGIC ---
  if (isDataLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading professional data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UI COMPONENTS ---

  // All-in-one form for initial submission
  const AllInOneForm = () => (
    <Form form={allForm} layout="vertical" onFinish={onFinishAll} autoComplete="off">
      {/* Professional Information Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <UserOutlined className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
          </div>
        </div>
        <div className="p-4">
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
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOutlined className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Education</h3>
          </div>
        </div>
        <div className="p-4">
          <Form.List name="education" rules={[{ validator: async (_, education) => {
            if (!education || education.length < 1) {
              return Promise.reject(new Error('At least 1 education entry is required'));
            }
          }}]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <FieldGroup key={key} title={`Education Entry ${name + 1}`} onRemove={() => remove(name)} canRemove={fields.length > 1}>
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
                      <Col xs={24} md={12}>
                        <Form.Item {...restField} name={[name, "fc_title"]} label="Title/Specialization" rules={[{ required: true, message: "Title is required" }]}>
                          <Input placeholder="e.g., B.Sc Computer Science" size="large" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item {...restField} name={[name, "fc_collage"]} label="Institution" rules={[{ required: true, message: "Institution is required" }]}>
                          <Input placeholder="e.g., XYZ University" size="large" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </FieldGroup>
                ))}
                <Button type="dashed" onClick={() => add({ fc_type: 'UG', fc_year: '', fc_title: '', fc_collage: '' })} block icon={<PlusOutlined />} size="large">
                  Add Education
                </Button>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CarryOutOutlined className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
          </div>
        </div>
        <div className="p-4">
          <Form.List name="experience" rules={[{ validator: async (_, experience) => {
            if (!experience || experience.length < 1) {
              return Promise.reject(new Error('At least 1 experience entry is required'));
            }
          }}]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <FieldGroup key={key} title={`Experience Entry ${name + 1}`} onRemove={() => remove(name)} canRemove={fields.length > 1}>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item {...restField} name={[name, "fj_position"]} label="Position & Company" rules={[{ required: true }]}>
                          <Input placeholder="e.g., Senior Developer at Tech Corp" size="large" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...restField} name={[name, "experience_from"]} label="From Year" rules={[{ required: true }]}>
                          <Input placeholder="e.g., 2020" size="large" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...restField} name={[name, "experience_to"]} label="To Year" rules={[{ required: true }]}>
                          <Input placeholder="e.g., 2022" size="large" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item {...restField} name={[name, "fj_desc"]} label="Job Description" rules={[{ required: true }]}>
                          <TextArea rows={3} placeholder="Describe responsibilities..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  </FieldGroup>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">Add Experience</Button>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSavingAll}
          className="px-12 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-medium"
        >
          {isSavingAll && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          )}
          {isSavingAll ? 'Saving...' : 'Save All Professional Data'}
        </button>
      </div>
    </Form>
  );

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
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setIsEditingProfessional(false)}
          disabled={isSavingProfessional}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSavingProfessional}
          className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSavingProfessional && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isSavingProfessional ? 'Saving...' : 'Save'}
        </button>
      </div>
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
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-4">
        <button
          type="button"
          onClick={() => { setIsEditingEducation(false); educationForm.resetFields(); }}
          disabled={isSavingEducation}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSavingEducation}
          className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSavingEducation && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isSavingEducation ? 'Saving...' : 'Save Education'}
        </button>
      </div>
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
                  <Col xs={24} md={12}>
                    <Form.Item {...restField} name={[name, "fj_position"]} label="Position & Company" rules={[{ required: true }]}>
                      <Input placeholder="e.g., Senior Developer at Tech Corp" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item {...restField} name={[name, "fj_year"]} label="Duration" rules={[{ required: true }]}>
                      <Input placeholder="e.g., 2020-2022" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item {...restField} name={[name, "fj_desc"]} label="Job Description" rules={[{ required: true }]}>
                      <TextArea rows={3} placeholder="Describe responsibilities..." />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item {...restField} name={[name, "fj_id"]} hidden><Input /></Form.Item>
              </FieldGroup>
            ))}
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large">Add Experience</Button>
          </>
        )}
      </Form.List>
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-4">
        <button
          type="button"
          onClick={() => { setIsEditingExperience(false); experienceForm.resetFields(); }}
          disabled={isSavingExperience}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSavingExperience}
          className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSavingExperience && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isSavingExperience ? 'Saving...' : 'Save Experience'}
        </button>
      </div>
    </Form>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header section matching profile design */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CarryOutOutlined className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Professional Management</h1>
              <p className="text-sm text-gray-500">Manage education and work experience details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftOutlined className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Show all-in-one form if no existing data */}
          {!hasExistingData ? (
            <AllInOneForm />
          ) : (
            <Space direction="vertical" size="large" className="w-full">
              {/* Professional Information Card */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                  </div>
                  {!isEditingProfessional && (
                    <Button icon={<EditOutlined />} onClick={() => setIsEditingProfessional(true)} size="small">
                      Edit
                    </Button>
                  )}
                </div>
                <div className="p-4">
                  {isEditingProfessional ? <ProfessionalForm /> : <ProfessionalDisplay />}
                </div>
              </div>

              {/* Education Card */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <BookOutlined className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Education</h3>
                  </div>
                  {!isEditingEducation && (
                    <Button icon={<EditOutlined />} onClick={() => setIsEditingEducation(true)} size="small">
                      Edit
                    </Button>
                  )}
                </div>
                <div className="p-4">
                  {isEditingEducation ? <EducationForm /> : <EducationDisplay />}
                </div>
              </div>

              {/* Work Experience Card */}
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <CarryOutOutlined className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                  </div>
                  {!isEditingExperience && (
                    <Button icon={<EditOutlined />} onClick={() => setIsEditingExperience(true)} size="small">
                      Edit
                    </Button>
                  )}
                </div>
                <div className="p-4">
                  {isEditingExperience ? <ExperienceForm /> : <ExperienceDisplay />}
                </div>
              </div>
            </Space>
          )}
        </div>
      </div>
    </div>
  );
}