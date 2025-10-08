"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  MdSearch,
  MdCheckCircle,
  MdPending,
  MdChevronLeft,
  MdChevronRight,
  MdApproval
} from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';
import { message } from 'antd';
import adminApi from '@/config/adminApi';

// --- Status Check Helper ---
const needsApproval = (freelancer) => {
  // Check if any of the fa_*_app fields have value "0" (pending approval)
  const approvalFields = [
    'fa_ca_app', 'fa_sc_app', 'fa_se_app', 'fa_display_name_app', 'fa_img_app',
    'fa_banner_app', 'fa_headline_app', 'fa_desc_app', 'fa_lang_app', 'fa_occupation_app',
    'fa_ex_year_app', 'fa_profile_tag_line_app', 'fa_working_location_app', 'fa_available_time_app',
    'fa_completing_time_app', 'fa_payment_methode_app', 'fa_amount_for_app', 'fa_amt_hour_app',
    'fa_co_id_app', 'fa_st_id_app', 'fa_ci_id_app', 'fa_fb_app', 'fa_Linkdein_app',
    'fa_twitter_app', 'fa_pinterest_app', 'fa_instagram_app', 'fa_youtube_app', 'fa_Website_app',
    'fa_tab_1_app', 'fa_tab_2_app', 'fa_tab_3_app', 'fa_tab_4_app', 'fa_tab_5_app'
  ];
  
  // Return true if any of the approval fields has value "0"
  return approvalFields.some(field => freelancer[field] === "0");
};

export default function FreelancerApprovalListPage() {
  const router = useRouter();

  // --- State Variables ---
  const [searchTerm, setSearchTerm] = useState('');

  // API Data State
  const [allFreelancers, setAllFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await adminApi.get('/freelancers', { params });
        
        // Handle both direct array response and data property
        const freelancersData = response.data.data || response.data;
        
        // Filter only freelancers that need approval
        const approvalNeededData = freelancersData.filter(needsApproval);

        setAllFreelancers(approvalNeededData);
        // Reset to first page when data changes
        setCurrentPage(1);

      } catch (err) {
        console.error('Error fetching freelancers:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch freelancers';
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFreelancers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // --- Pagination Logic ---
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFreelancers.slice(startIndex, endIndex);
  }, [allFreelancers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(allFreelancers.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, allFreelancers.length);

  // --- Event Handlers ---
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Freelancer Approvals</h1>
            <p className="mt-1 text-slate-600">Review and approve pending freelancer registrations</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="relative flex-1 max-w-md">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mb-6">
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200 max-w-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">{allFreelancers.length}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-orange-100 rounded-lg">
              <MdPending className="text-orange-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Freelancers Pending Approval</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Freelancer ID</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Name</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Email</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Registration Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="5" className="py-12 text-center text-red-500">{error}</td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((freelancer) => (
                  <tr key={freelancer.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono text-sm text-slate-800">#{freelancer.id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{freelancer.name}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800">{freelancer.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        freelancer.is_status === 'old' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {freelancer.is_status === 'old' 
                          ? <>
                              <MdCheckCircle size={12} />
                              Completed
                            </>
                          : <>
                              <MdPending size={12} />
                              Incomplete
                            </>
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/control/freelancelist/approval/${Base64.encode(freelancer.id.toString())}/options`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <MdApproval size={16} />
                        Review & Approve
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <MdCheckCircle className="text-green-500" size={48} />
                      <div>
                        <p className="font-medium text-slate-800">No pending approvals</p>
                        <p className="text-sm text-slate-600">All freelancers have been reviewed</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {allFreelancers.length > 0 && (
          <div className="flex flex-col gap-4 items-center justify-between px-6 py-4 border-t border-slate-200 sm:flex-row">
            <div className="text-sm text-slate-600">
              Showing {startItem} to {endItem} of {allFreelancers.length} results
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <MdChevronLeft size={20} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <MdChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}