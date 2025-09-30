'use client';
import React, { useState, useEffect } from 'react';
import { 
  MdArrowBack, 
  MdSearch, 
  MdFilterList,
  MdWork,
  MdLocationOn,
  MdAttachMoney,
  MdSchedule,
  MdPerson,
  MdEmail,
  MdPhone,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdAssignment,
  MdBusiness,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';
import adminApi from '@/config/adminApi';
import { message } from 'antd';

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getJobStatusInfo = (job) => {
  const status = job.cuj_job_status;
  const isAssigned = job.cuj_is_assigned;
  const isRejected = job.cuj_is_rejected;
  const isActive = job.cuj_is_active;

  if (isActive === '0') {
    return { 
      status: 'Inactive', 
      color: 'bg-gray-100 text-gray-800',
      icon: <MdCancel size={12} />
    };
  }

  if (isRejected === '1') {
    return { 
      status: 'Rejected', 
      color: 'bg-red-100 text-red-800',
      icon: <MdCancel size={12} />
    };
  }

  if (status === 'completed') {
    return { 
      status: 'Completed', 
      color: 'bg-green-100 text-green-800',
      icon: <MdCheckCircle size={12} />
    };
  }

  if (status === 'in_progress') {
    return { 
      status: 'In Progress', 
      color: 'bg-blue-100 text-blue-800',
      icon: <MdSchedule size={12} />
    };
  }

  if (isAssigned === '1') {
    return { 
      status: 'Assigned', 
      color: 'bg-purple-100 text-purple-800',
      icon: <MdPerson size={12} />
    };
  }

  return { 
    status: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: <MdPending size={12} />
  };
};

export default function CustomerJobsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId;

  const [jobs, setJobs] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchCustomerJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.get(`/getJobsForCustomer/${customerId}`);
      const data = response.data?.job_list || [];
      
      // Process jobs with status info
      const processedJobs = data.map(job => ({
        ...job,
        statusInfo: getJobStatusInfo(job)
      }));

      // Sort by creation date (latest first)
      const sortedJobs = processedJobs.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      setJobs(sortedJobs);
      
      // Set customer info from first job if available
      if (data.length > 0 && data[0].customer) {
        setCustomer(data[0].customer);
      }

    } catch (err) {
      console.error('Error fetching customer jobs:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch customer jobs';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerJobs();
    }
  }, [customerId]);

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.cuj_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.cuj_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.cuj_contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.cuj_contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || job.statusInfo.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredJobs.length);

  // Get unique status options for filter dropdown
  const statusOptions = [...new Set(jobs.map(job => job.statusInfo.status))].sort();

  // Stats
  const stats = {
    total: jobs.length,
    completed: jobs.filter(job => job.statusInfo.status === 'Completed').length,
    pending: jobs.filter(job => job.statusInfo.status === 'Pending').length,
    assigned: jobs.filter(job => job.statusInfo.status === 'Assigned').length,
    rejected: jobs.filter(job => job.statusInfo.status === 'Rejected').length
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading customer jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Error Loading Jobs</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomerJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/control/customerlist"
              className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Back to Customers"
            >
              <MdArrowBack size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Customer Jobs</h1>
              {customer && (
                <p className="mt-1 text-slate-600">
                  Jobs posted by <span className="font-medium">{customer.name}</span> ({customer.email})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs by title, description, or contact info..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="lg:w-64">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Jobs</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdWork className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-yellow-100 rounded-lg">
              <MdPending className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Assigned</p>
              <p className="text-2xl font-bold text-purple-600">{stats.assigned}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-purple-100 rounded-lg">
              <MdPerson className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
              <MdCancel className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Job Title</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Category</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Location</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Salary Range</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Assigned To</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <tr key={job.cuj_id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{job.cuj_title}</p>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{job.cuj_desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            job.cuj_job_type === 'Full-Time' 
                              ? 'bg-blue-100 text-blue-800' 
                              : job.cuj_job_type === 'Part-Time'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {job.cuj_job_type}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            job.cuj_work_mode === 'Remote' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {job.cuj_work_mode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{job.job_category?.sc_name}</p>
                        <p className="text-xs text-slate-500">{job.job_service?.se_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MdLocationOn size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {job.cuj_location || 'Not specified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MdAttachMoney size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">
                          ₹{job.cuj_salary_range_from} - ₹{job.cuj_salary_range_to}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${job.statusInfo.color}`}>
                        {job.statusInfo.icon}
                        {job.statusInfo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.freelancer ? (
                        <div>
                          <p className="text-sm font-medium text-slate-800">{job.freelancer.name}</p>
                          <p className="text-xs text-slate-500">{job.freelancer.email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MdSchedule size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {formatDate(job.created_at)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
                      <MdWork className="text-slate-400" size={24} />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-800">No jobs found</h3>
                    <p className="text-slate-600">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'Try adjusting your search criteria.' 
                        : 'This customer has not posted any jobs yet.'
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="flex flex-col gap-4 items-center justify-between px-6 py-4 border-t border-slate-200 sm:flex-row">
            <div className="text-sm text-slate-600">
              Showing {startItem} to {endItem} of {filteredJobs.length} results
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
