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
  MdErrorOutline
} from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';
import { message } from 'antd'; // Make sure to import message

// --- API Configuration ---
const API_BASE_URL = 'https://test.hyrelancer.in/api/admin';
const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }
};

export default function ListFreelancerPage() {
  const router = useRouter();

  // --- State Variables ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);

  // API Data State
  const [allFreelancers, setAllFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = TokenManager.getToken();
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const url = new URL(`${API_BASE_URL}/freelancers`);
        if (searchTerm) {
          url.searchParams.append('search', searchTerm);
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch freelancers: ${response.statusText}`);
        }

        const data = await response.json();

        const processedData = data.map(freelancer => ({
          ...freelancer,
          status: freelancer.is_active === '1' ? 'Active' : 'Inactive'
        }));

        setAllFreelancers(processedData);

      } catch (err) {
        console.error(err);
        setError(err.message);
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
      const matchesStatus = selectedStatus === 'all' || freelancer.status === selectedStatus;
      return matchesStatus;
    });
  }, [allFreelancers, selectedStatus]);

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    const total = allFreelancers.length;
    const active = allFreelancers.filter(f => f.status === "Active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [allFreelancers]);

  // --- Event Handlers ---

  const handleDeactivate = async (freelancerIds) => {
    if (!window.confirm(`Are you sure you want to deactivate ${freelancerIds.length} freelancer(s)?`)) {
      return;
    }

    const token = TokenManager.getToken();
    if (!token) {
      message.error("Authentication failed. Please log in again.");
      return;
    }

    let successCount = 0;
    for (const id of freelancerIds) {
      try {
        const encodedId = Base64.encode(id.toString());
        const response = await fetch(`${API_BASE_URL}/freelancers/${encodedId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || `Failed to deactivate freelancer ID ${id}`);
        }

        setAllFreelancers(prevFreelancers =>
          prevFreelancers.map(freelancer =>
            freelancer.id === id
              ? { ...freelancer, status: 'Inactive', is_active: '0' }
              : freelancer
          )
        );
        successCount++;
      } catch (err) {
        console.error(err);
        message.error(err.message);
      }
    }
    
    if (successCount > 0) {
        message.success(`${successCount} freelancer(s) deactivated successfully.`);
    }
    setSelectedFreelancers([]);
  };

  const handleSelectFreelancer = (freelancerId) => {
    setSelectedFreelancers(prev =>
      prev.includes(freelancerId)
        ? prev.filter(id => id !== freelancerId)
        : [...prev, freelancerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFreelancers.length === filteredFreelancers.length && filteredFreelancers.length > 0) {
      setSelectedFreelancers([]);
    } else {
      setSelectedFreelancers(filteredFreelancers.map(f => f.id));
    }
  };

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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
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
              <p className="text-sm text-slate-600">Active Freelancers</p>
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
              <p className="text-sm text-slate-600">Inactive Freelancers</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
              <MdCancel className="text-red-600" size={20} />
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
                checked={selectedFreelancers.length === filteredFreelancers.length && filteredFreelancers.length > 0}
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
                onClick={() => handleDeactivate(selectedFreelancers)}
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
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Username</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Email</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Mobile</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="6" className="py-12 text-center text-red-500">{error}</td></tr>
              ) : filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((freelancer) => (
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
                          <p className="text-sm text-slate-500">ID: {freelancer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><p className="text-slate-800">{freelancer.username}</p></td>
                    <td className="px-6 py-4 whitespace-nowrap"><p className="text-slate-800">{freelancer.email}</p></td>
                    <td className="px-6 py-4 whitespace-nowrap"><p className="text-slate-800">{freelancer.mobile}</p></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        freelancer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {freelancer.status === 'Active' ? <MdCheckCircle size={12} /> : <MdCancel size={12} />}
                        {freelancer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end items-center">
                        <Link
                          href={`/freelancelist/freelancerView/${Base64.encode(freelancer.id.toString())}`}
                          className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                          title="View"
                        >
                          <MdVisibility size={16} />
                        </Link>
                        <Link
                          href={`/freelancelist/freelancerEdit/${Base64.encode(freelancer.id.toString())}`}
                          className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
                          title="Edit"
                        >
                          <MdEdit size={16} />
                        </Link>
                        <button
                          className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                          title="Deactivate"
                          onClick={() => handleDeactivate([freelancer.id])}
                        >
                          <MdDelete size={16} />
                        </button>
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
      </div>
    </div>
  );
}