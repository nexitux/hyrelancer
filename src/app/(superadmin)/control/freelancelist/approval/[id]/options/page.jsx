"use client";
import React, { useState, useEffect } from 'react';
import {
  MdArrowBack,
  MdApproval,
  MdCheckCircle,
  MdPending,
  MdPerson,
  MdAssignment,
  MdError
} from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';
import { message } from 'antd';
import adminApi from '@/config/adminApi';

export default function FreelancerApprovalOptionsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  
  // Decode the Base64 encoded ID
  const decodedId = decodeURIComponent(id);
  
  // State variables
  const [approvalData, setApprovalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Check if tab-wise approval is needed
  const needsTabWiseApproval = () => {
    if (!approvalData?.u_approval) return false;
    
    const tabApprovals = [
      approvalData.u_approval.fa_tab_1_app,
      approvalData.u_approval.fa_tab_2_app,
      approvalData.u_approval.fa_tab_3_app,
      approvalData.u_approval.fa_tab_4_app,
      approvalData.u_approval.fa_tab_5_app
    ];
    
    return tabApprovals.some(status => status === "0");
  };

  // Check if individual approval is needed
  const needsIndividualApproval = () => {
    if (!approvalData?.u_approval) return false;
    
    // First check if any tab fields need approval - if so, individual approval should be disabled
    const tabApprovals = [
      approvalData.u_approval.fa_tab_1_app,
      approvalData.u_approval.fa_tab_2_app,
      approvalData.u_approval.fa_tab_3_app,
      approvalData.u_approval.fa_tab_4_app,
      approvalData.u_approval.fa_tab_5_app
    ];
    
    // If any tab field needs approval, disable individual approval
    if (tabApprovals.some(status => status === "0")) {
      return false;
    }
    
    // Only check individual fields if no tab fields need approval
    const individualApprovals = [
      approvalData.u_approval.fa_ca_app,
      approvalData.u_approval.fa_sc_app,
      approvalData.u_approval.fa_se_app,
      approvalData.u_approval.fa_display_name_app,
      approvalData.u_approval.fa_img_app,
      approvalData.u_approval.fa_banner_app,
      approvalData.u_approval.fa_headline_app,
      approvalData.u_approval.fa_desc_app,
      approvalData.u_approval.fa_lang_app,
      approvalData.u_approval.fa_occupation_app,
      approvalData.u_approval.fa_ex_year_app,
      approvalData.u_approval.fa_profile_tag_line_app,
      approvalData.u_approval.fa_working_location_app,
      approvalData.u_approval.fa_available_time_app,
      approvalData.u_approval.fa_completing_time_app,
      approvalData.u_approval.fa_payment_methode_app,
      approvalData.u_approval.fa_amount_for_app,
      approvalData.u_approval.fa_amt_hour_app,
      approvalData.u_approval.fa_co_id_app,
      approvalData.u_approval.fa_st_id_app,
      approvalData.u_approval.fa_ci_id_app,
      approvalData.u_approval.fa_fb_app,
      approvalData.u_approval.fa_Linkdein_app,
      approvalData.u_approval.fa_twitter_app,
      approvalData.u_approval.fa_pinterest_app,
      approvalData.u_approval.fa_instagram_app,
      approvalData.u_approval.fa_youtube_app,
      approvalData.u_approval.fa_Website_app
    ];
    
    return individualApprovals.some(status => status === "0");
  };

  // Check if any approval is needed (either tab-wise or individual)
  const needsAnyApproval = () => {
    return needsTabWiseApproval() || needsIndividualApproval();
  };

  // Get pending tab count
  const getPendingTabCount = () => {
    if (!approvalData?.u_approval) return 0;
    
    const tabApprovals = [
      approvalData.u_approval.fa_tab_1_app,
      approvalData.u_approval.fa_tab_2_app,
      approvalData.u_approval.fa_tab_3_app,
      approvalData.u_approval.fa_tab_4_app,
      approvalData.u_approval.fa_tab_5_app
    ];
    
    return tabApprovals.filter(status => status === "0").length;
  };

  // Get pending individual count
  const getPendingIndividualCount = () => {
    if (!approvalData?.u_approval) return 0;
    
    // First check if any tab fields need approval - if so, individual count should be 0
    const tabApprovals = [
      approvalData.u_approval.fa_tab_1_app,
      approvalData.u_approval.fa_tab_2_app,
      approvalData.u_approval.fa_tab_3_app,
      approvalData.u_approval.fa_tab_4_app,
      approvalData.u_approval.fa_tab_5_app
    ];
    
    // If any tab field needs approval, return 0 for individual count
    if (tabApprovals.some(status => status === "0")) {
      return 0;
    }
    
    // Only count individual fields if no tab fields need approval
    const individualApprovals = [
      approvalData.u_approval.fa_ca_app,
      approvalData.u_approval.fa_sc_app,
      approvalData.u_approval.fa_se_app,
      approvalData.u_approval.fa_display_name_app,
      approvalData.u_approval.fa_img_app,
      approvalData.u_approval.fa_banner_app,
      approvalData.u_approval.fa_headline_app,
      approvalData.u_approval.fa_desc_app,
      approvalData.u_approval.fa_lang_app,
      approvalData.u_approval.fa_occupation_app,
      approvalData.u_approval.fa_ex_year_app,
      approvalData.u_approval.fa_profile_tag_line_app,
      approvalData.u_approval.fa_working_location_app,
      approvalData.u_approval.fa_available_time_app,
      approvalData.u_approval.fa_completing_time_app,
      approvalData.u_approval.fa_payment_methode_app,
      approvalData.u_approval.fa_amount_for_app,
      approvalData.u_approval.fa_amt_hour_app,
      approvalData.u_approval.fa_co_id_app,
      approvalData.u_approval.fa_st_id_app,
      approvalData.u_approval.fa_ci_id_app,
      approvalData.u_approval.fa_fb_app,
      approvalData.u_approval.fa_Linkdein_app,
      approvalData.u_approval.fa_twitter_app,
      approvalData.u_approval.fa_pinterest_app,
      approvalData.u_approval.fa_instagram_app,
      approvalData.u_approval.fa_youtube_app,
      approvalData.u_approval.fa_Website_app
    ];
    
    return individualApprovals.filter(status => status === "0").length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading approval options...</p>
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
          <button
            onClick={() => router.push('/control/freelancelist/approval')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Approval List
          </button>
        </div>
      </div>
    );
  }

  const tabWiseNeeded = needsTabWiseApproval();
  const individualNeeded = needsIndividualApproval();
  const anyApprovalNeeded = needsAnyApproval();
  const pendingTabCount = getPendingTabCount();
  const pendingIndividualCount = getPendingIndividualCount();

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/control/freelancelist/approval')}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MdArrowBack size={20} />
            Back to List
          </button>
        </div>

        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Approval Options</h1>
            <p className="mt-1 text-slate-600">Choose how you want to review this freelancer's application</p>
          </div>
        </div>

        {/* Freelancer Info Card */}
        {approvalData?.u_profile && (
          <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdPerson className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{approvalData.u_profile.fp_display_name}</h3>
                <p className="text-sm text-slate-600">Freelancer ID: #{approvalData.u_profile.fp_u_id}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tab-wise Approval Option */}
        <div className="p-6 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdAssignment className="text-green-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Tab-wise Approval</h3>
              <p className="text-slate-600 mb-4">
                Review and approve freelancer data section by section. This allows you to approve 
                different parts of the profile independently.
              </p>
              
              {tabWiseNeeded ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <MdPending size={16} />
                    <span className="text-sm font-medium">{pendingTabCount} sections pending approval</span>
                  </div>
                  <Link
                    href={`/control/freelancelist/approval/${decodedId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <MdApproval size={18} />
                    Start Tab-wise Review
                  </Link>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <MdCheckCircle size={16} />
                    <span className="text-sm font-medium">All sections approved</span>
                  </div>
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed font-medium"
                  >
                    <MdApproval size={18} />
                    All Sections Approved
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Individual Approval Option */}
        <div className="p-6 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdPerson className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Individual Field Approval</h3>
              <p className="text-slate-600 mb-4">
                Review and approve individual fields within the freelancer's profile. 
                This provides granular control over each data point.
              </p>
              
              {individualNeeded ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <MdPending size={16} />
                    <span className="text-sm font-medium">{pendingIndividualCount} fields pending approval</span>
                  </div>
                  <Link
                    href={`/control/freelancelist/approval/${decodedId}/individual`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <MdApproval size={18} />
                    Start Individual Review
                  </Link>
                </div>
              ) : tabWiseNeeded ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <MdPending size={16} />
                    <span className="text-sm font-medium">Tab-wise approval required first</span>
                  </div>
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed font-medium"
                  >
                    <MdApproval size={18} />
                    Complete Tab-wise Review First
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <MdCheckCircle size={16} />
                    <span className="text-sm font-medium">All fields approved</span>
                  </div>
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed font-medium"
                  >
                    <MdApproval size={18} />
                    All Fields Approved
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-6 p-4 bg-white rounded-xl border shadow-sm border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Approval Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${tabWiseNeeded ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <span className="text-slate-700">
              Tab-wise Approval: {tabWiseNeeded ? `${pendingTabCount} pending` : 'Complete'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${individualNeeded ? 'bg-orange-500' : tabWiseNeeded ? 'bg-slate-400' : 'bg-green-500'}`}></div>
            <span className="text-slate-700">
              Individual Approval: {individualNeeded ? `${pendingIndividualCount} pending` : tabWiseNeeded ? 'Waiting for tab-wise completion' : 'Complete'}
            </span>
          </div>
        </div>
        {!anyApprovalNeeded && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <MdCheckCircle size={16} />
              <span className="text-sm font-medium">All approvals completed - Freelancer is fully approved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

