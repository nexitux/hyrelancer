"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  MdAdd,
  MdEdit,
  MdVisibility,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdCheckCircle,
  MdCancel,
  MdErrorOutline,
  MdPending,
  MdBlock,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';
import { message } from 'antd';
import adminApi from '@/config/adminApi';

// --- Status Mapping Helper ---
const getStatusInfo = (freelancer) => {
  const isActive = freelancer.is_active;
  const isActiveAcc = freelancer.is_active_acc;
  const isRegiComplete = freelancer.is_regi_complete;
  
  // Priority order: Account status -> Active status -> Registration status
  if (isActiveAcc === '0') {
    return { 
      status: 'Inactive', 
      color: 'bg-red-100 text-red-800',
      icon: <MdBlock size={12} />
    };
  }

  if (isActiveAcc === '1') {
    return { 
      status: 'Active', 
      color: 'bg-green-100 text-green-800',
      icon: <MdCheckCircle size={12} />
    };
  }
  
  if (isActive === '0') {
    return { 
      status: 'Deleted', 
      color: 'bg-gray-100 text-gray-800',
      icon: <MdCancel size={12} />
    };
  }
  
  if (isActive === '1') {
    return { 
      status: 'Approved', 
      color: 'bg-green-100 text-green-800',
      icon: <MdCheckCircle size={12} />
    };
  }
  
  if (isActive === '2') {
    if (isRegiComplete === '0') {
      return { 
        status: 'Pending Approval', 
        color: 'bg-orange-100 text-orange-800',
        icon: <MdPending size={12} />
      };
    }
    return { 
      status: 'Pending Approval', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: <MdPending size={12} />
    };
  }
  
  return { 
    status: 'Unknown', 
    color: 'bg-gray-100 text-gray-800',
    icon: <MdErrorOutline size={12} />
  };
};

