"use client";
import { useState, useEffect } from "react";
import {
  Form, Input, Button, Collapse, Card, Row, Col, Divider,
  Table, Typography, Descriptions, Space, message, Select, Spin, Checkbox, Popconfirm, Progress, Tooltip
} from "antd";
import {
  PlusOutlined, CloseOutlined, EditOutlined, CheckOutlined,
  BookOutlined, LaptopOutlined, UserOutlined, EyeOutlined, DeleteOutlined
} from "@ant-design/icons";
import { useSelector } from 'react-redux';
import api from "@/config/api";
import Loader from "../../../../components/Loader/page";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const FieldGroup = ({ title, children, onRemove, canRemove }) => (
  <div className="field-group border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 relative bg-white hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-3 sm:mb-4">
      <h3 className="text-base sm:text-lg font-medium text-gray-800">{title}</h3>
      {canRemove && (
        <Button
          type="text"
          danger
          icon={<CloseOutlined className="text-sm" />}
          onClick={onRemove}
          className="w-8 h-8 flex items-center justify-center"
          aria-label={`Remove ${title}`}
        />
      )}
    </div>
    {children}
  </div>
);

const ResumeBuilderTab = ({ onNext, onBack, isRegistration = false, showCompletionModal }) => {
  const [form] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [experienceForm] = Form.useForm();

  // State management
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [currentView, setCurrentView] = useState('education'); // 'education' | 'experience' | 'form'
  const [editingSection, setEditingSection] = useState(null); // 'education' | 'experience'
  const [addEducationToProfile, setAddEducationToProfile] = useState(false);

  // Data states
  const [resumeData, setResumeData] = useState(null);
  const [educationData, setEducationData] = useState([]);
  const [experienceData, setExperienceData] = useState([]);
  const [profileData, setProfileData] = useState(null);

  // Form field states
  const [educationFields, setEducationFields] = useState([]);
  const [experienceFields, setExperienceFields] = useState([
    { key: "exp-1", title: "Current Position" }
  ]);

  // Get token from Redux store
  const token = useSelector((state) => state.auth.token);

  // Education types for dropdown
  const educationTypes = [
    { value: 'High School', label: 'High School' },
    { value: 'UG', label: 'Undergraduate (UG)' },
    { value: 'PG', label: 'Postgraduate (PG)' },
    { value: 'Other', label: 'Freelancer Expertise' }
  ];

  // Delete item handler
  const handleDeleteItem = async (type, id) => {
    try {
      const encodedId = btoa(id.toString());
      await api.get(`/deleteItem/${type}/${encodedId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      message.success('Item deleted successfully');
      
      // Refetch data to update the UI
      await fetchProfessionalData();
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Failed to delete item');
    }
  };

  // Fetch existing professional data
  const fetchProfessionalData = async () => {
    if (!token) {
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      const response = await api.get('/getProfessional', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data) {
        const { u_profile, fe_edu, fe_work } = response.data;

        // Check if we have meaningful professional data
        const hasValidProfile = u_profile && (
          (u_profile.fp_occupation &&
            u_profile.fp_occupation !== 'null' &&
            u_profile.fp_occupation !== 'undefined' &&
            u_profile.fp_occupation.trim() !== '' &&
            u_profile.fp_occupation !== '0') ||
          (u_profile.fp_ex_year &&
            u_profile.fp_ex_year !== '0' &&
            u_profile.fp_ex_year !== 'null' &&
            u_profile.fp_ex_year !== 'undefined' &&
            u_profile.fp_ex_year.trim() !== '') ||
          (fe_edu && fe_edu.length > 0 && fe_edu.some(edu =>
            edu.fc_title && edu.fc_title.trim() !== '' &&
            edu.fc_title !== 'null' && edu.fc_title !== 'undefined')) ||
          (fe_work && fe_work.length > 0 && fe_work.some(work =>
            work.fj_position && work.fj_position.trim() !== '' &&
            work.fj_position !== 'null' && work.fj_position !== 'undefined'))
        );

        if (hasValidProfile) {
          setHasExistingData(true);
          setProfileData(u_profile);
          setEducationData(fe_edu || []);
          setExperienceData(fe_work || []);
          setCurrentView('education'); // Start with education review
        } else {
          // No meaningful data, show form
          setHasExistingData(false);
          setCurrentView('form');
          initializeFormFields();
        }

        console.log('Professional data loaded:', response.data);
      }
    } catch (error) {
      console.error('Error fetching professional data:', error);
      if (error.response?.status !== 404) {
        message.error('Failed to load professional data. Please try again.');
      }
      // Show form if error
      setHasExistingData(false);
      setCurrentView('form');
      initializeFormFields();
    } finally {
      setDataLoading(false);
    }
  };

  // Initialize form fields for new users
  const initializeFormFields = () => {
    const key = "education-0";
    setEducationFields([
      { key, type: "UG", label: "Education" }
    ]);

    // Initialize the AntD form nested value so `type` is present
    form.setFieldsValue({
      [`education_${key}`]: { type: "UG" }
    });
  };

  useEffect(() => {
    fetchProfessionalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Education Management
  const addEducationField = () => {
    const newKey = `education-${Date.now()}`;
    const newField = {
      key: newKey,
      type: "Other",
      label: "Additional Education"
    };

    setEducationFields(prev => {
      const next = [...prev, newField];
      // Initialize nested form value for the new field so its `type` exists
      form.setFieldsValue({
        [`education_${newKey}`]: { type: newField.type }
      });
      return next;
    });
  };

  const removeEducationField = (key) => {
    if (educationFields.length > 1) {
      setEducationFields(educationFields.filter((field) => field.key !== key));
      // remove form values for that field as well
      const current = form.getFieldsValue();
      if (current && current[`education_${key}`]) {
        const clone = { ...current };
        delete clone[`education_${key}`];
        form.setFieldsValue(clone);
      }
    }
  };

  // Experience Management
  const addExperienceField = () => {
    const newKey = `exp-${Date.now()}`;
    setExperienceFields([...experienceFields, {
      key: newKey,
      title: `Experience ${experienceFields.length + 1}`
    }]);
  };

  const removeExperienceField = (key) => {
    if (experienceFields.length > 1) {
      setExperienceFields(experienceFields.filter((field) => field.key !== key));
    }
  };

  // Handle education edit
  const handleEditEducation = () => {
    setEditingSection('education');
    setCurrentView('form');

    // Prepare form data
    const formData = {};
    const eduFields = [];

    // Process education data
    educationData.forEach((edu, index) => {
      const fieldKey = `education-${index}`;
      eduFields.push({
        key: fieldKey,
        type: edu.fc_type,
        label: edu.fc_type === 'UG' ? 'Education' :
          edu.fc_type === 'PG' ? 'Postgraduate' : 
          edu.fc_type === 'High School' ? 'High School' : 'Freelancer Expertise',
        fc_id: btoa(edu.fc_id.toString())
      });

      // include type in the nested form object so Select shows current type
      formData[`education_${fieldKey}`] = {
        specialized: edu.fc_title,
        year: edu.fc_year,
        college: edu.fc_collage,
        type: edu.fc_type
      };
    });

    // If no education fields, add default one
    if (eduFields.length === 0) {
      const defaultKey = "education-0";
      eduFields.push(
        { key: defaultKey, type: "UG", label: "Education" }
      );
      formData[`education_${defaultKey}`] = { type: "UG" };
    }

    setEducationFields(eduFields);
    form.setFieldsValue(formData);
  };

  // Handle experience edit  
  const handleEditExperience = () => {
    setEditingSection('experience');
    setCurrentView('form');

    // Prepare form data
    const formData = {
      occupation: profileData?.fp_occupation || '',
      yearsOfExperience: profileData?.fp_ex_year || ''
    };

    const expFields = [];

    // Process experience data
    experienceData.forEach((exp, index) => {
      const fieldKey = `exp-${index}`;
      expFields.push({
        key: fieldKey,
        title: `Experience ${index + 1}`,
        fj_id: btoa(exp.fj_id.toString())
      });

      formData[`experience_${fieldKey}`] = {
        position: exp.fj_position,
        duration: exp.fj_year,
        description: exp.fj_desc
      };
    });

    // If no experience fields, add a default one
    if (expFields.length === 0) {
      expFields.push({
        key: "exp-0",
        title: "Current Position"
      });
    }

    setExperienceFields(expFields);
    form.setFieldsValue(formData);
  };

  // Update education via API
  const updateEducation = async (educationItems) => {
    try {
      for (const item of educationItems) {
        const payload = {
          title: item.title,
          year: item.year,
          collage: item.college,
          type: item.type
        };

        if (item.fc_id) {
          payload.fc_id = item.fc_id;
        }

        await api.put('/updateEducation', payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  };

  // Update experience via API
  const updateExperience = async (experienceItems) => {
    try {
      // Update experience items only
      for (const item of experienceItems) {
        const payload = {
          position: item.position,
          duration: item.duration,
          description: item.description,
          fj_id: item.fj_id ?? null
        };

        await api.put('/updateExperience', payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  };


  // Handle form submission
  const onFinish = async (values) => {
    if (!token) {
      message.error('Authentication required. Please login to continue.');
      return;
    }

    setLoading(true);

    try {
      console.log('Form values received:', values);

      if (editingSection === 'education') {
        // Handle education update
        const educationItems = [];


        // Process education fields (prefer form values for `type`)
        educationFields.forEach(field => {
          const eduData = values[`education_${field.key}`] || {};
          const eduType = eduData.type || field.type || 'Other';

          if (eduData && (eduData.specialized || eduData.year || eduData.college)) {
            educationItems.push({
              type: eduType,
              title: eduData.specialized || '',
              year: eduData.year || '',
              college: eduData.college || '',
              fc_id: field.fc_id || null
            });
          }
        });

        await updateEducation(educationItems);
        message.success('Education updated successfully!');

      } else if (editingSection === 'experience') {
        // Handle experience update
        const experienceItems = [];
        const professionalInfo = {
          occupation: values.occupation,
          yearsOfExperience: values.yearsOfExperience
        };

        // Process experience fields
        experienceFields.forEach(field => {
          const expData = values[`experience_${field.key}`];
          if (expData && (expData.position || expData.duration || expData.description)) {
            experienceItems.push({
              position: expData.position || '',
              duration: expData.duration || '',
              description: expData.description || '',
              fj_id: field.fj_id || null
            });
          }
        });

        console.log('Experience items to update:', experienceItems);

        await updateExperience(experienceItems);
        message.success('Experience updated successfully!');

      } else {
        // Handle new resume creation
        const formattedData = {
          occupation: values.occupation,
          yearsOfExperience: values.yearsOfExperience,
          type: [],
          title: [],
          year: [],
          collage: [],
          position: [],
          duration: [],
          description: [],
          fp_add_edu_profile: addEducationToProfile ? "1" : "0"
        };


        // Process education fields (prefer form values for `type`)
        educationFields.forEach(field => {
          const eduData = values[`education_${field.key}`] || {};
          const eduType = eduData.type || field.type || 'Other';
          if (eduData && eduData.specialized && eduData.year && eduData.college) {
            formattedData.type.push(eduType);
            formattedData.title.push(eduData.specialized);
            formattedData.year.push(eduData.year);
            formattedData.collage.push(eduData.college);
          }
        });

        // Process experience fields
        experienceFields.forEach(field => {
          const expData = values[`experience_${field.key}`];
          if (expData && expData.position && expData.duration && expData.description) {
            formattedData.position.push(expData.position);
            formattedData.duration.push(expData.duration);
            formattedData.description.push(expData.description);
          }
        });

        // Submit the data
        const response = await api.post('/storeFeProfessional', formattedData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data) {
          message.success('Resume created successfully!');
        }
      }

      // Refresh data and show review
      await fetchProfessionalData();
      setEditingSection(null);

    } catch (error) {
      console.error('Submit Error:', error);
      message.error('Failed to save resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress for education and experience completion
  const calculateProgress = () => {
    if (currentView === 'education') {
      // For education view, check if we have education data
      const hasEducationData = educationData && educationData.length > 0 && 
        educationData.some(edu => 
          edu.fc_title && edu.fc_title.trim() !== '' && 
          edu.fc_title !== 'null' && edu.fc_title !== 'undefined'
        );
      return hasEducationData ? 100 : 0;
    } else if (currentView === 'experience') {
      // For experience view, check if we have experience data
      const hasExperienceData = experienceData && experienceData.length > 0 && 
        experienceData.some(exp => 
          exp.fj_position && exp.fj_position.trim() !== '' && 
          exp.fj_position !== 'null' && exp.fj_position !== 'undefined'
        );
      const hasProfileData = profileData && (
        (profileData.fp_occupation && profileData.fp_occupation.trim() !== '' && profileData.fp_occupation !== '0') ||
        (profileData.fp_ex_year && profileData.fp_ex_year.trim() !== '' && profileData.fp_ex_year !== '0')
      );
      return (hasExperienceData && hasProfileData) ? 100 : 0;
    } else if (currentView === 'form') {
      // For form view, calculate based on filled fields
      const values = form.getFieldsValue();
      let filledFields = 0;
      let totalFields = 0;
      
      if (!editingSection || editingSection === 'education') {
        // Check education fields
        educationFields.forEach(field => {
          const eduData = values[`education_${field.key}`] || {};
          if (eduData.specialized && eduData.specialized.trim() !== '') filledFields++;
          if (eduData.year && eduData.year.trim() !== '') filledFields++;
          if (eduData.college && eduData.college.trim() !== '') filledFields++;
          totalFields += 3;
        });
      }
      
      if (!editingSection || editingSection === 'experience') {
        // Check experience fields
        if (values.occupation && values.occupation.trim() !== '') filledFields++;
        if (values.yearsOfExperience && values.yearsOfExperience.trim() !== '') filledFields++;
        totalFields += 2;
        
        experienceFields.forEach(field => {
          const expData = values[`experience_${field.key}`] || {};
          if (expData.position && expData.position.trim() !== '') filledFields++;
          if (expData.duration && expData.duration.trim() !== '') filledFields++;
          if (expData.description && expData.description.trim() !== '') filledFields++;
          totalFields += 3;
        });
      }
      
      return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    }
    return 0;
  };

  // Navigation functions
  const showEducationReview = () => setCurrentView('education');
  const showExperienceReview = () => setCurrentView('experience');
  const showForm = () => {
    setCurrentView('form');
    setEditingSection(null);
    initializeFormFields();
  };

  // Table columns for education
  const educationColumns = [
    {
      title: 'Type',
      dataIndex: 'fc_type',
      key: 'type',
      render: (text) => {
        const label = text === 'Other' ? 'Freelancer Expertise' : text;
        return <Text strong>{label}</Text>;
      },
    },
    {
      title: 'Title/Specialization',
      dataIndex: 'fc_title',
      key: 'title',
    },
    {
      title: 'Institution',
      dataIndex: 'fc_collage',
      key: 'institution',
    },
    {
      title: 'Year',
      dataIndex: 'fc_year',
      key: 'year',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this education record?"
          onConfirm={() => handleDeleteItem(2, record.fc_id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Table columns for experience
  const experienceColumns = [
    {
      title: 'Position',
      dataIndex: 'fj_position',
      key: 'position',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Duration',
      dataIndex: 'fj_year',
      key: 'duration',
    },
    {
      title: 'Description',
      dataIndex: 'fj_desc',
      key: 'description',
      render: (text) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this experience record?"
          onConfirm={() => handleDeleteItem(3, record.fj_id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Show loading spinner while fetching data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-sm rounded-lg overflow-hidden border-0">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader />
                <p className="mt-4 text-gray-600">Loading professional data...</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {!token && (
          <Card className="shadow-sm rounded-lg overflow-hidden border-0 mb-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Authentication required. Please login to access the resume builder.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="shadow-sm rounded-lg overflow-hidden border-0">
          {!token ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Please login to continue building your resume.</p>
              <div className="flex justify-end gap-3 mt-6">
                {/* Always show back button if onBack is provided */}
                {onBack && (
                  <Button
                    size="large"
                    className="flex items-center"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex-1">
                    <Title level={3} className="!mb-1 !text-gray-900 !text-lg sm:!text-xl lg:!text-2xl">
                      {currentView === 'form' ? (
                        editingSection === 'education' ? "Edit Education" :
                          editingSection === 'experience' ? "Edit Experience" :
                            "Professional Profile"
                      ) : (
                        currentView === 'education' ? "Education Profile" : "Experience Profile"
                      )}
                    </Title>
                    <Text type="secondary" className="text-sm sm:text-base">
                      {currentView === 'form' ? (
                        editingSection ? `Update your ${editingSection} information` :
                          "Complete your professional resume details"
                      ) : (
                        `Review and manage your ${currentView} information`
                      )}
                    </Text>
                  </div>

                  {hasExistingData && currentView !== 'form' && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {currentView === 'education' && (
                        <>
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditEducation}
                            className="flex items-center justify-center w-full sm:w-auto"
                            size="middle"
                          >
                            <span className="hidden sm:inline">Edit Education</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          <Button
                            icon={<LaptopOutlined />}
                            onClick={showExperienceReview}
                            className="flex items-center justify-center w-full sm:w-auto"
                            size="middle"
                          >
                            <span className="hidden sm:inline">View Experience</span>
                            <span className="sm:hidden">Experience</span>
                          </Button>
                        </>
                      )}
                      {currentView === 'experience' && (
                        <>
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditExperience}
                            className="flex items-center justify-center w-full sm:w-auto"
                            size="middle"
                          >
                            <span className="hidden sm:inline">Edit Experience</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          <Button
                            icon={<BookOutlined />}
                            onClick={showEducationReview}
                            className="flex items-center justify-center w-full sm:w-auto"
                            size="middle"
                          >
                            <span className="hidden sm:inline">View Education</span>
                            <span className="sm:hidden">Education</span>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Review Mode - Education */}
                {hasExistingData && currentView === 'education' && (
                  <div>
                    <div className="mb-6 sm:mb-8">
                      <Title level={4} className="!mb-4 !text-base sm:!text-lg">
                        <BookOutlined className="mr-2" />
                        Education Background
                      </Title>
                      <div className="overflow-x-auto">
                        <Table
                          columns={educationColumns}
                          dataSource={educationData}
                          pagination={false}
                          className="mb-6 sm:mb-8 min-w-[600px]"
                          rowKey="fc_id"
                          scroll={{ x: 600 }}
                          size="small"
                          locale={{
                            emptyText: 'No education records found'
                          }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <Tooltip title="Your progress in completing the education and experience details" placement="top">
                        <div className="flex justify-between items-center mb-1">
                          <Text className="text-sm font-medium">Education & Experience Completion</Text>
                          <Text className="text-sm">{calculateProgress()}%</Text>
                        </div>
                      </Tooltip>
                      <Progress
                        percent={calculateProgress()}
                        strokeColor="#52c41a"
                        trailColor="#f0f0f0"
                        showInfo={false}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* Always show back button if onBack is provided */}
                        {onBack && (
                          <Button
                            size="large"
                            className="flex items-center justify-center w-full sm:w-auto"
                            onClick={onBack}
                          >
                            Back
                          </Button>
                        )}
                        {onNext && (
                          <Button
                            type="primary"
                            size="large"
                            onClick={() => {
                              // Show modal only in registration flow
                              if (isRegistration && showCompletionModal) {
                                showCompletionModal(
                                  "Education & Experience Completed!",
                                  "Your educational background and work experience have been saved successfully.",
                                  "Continue to Social Media"
                                );
                              }
                              onNext();
                            }}
                            className="flex items-center justify-center w-full sm:w-auto"
                          >
                            Save & Next
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Review Mode - Experience */}
                {hasExistingData && currentView === 'experience' && (
                  <div>
                    <div className="mb-6 sm:mb-8">
                      <div className="mb-6">
                        <Descriptions bordered column={1} className="mb-6" size="small">
                          <Descriptions.Item label="Current Occupation">
                            <Text strong className="text-sm sm:text-base">{profileData?.fp_occupation || 'Not specified'}</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Total Experience">
                            <Text className="text-sm sm:text-base">{profileData?.fp_ex_year ? `${profileData.fp_ex_year}` : 'Not specified'}</Text>
                          </Descriptions.Item>
                        </Descriptions>
                      </div>

                      <Title level={4} className="!mb-4 !text-base sm:!text-lg">
                        <LaptopOutlined className="mr-2" />
                        Work Experience
                      </Title>
                      <div className="overflow-x-auto">
                        <Table
                          columns={experienceColumns}
                          dataSource={experienceData}
                          pagination={false}
                          className="mb-6 sm:mb-8 min-w-[600px]"
                          rowKey="fj_id"
                          scroll={{ x: 600 }}
                          size="small"
                          locale={{
                            emptyText: 'No work experience records found'
                          }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <Tooltip title="Your progress in completing the education and experience details" placement="top">
                        <div className="flex justify-between items-center mb-1">
                          <Text className="text-sm font-medium">Education & Experience Completion</Text>
                          <Text className="text-sm">{calculateProgress()}%</Text>
                        </div>
                      </Tooltip>
                      <Progress
                        percent={calculateProgress()}
                        strokeColor="#52c41a"
                        trailColor="#f0f0f0"
                        showInfo={false}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* Always show back button if onBack is provided */}
                        {onBack && (
                          <Button
                            size="large"
                            className="flex items-center justify-center w-full sm:w-auto"
                            onClick={onBack}
                          >
                            Back
                          </Button>
                        )}
                        {onNext && (
                          <Button
                            type="primary"
                            size="large"
                            onClick={() => {
                              // Show modal only in registration flow
                              if (isRegistration && showCompletionModal) {
                                showCompletionModal(
                                  "Education & Experience Completed!",
                                  "Your educational background and work experience have been saved successfully.",
                                  "Continue to Social Media"
                                );
                              }
                              onNext();
                            }}
                            className="flex items-center justify-center w-full sm:w-auto"
                          >
                            Save & Next
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Mode */}
                {currentView === 'form' && (
                  <Form form={form} onFinish={onFinish} layout="vertical">
                    <div className="resume-form">
                      <Collapse
                        defaultActiveKey={editingSection ? [editingSection] : ['education', 'experience']}
                        expandIcon={({ isActive }) => <EditOutlined rotate={isActive ? 90 : 0} />}
                        className="mb-4 sm:mb-6"
                        size="middle"
                      >
                        {/* Education Section */}
                        {(!editingSection || editingSection === 'education') && (
                          <Panel header={<span className="font-medium text-sm sm:text-base"><BookOutlined className="mr-2" /> Education</span>} key="education">
                              <div className="mb-4">
                                {educationFields.map((field, index) => (
                                  <FieldGroup
                                    key={field.key}
                                    title={field.label}
                                    onRemove={() => removeEducationField(field.key)}
                                    canRemove={educationFields.length > 1}
                                  >
                                    <Row gutter={[16, 16]}>
                                      <Col xs={24} sm={12}>
                                        <Form.Item
                                          name={[`education_${field.key}`, 'type']}
                                          label={<span className="font-medium text-sm sm:text-base">Education Type</span>}
                                          rules={[{ required: true, message: "Please Select education type" }]}
                                          initialValue={field.type}
                                        >
                                          <Select
                                            placeholder="Select education type"
                                            size="middle"
                                           
                                            onChange={(value) => {
                                              // keep local state in sync (so label/placeholders etc. update)
                                              setEducationFields(prev => prev.map(f =>
                                                f.key === field.key ? { ...f, type: value } : f
                                              ));

                                              // ensure the ant form nested value is updated as well
                                              const current = form.getFieldValue(`education_${field.key}`) || {};
                                              form.setFieldsValue({
                                                [`education_${field.key}`]: { ...current, type: value }
                                              });
                                            }}
                                          >
                                            {educationTypes.map((type) => (
                                              <Option key={type.value} value={type.value}>
                                                {type.label}
                                              </Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                      </Col>
                                      <Col xs={24} sm={12}>
                                        <Form.Item
                                          name={[`education_${field.key}`, 'year']}
                                          label={<span className="font-medium text-sm sm:text-base">Year</span>}
                                          rules={[{ required: true, message: "Please enter year" }]}
                                        >
                                          <Input
                                            placeholder="e.g., 2018"
                                            size="middle"
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col xs={24} sm={12}>
                                        <Form.Item
                                          name={[`education_${field.key}`, 'specialized']}
                                          label={<span className="font-medium text-sm sm:text-base">
                                            {field.type === 'UG' ? 'Specialization' :
                                              field.type === 'PG' ? 'Specialization' :
                                                field.type === 'High School' ? 'High School' :
                                                  'Expertise/Skill'}
                                          </span>}
                                          rules={[{ required: false, message: "This field is required" }]}
                                        >
                                          <Input
                                            placeholder={
                                              field.type === 'UG' ? "e.g., Computer Science" :
                                                field.type === 'PG' ? "e.g., MBA, M.Tech" :
                                                  field.type === 'High School' ? "High School" :
                                                    "e.g., Web Development, Graphic Design"
                                            }
                                            size="middle"
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col xs={24} sm={12}>
                                        <Form.Item
                                          name={[`education_${field.key}`, 'college']}
                                          label={<span className="font-medium text-sm sm:text-base">
                                            {field.type === 'Other' ? 'Institution/Platform' : 
                                              field.type === 'High School' ? 'School' : 'Institution'}
                                          </span>}
                                          rules={[{ required: false, message: "Please enter institution name" }]}
                                        >
                                          <Input
                                            placeholder={
                                              field.type === 'Other' ?
                                                "e.g., Coursera, Udemy, Self-taught" :
                                                field.type === 'High School' ? "School name" :
                                                  "University or College name"
                                            }
                                            size="middle"
                                          />
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                  </FieldGroup>
                                ))}

                                <Button
                                  type="dashed"
                                  icon={<PlusOutlined />}
                                  onClick={addEducationField}
                                  className="w-full mt-2"
                                  size="middle"
                                >
                                  Add Another Education
                                </Button>

                                {/* Add Education to Profile Checkbox - Only for education section */}
                                {(!editingSection || editingSection === 'education') && (
                                  <div className="mt-4 px-3 sm:px-4 pt-3 sm:pt-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <Form.Item
                                      name="fp_add_edu_profile"
                                      valuePropName="checked"
                                      className="mb-0"
                                    >
                                      <Checkbox
                                        checked={addEducationToProfile}
                                        onChange={(e) => setAddEducationToProfile(e.target.checked)}
                                        className="text-sm sm:text-base"
                                      >
                                        <span className="font-medium text-gray-800 text-sm sm:text-base">
                                          Add education details to my profile
                                        </span>
                                      </Checkbox>
                                      <div className="text-xs sm:text-sm text-gray-400 mt-1">
                                        This will make your education information visible on your public profile
                                      </div>
                                    </Form.Item>
                                  </div>
                                )}


                              </div>
                            </Panel>
                        )}

                        {/* Experience Section */}
                        {(!editingSection || editingSection === 'experience') && (
                          <Panel header={<span className="font-medium text-sm sm:text-base"><LaptopOutlined className="mr-2" /> Work Experience</span>} key="experience">
                            {!editingSection && (
                              <div className="mb-4 sm:mb-6">
                                <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">Professional Information</h3>
                                <Divider className="my-3 sm:my-4" />

                                <Row gutter={[16, 16]}>
                                  <Col xs={24} sm={12}>
                                    <Form.Item
                                      name="occupation"
                                      label={<span className="font-medium text-sm sm:text-base">Current Occupation</span>}
                                      rules={[{ required: false, message: "Please enter occupation" }]}
                                      className="mb-0"
                                    >
                                      <Input
                                        placeholder="e.g., Software Engineer"
                                        size="middle"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col xs={24} sm={12}>
                                    <Form.Item
                                      name="yearsOfExperience"
                                      label={<span className="font-medium text-sm sm:text-base">Total Experience</span>}
                                      rules={[{ required: false, message: "Please select years of experience" }]}
                                      className="mb-0"
                                    >
                                      <Select
                                        placeholder="Select experience"
                                        size="middle"
                                      >
                                        <Option value="0 to 1 year">0 to 1 year</Option>
                                        <Option value="1 to 2 year">1 to 2 year</Option>
                                        <Option value="2 to 5 year">2 to 5 year</Option>
                                        <Option value="5 to 10 year">5 to 10 year</Option>
                                        <Option value="10 above">10 above</Option>
                                      </Select>
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </div>
                            )}

                            <div className="mb-4">
                              {experienceFields.map((field, index) => (
                                <FieldGroup
                                  key={field.key}
                                  title={field.title}
                                  onRemove={() => removeExperienceField(field.key)}
                                  canRemove={experienceFields.length > 1}
                                >
                                  <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                      <Form.Item
                                        name={[`experience_${field.key}`, 'position']}
                                        label={<span className="font-medium text-sm sm:text-base">Position & Company</span>}
                                        rules={[{ required: true, message: "Please enter position and company" }]}
                                      >
                                        <Input
                                          placeholder="e.g., Senior Developer at Tech Corp"
                                          size="middle"
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                      <Form.Item
                                        name={[`experience_${field.key}`, 'duration']}
                                        label={<span className="font-medium text-sm sm:text-base">Employment Period</span>}
                                        rules={[{ required: true, message: "Please select employment period" }]}
                                      >
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <Select
                                            placeholder="From"
                                            size="middle"
                                            className="flex-1"
                                            value={form.getFieldValue([`experience_${field.key}`, 'duration_from'])}
                                            onChange={fromYear => {
                                              const toYear = form.getFieldValue([`experience_${field.key}`, 'duration_to']);
                                              let durationValue = fromYear && toYear
                                                ? (toYear === 'Present'
                                                    ? `${fromYear} - Present`
                                                    : `${fromYear} - ${toYear}`)
                                                : undefined;
                                              form.setFieldsValue({
                                                [`experience_${field.key}`]: {
                                                  ...form.getFieldValue([`experience_${field.key}`]),
                                                  duration: durationValue,
                                                  duration_from: fromYear,
                                                  duration_to: toYear
                                                }
                                              });
                                            }}
                                          >
                                            {Array.from({ length: 51 }, (_, i) => {
                                              const year = 2024 - i;
                                              return <Option key={year} value={year.toString()}>{year}</Option>;
                                            })}
                                          </Select>
                                          <span className="hidden sm:inline-flex items-center justify-center text-gray-500">-</span>
                                          <Select
                                            placeholder="To"
                                            size="middle"
                                            className="flex-1"
                                            value={form.getFieldValue([`experience_${field.key}`, 'duration_to'])}
                                            onChange={toYear => {
                                              const fromYear = form.getFieldValue([`experience_${field.key}`, 'duration_from']);
                                              let durationValue = fromYear && toYear
                                                ? (toYear === 'Present'
                                                    ? `${fromYear} - Present`
                                                    : `${fromYear} - ${toYear}`)
                                                : undefined;
                                              form.setFieldsValue({
                                                [`experience_${field.key}`]: {
                                                  ...form.getFieldValue([`experience_${field.key}`]),
                                                  duration: durationValue,
                                                  duration_from: fromYear,
                                                  duration_to: toYear
                                                }
                                              });
                                            }}
                                          >
                                            <Option value="Present">Present</Option>
                                            {Array.from({ length: 51 }, (_, i) => {
                                              const year = 2024 - i;
                                              return <Option key={year} value={year.toString()}>{year}</Option>;
                                            })}
                                          </Select>
                                        </div>
                                      </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                      <Form.Item
                                        name={[`experience_${field.key}`, 'description']}
                                        label={<span className="font-medium text-sm sm:text-base">Job Description</span>}
                                        rules={[{ required: false, message: "Please enter job description" }]}
                                      >
                                        <TextArea
                                          rows={3}
                                          placeholder="Describe your responsibilities and achievements..."
                                          className="resize-none"
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </FieldGroup>
                              ))}

                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addExperienceField}
                                className="w-full mt-2"
                                size="middle"
                              >
                                Add Another Experience
                              </Button>
                            </div>
                          </Panel>
                        )}
                      </Collapse>

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <Tooltip title="Your progress in completing the education and experience details" placement="top">
                          <div className="flex justify-between items-center mb-1">
                            <Text className="text-sm font-medium">Education & Experience Completion</Text>
                            <Text className="text-sm">{calculateProgress()}%</Text>
                          </div>
                        </Tooltip>
                        <Progress
                          percent={calculateProgress()}
                          strokeColor="#52c41a"
                          trailColor="#f0f0f0"
                          showInfo={false}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          {editingSection && (
                            <Button
                              size="middle"
                              onClick={() => {
                                if (editingSection === 'education') {
                                  showEducationReview();
                                } else {
                                  showExperienceReview();
                                }
                                setEditingSection(null);
                              }}
                              className="flex items-center justify-center w-full sm:w-auto"
                            >
                              Cancel
                            </Button>
                          )}
                          {/* Always show back button if onBack is provided */}
                          {onBack && (
                            <Button
                              size="middle"
                              className="flex items-center justify-center w-full sm:w-auto"
                              onClick={onBack}
                            >
                              Back
                            </Button>
                          )}
                          <Button
                            type="primary"
                            size="middle"
                            htmlType="submit"
                            icon={<CheckOutlined />}
                            loading={loading}
                            className="flex items-center justify-center w-full sm:w-auto"
                          >
                            {loading ? 'Saving...' : editingSection ? `Save ${editingSection}` : 'Save & Next'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}

                {/* New User - No Data */}
                {!hasExistingData && currentView !== 'form' && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="mb-6">
                      <BookOutlined className="text-4xl sm:text-6xl text-gray-300 mb-4" />
                      <Title level={4} className="text-gray-600 !text-lg sm:!text-xl">
                        No Professional Data Found
                      </Title>
                      <Text type="secondary" className="text-sm sm:text-base">
                        Get started by creating your professional resume profile
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="middle"
                      icon={<PlusOutlined />}
                      onClick={showForm}
                      className="flex items-center justify-center mx-auto w-full sm:w-auto"
                    >
                      Create Resume Profile
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResumeBuilderTab;