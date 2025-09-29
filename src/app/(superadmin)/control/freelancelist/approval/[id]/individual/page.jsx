"use client";
import React, { useState, useEffect } from 'react';
import {
  MdArrowBack,
  MdCheckCircle,
  MdPending,
  MdPerson,
  MdImage,
  MdLanguage,
  MdWork,
  MdSchedule,
  MdPayment,
  MdLocationOn,
  MdLink,
  MdDescription,
  MdTag,
  MdAttachMoney,
  MdBusiness,
  MdPublic,
  MdError
} from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';
import { message, Button, Card, Spin, Badge, Space, Divider, Table } from 'antd';
import adminApi from '@/config/adminApi';

export default function IndividualApprovalPage({ params }) {
  const { id } = params;
  const router = useRouter();
  
  // Decode the Base64 encoded ID
  const decodedId = decodeURIComponent(id);
  
  // State variables
  const [approvalData, setApprovalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingFields, setApprovingFields] = useState(new Set());

  // Fetch approval data
  useEffect(() => {
    const fetchApprovalData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminApi.get(`/getFeUapprovalList/${decodedId}`);
        setApprovalData(response.data);
        
      } catch (err) {
        console.error('Error fetching approval data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch approval data';
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (decodedId) {
      fetchApprovalData();
    }
  }, [decodedId]);

  // Handle individual field approval
  const handleFieldApproval = async (fieldName) => {
    try {
      setApprovingFields(prev => new Set(prev).add(fieldName));
      
      // Convert profile field name to approval field name
      const approvalFieldName = `fa_${fieldName.replace('fp_', '')}_app`;
      await adminApi.get(`/approveFeUData/${approvalFieldName}/${decodedId}`);
      
      message.success(`${getFieldDisplayName(fieldName)} approved successfully!`);
      
      // Refresh data to show updated status
      const response = await adminApi.get(`/getFeUapprovalList/${decodedId}`);
      setApprovalData(response.data);
      
    } catch (error) {
      console.error('Error approving field:', error);
      message.error(`Failed to approve ${getFieldDisplayName(fieldName)}`);
    } finally {
      setApprovingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldName);
        return newSet;
      });
    }
  };

  // Get field display name
  const getFieldDisplayName = (fieldName) => {
    const fieldNames = {
      'fp_display_name': 'Display Name',
      'fp_img': 'Profile Image',
      'fp_banner': 'Banner',
      'fp_headline': 'Headline',
      'fp_desc': 'Description',
      'fp_lang': 'Languages',
      'fp_occupation': 'Occupation',
      'fp_ex_year': 'Experience Years',
      'fp_profile_tag_line': 'Profile Tag Line',
      'fp_working_location': 'Working Location',
      'fp_available_time': 'Available Time',
      'fp_completing_time': 'Completing Time',
      'fp_payment_methode': 'Payment Method',
      'fp_amount_for': 'Amount For',
      'fp_amt_hour': 'Amount Per Hour',
      'fp_co_id': 'Country',
      'fp_st_id': 'State',
      'fp_ci_id': 'City',
      'fp_fb': 'Facebook',
      'fp_Linkdein': 'LinkedIn',
      'fp_twitter': 'Twitter',
      'fp_pinterest': 'Pinterest',
      'fp_instagram': 'Instagram',
      'fp_youtube': 'YouTube',
      'fp_Website': 'Website'
    };
    return fieldNames[fieldName] || fieldName;
  };

  // Get field icon
  const getFieldIcon = (fieldName) => {
    const iconMap = {
      'fp_display_name': MdPerson,
      'fp_img': MdImage,
      'fp_banner': MdImage,
      'fp_headline': MdDescription,
      'fp_desc': MdDescription,
      'fp_lang': MdLanguage,
      'fp_occupation': MdWork,
      'fp_ex_year': MdSchedule,
      'fp_profile_tag_line': MdTag,
      'fp_working_location': MdLocationOn,
      'fp_available_time': MdSchedule,
      'fp_completing_time': MdSchedule,
      'fp_payment_methode': MdPayment,
      'fp_amount_for': MdAttachMoney,
      'fp_amt_hour': MdAttachMoney,
      'fp_co_id': MdBusiness,
      'fp_st_id': MdBusiness,
      'fp_ci_id': MdBusiness,
      'fp_fb': MdLink,
      'fp_Linkdein': MdLink,
      'fp_twitter': MdLink,
      'fp_pinterest': MdLink,
      'fp_instagram': MdLink,
      'fp_youtube': MdLink,
      'fp_Website': MdPublic
    };
    return iconMap[fieldName] || MdPerson;
  };

  // Check if field needs approval
  const needsApproval = (fieldName) => {
    if (!approvalData?.u_approval) return false;
    const approvalField = `fa_${fieldName.replace('fp_', '')}_app`;
    return approvalData.u_approval[approvalField] === "0";
  };

  // Get field value
  const getFieldValue = (fieldName) => {
    if (!approvalData?.u_profile) return null;
    return approvalData.u_profile[fieldName];
  };

  // Format field value for display
  const formatFieldValue = (fieldName, value) => {
    if (!value || value === "0" || value === null) return "Not provided";
    
    // Handle image fields
    if (fieldName === 'fp_img' && value !== "0") {
      return "Image uploaded";
    }
    
    // Handle HTML content
    if (fieldName === 'fp_desc' && value.includes('<')) {
      return value.replace(/<[^>]*>/g, '').substring(0, 100) + (value.length > 100 ? '...' : '');
    }
    
    // Handle comma-separated values
    if (fieldName === 'fp_lang' && value.includes(',')) {
      return value.split(',').filter(lang => lang.trim()).join(', ');
    }
    
    return value;
  };

  // Check if field has a valid value (not 0, "0", or null)
  const hasValidValue = (fieldName) => {
    const value = getFieldValue(fieldName);
    return value && value !== "0" && value !== 0 && value !== null && value !== "";
  };

  // Get all fields that need approval and have valid values
  const getFieldsNeedingApproval = () => {
    const allFields = [
      'fp_display_name', 'fp_img', 'fp_banner', 'fp_headline', 'fp_desc',
      'fp_lang', 'fp_occupation', 'fp_ex_year', 'fp_profile_tag_line',
      'fp_working_location', 'fp_available_time', 'fp_completing_time',
      'fp_payment_methode', 'fp_amount_for', 'fp_amt_hour', 'fp_co_id',
      'fp_st_id', 'fp_ci_id', 'fp_fb', 'fp_Linkdein', 'fp_twitter',
      'fp_pinterest', 'fp_instagram', 'fp_youtube', 'fp_Website'
    ];
    
    return allFields.filter(field => needsApproval(field) && hasValidValue(field));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-slate-600 mt-4">Loading individual approval data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <MdError className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button
            onClick={() => router.push('/control/freelancelist/approval')}
            type="primary"
          >
            Back to Approval List
          </Button>
        </div>
      </div>
    );
  }

  const fieldsNeedingApproval = getFieldsNeedingApproval();

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            icon={<MdArrowBack />}
            onClick={() => router.push(`/control/freelancelist/approval/${decodedId}/options`)}
            className="flex items-center gap-2"
          >
            Back to Options
          </Button>
        </div>

        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Individual Field Approval</h1>
            <p className="mt-1 text-slate-600">Review and approve individual fields in the freelancer's profile</p>
          </div>
          <Badge 
            count={fieldsNeedingApproval.length} 
            style={{ backgroundColor: '#f59e0b' }}
          >
            <span className="text-sm text-slate-600">Fields Pending</span>
          </Badge>
        </div>

        {/* Freelancer Info Card */}
        {approvalData?.u_profile && (
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdPerson className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{approvalData.u_profile.fp_display_name}</h3>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Fields Table */}
      <Card className="mb-6">
        <Table
          dataSource={fieldsNeedingApproval.map((fieldName, index) => ({
            key: fieldName,
            index: index + 1,
            fieldName,
            fieldDisplayName: getFieldDisplayName(fieldName),
            fieldValue: formatFieldValue(fieldName, getFieldValue(fieldName)),
            status: 'Pending',
            isApproving: approvingFields.has(fieldName)
          }))}
          columns={[
            {
              title: '#',
              dataIndex: 'index',
              key: 'index',
              width: 60,
              align: 'center'
            },
            {
              title: 'Field',
              dataIndex: 'fieldDisplayName',
              key: 'fieldDisplayName',
              render: (text, record) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    {React.createElement(getFieldIcon(record.fieldName), {
                      className: "text-orange-600",
                      size: 16
                    })}
                  </div>
                  <span className="font-medium text-slate-800">{text}</span>
                </div>
              )
            },
            {
              title: 'Current Value',
              dataIndex: 'fieldValue',
              key: 'fieldValue',
              render: (text) => (
                <div className="max-w-xs">
                  <p className="text-sm text-slate-700 break-words">
                    {text}
                  </p>
                </div>
              )
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: () => (
                <Badge 
                  status="processing" 
                  text="Pending" 
                  className="text-xs"
                />
              )
            },
            {
              title: 'Action',
              key: 'action',
              width: 120,
              render: (_, record) => (
                <Button
                  type="primary"
                  icon={<MdCheckCircle />}
                  loading={record.isApproving}
                  onClick={() => handleFieldApproval(record.fieldName)}
                  size="small"
                >
                  Approve
                </Button>
              )
            }
          ]}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} fields`
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Empty State */}
      {fieldsNeedingApproval.length === 0 && (
        <Card className="text-center py-12">
          <MdCheckCircle className="text-green-500 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Fields Require Approval</h3>
          <p className="text-slate-600 mb-4">All fields with valid values have been reviewed and approved, or no fields have valid values to approve.</p>
          <Button
            onClick={() => router.push(`/control/freelancelist/approval/${decodedId}/options`)}
            type="primary"
          >
            Back to Options
          </Button>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Approval Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${fieldsNeedingApproval.length > 0 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className="text-slate-700">
              Fields with Valid Values: {fieldsNeedingApproval.length > 0 ? `${fieldsNeedingApproval.length} pending` : 'All approved'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-700">
              Total Valid Fields: {fieldsNeedingApproval.length} requiring approval
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