export default function ListFreelancerPage() {
  const router = useRouter();

  // --- State Variables ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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
        
        const processedData = freelancersData.map(freelancer => ({
          ...freelancer,
          statusInfo: getStatusInfo(freelancer)
        }));

        // Sort by creation date (latest first)
        const sortedData = processedData.sort((a, b) => {
          // Try different possible date fields
          const dateA = new Date(a.created_at || a.createdAt || a.date_created || a.registration_date || 0);
          const dateB = new Date(b.created_at || b.createdAt || b.date_created || b.registration_date || 0);
          return dateB - dateA; // Descending order (latest first)
        });

        setAllFreelancers(sortedData);
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

  // --- Client-side Filtering ---
  const filteredFreelancers = useMemo(() => {
    return allFreelancers.filter(freelancer => {
      const matchesStatus = selectedStatus === 'all' || freelancer.statusInfo.status === selectedStatus;
      return matchesStatus;
    });
  }, [allFreelancers, selectedStatus]);

  // --- Pagination Logic ---
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFreelancers.slice(startIndex, endIndex);
  }, [filteredFreelancers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredFreelancers.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredFreelancers.length);

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const total = allFreelancers.length;
    const active = allFreelancers.filter(f => f.statusInfo.status === "Active").length;
    const inactive = allFreelancers.filter(f => f.statusInfo.status === "Inactive").length;
    const pending = allFreelancers.filter(f => f.statusInfo.status === "Pending Approval").length;
    const blocked = allFreelancers.filter(f => f.statusInfo.status === "Blocked").length;
    return { total, active, inactive, pending, blocked };
  }, [allFreelancers]);

  // --- Event Handlers ---
  const handleStatusUpdate = async (freelancerIds, action) => {
    const actionText = action === 'deactivate' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} ${freelancerIds.length} freelancer(s)?`)) {
      return;
    }

    let successCount = 0;
    for (const id of freelancerIds) {
      try {
        const encodedId = Base64.encode(id.toString());
        
        if (action === 'deactivate') {
          await adminApi.delete(`/freelancers/${encodedId}`);
        } else {
          await adminApi.patch(`/freelancers/${encodedId}`, { is_active: '1' });
        }

        // Update local state
        setAllFreelancers(prevFreelancers =>
          prevFreelancers.map(freelancer => {
            if (freelancer.id === id) {
              const updatedFreelancer = {
                ...freelancer,
                is_active: action === 'deactivate' ? '0' : '1'
              };
              return {
                ...updatedFreelancer,
                statusInfo: getStatusInfo(updatedFreelancer)
              };
            }
            return freelancer;
          })
        );
        successCount++;
      } catch (err) {
        console.error(`Error ${actionText}ing freelancer ${id}:`, err);
        const errorMessage = err.response?.data?.message || err.message || `Failed to ${actionText} freelancer ID ${id}`;
        message.error(errorMessage);
      }
    }
    
    if (successCount > 0) {
      message.success(`${successCount} freelancer(s) ${actionText}d successfully.`);
    }
    setSelectedFreelancers([]);
  };

  // Handle activate/deactivate account
  const handleAccountStatus = async (freelancerId, status) => {
    const actionText = status === '1' ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} this freelancer account?`)) {
      return;
    }

    try {
      const encodedId = Base64.encode(freelancerId.toString());
      const response = await adminApi.get(`/activeFeAccount/${status}/${encodedId}`);
      
      if (response.data.message) {
        message.success(response.data.message);
        
        // Update local state
        setAllFreelancers(prevFreelancers =>
          prevFreelancers.map(freelancer => {
            if (freelancer.id === freelancerId) {
              const updatedFreelancer = {
                ...freelancer,
                is_active_acc: status
              };
              return {
                ...updatedFreelancer,
                statusInfo: getStatusInfo(updatedFreelancer)
              };
            }
            return freelancer;
          })
        );
      }
    } catch (err) {
      console.error(`Error ${actionText}ing freelancer account:`, err);
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${actionText} freelancer account`;
      message.error(errorMessage);
    }
  };

  const handleSelectFreelancer = (freelancerId) => {
    setSelectedFreelancers(prev =>
      prev.includes(freelancerId)
        ? prev.filter(id => id !== freelancerId)
        : [...prev, freelancerId]
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = paginatedData.map(f => f.id);
    const allCurrentPageSelected = currentPageIds.every(id => selectedFreelancers.includes(id));
    
    if (allCurrentPageSelected && currentPageIds.length > 0) {
      // Deselect all current page items
      setSelectedFreelancers(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all current page items
      setSelectedFreelancers(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedFreelancers([]); // Clear selections when changing page
  };


  // Get unique status options for filter dropdown
  const statusOptions = useMemo(() => {
    const uniqueStatuses = [...new Set(allFreelancers.map(f => f.statusInfo.status))];
    return uniqueStatuses.sort();
  }, [allFreelancers]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedFreelancers([]);
  }, [selectedStatus]);

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Freelancer Management</h1>
            <p className="mt-1 text-slate-600">Manage and organize all your Freelancers</p>
          </div>
          <Link
            href="/control/freelancelist/addFreelancer"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MdAdd size={20} />
            Add New Freelancer
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search freelancers by name, email, username or mobile..."
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <MdFilterList size={20} />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Freelancers</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdCheckCircle className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-gray-100 rounded-lg">
              <MdCancel className="text-gray-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Incomplete</p>
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
              <p className="text-sm text-slate-600">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
              <MdBlock className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <div className="flex gap-4 items-center">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={paginatedData.length > 0 && paginatedData.every(f => selectedFreelancers.includes(f.id))}
                onChange={handleSelectAll}
                className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                {selectedFreelancers.length > 0 ? `${selectedFreelancers.length} selected` : 'Select all'}
              </span>
            </label>
          </div>
          {selectedFreelancers.length > 0 && (
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleStatusUpdate(selectedFreelancers, 'activate')}
                className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedFreelancers, 'deactivate')}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Deactivate Selected
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Name</th>
                {/* <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Username</th> */}
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Email</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Mobile</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Registration</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="py-12 text-center text-red-500">{error}</td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((freelancer) => (
                  <tr key={freelancer.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedFreelancers.includes(freelancer.id)}
                          onChange={() => handleSelectFreelancer(freelancer.id)}
                          className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{freelancer.name}</p>
                          {/* <p className="text-sm text-slate-500">ID: {freelancer.id}</p> */}
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800">{freelancer.username}</p>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800">{freelancer.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800">{freelancer.mobile}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        freelancer.is_status === 'old' 
                          ? 'bg-green-100 text-green-800' 
                          : freelancer.is_status === 'new'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {freelancer.is_status === 'old' 
                          ? 'Complete' 
                          : freelancer.is_status === 'new'
                          ? 'Incomplete'
                          : 'Under Review'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${freelancer.statusInfo.color}`}>
                        {freelancer.statusInfo.icon}
                        {freelancer.statusInfo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end items-center">
                        <Link
                          href={`freelancelist/freelancerView/${Base64.encode(freelancer.id.toString())}`}
                          className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                          title="View"
                        >
                          <MdVisibility size={16} />
                        </Link>
                        <Link
                          href={`freelancelist/freelancerEdit/${Base64.encode(freelancer.id.toString())}`}
                          className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
                          title="Edit"
                        >
                          <MdEdit size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="py-12 text-center">No freelancers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredFreelancers.length > 0 && (
          <div className="flex flex-col gap-4 items-center justify-between px-6 py-4 border-t border-slate-200 sm:flex-row">
            <div className="text-sm text-slate-600">
              Showing {startItem} to {endItem} of {filteredFreelancers.length} results
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