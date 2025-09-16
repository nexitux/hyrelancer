'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
  MdBusiness,
  MdWork
} from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Base64 } from 'js-base64';

// API configuration and Token Manager
const API_BASE_URL = 'https://test.hyrelancer.in/api/admin';
const TokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminToken');
    }
    return null;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ListCustomerPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const encodeId = (id) => Base64.encode(String(id));
  
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers.');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Assuming 'is_active' is the status field
    const matchesStatus = true; // Your API doesn't have a status filter, so we'll just check for search.
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(f => f.id));
    }
  };

  const handleDelete = async (customerId) => {
  if (!confirm('Are you sure you want to deactivate this customer?')) {
    return;
  }
  
  const encodedId = Base64.encode(String(customerId));
  setLoading(true);
  setError(null);
  
  try {
    const token = TokenManager.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    const response = await fetch(`${API_BASE_URL}/customers/${encodedId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to deactivate customer.');
    }

    // Refresh the customer list after successful deactivation
    fetchCustomers();
    
  } catch (err) {
    console.error('Error deactivating customer:', err);
    setError(err.message || 'An error occurred during deactivation.');
  } finally {
    setLoading(false);
  }
};

const handleDeleteSelected = async () => {
  if (!confirm(`Are you sure you want to deactivate ${selectedCustomers.length} customers?`)) {
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    const token = TokenManager.getToken();
    if (!token) {
      throw new Error('Authentication token not found.');
    }

    const deletePromises = selectedCustomers.map(customerId => {
      const encodedId = Base64.encode(String(customerId));
      return fetch(`${API_BASE_URL}/customers/${encodedId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    });

    const results = await Promise.all(deletePromises);

    const failedDeactivations = results.filter(res => !res.ok);
    if (failedDeactivations.length > 0) {
      throw new Error('One or more customers failed to deactivate.');
    }

    // Clear selections and re-fetch data
    setSelectedCustomers([]);
    fetchCustomers();
    
  } catch (err) {
    console.error('Error deactivating customers:', err);
    setError(err.message || 'An error occurred during deactivation.');
  } finally {
    setLoading(false);
  }
};

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active === "1").length;

  if (loading) {
    return <div className="p-6 min-h-screen flex justify-center items-center"><p>Loading customers...</p></div>;
  }

  if (error) {
    return <div className="p-6 min-h-screen flex justify-center items-center text-red-600"><p>Error: {error}</p></div>;
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
            <p className="mt-1 text-slate-600">Manage companies and organizations posting jobs</p>
          </div>
          <Link 
            href="/control/customerlist/addCustomer" 
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MdAdd size={20} />
            Add New Customer
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search customers by name, email or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Customers</p>
              <p className="text-2xl font-bold text-slate-800">{totalCustomers}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdBusiness className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">
                {activeCustomers}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        {/* Inactive Customers */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Inactive Customers</p>
              <p className="text-2xl font-bold text-red-600">
                {totalCustomers - activeCustomers}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
              <MdCancel className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
        {/* Table Header Actions */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <div className="flex gap-4 items-center">
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                onChange={handleSelectAll}
                className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                {selectedCustomers.length > 0 ? `${selectedCustomers.length} selected` : 'Select all'}
              </span>
            </label>
          </div>
          
          {selectedCustomers.length > 0 && (
            <div className="flex gap-2 items-center">
              <button 
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete Selected
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                Export
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Name</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Email</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Mobile</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Address</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                          className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{customer.name}</p>
                          <p className="text-sm text-slate-500">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800">{customer.mobile}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-slate-800">{customer.address}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.is_active === '1' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.is_active === '1' ? <MdCheckCircle size={12} /> : <MdCancel size={12} />}
                        {customer.is_active === '1' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end items-center">
                        <Link 
                          href={`customerlist/CustomerView/${encodeId(customer.id)}`}
                          className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                          title="View"
                        >
                          <MdVisibility size={16} />
                        </Link>
                        <Link
                          href={`/control/customerlist/editCustomer/${encodeId(customer.id)}`}
                          className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
                          title="Edit"
                        >
                          <MdEdit size={16} />
                        </Link>
                        <button 
                          className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                          title="Delete"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <MdDelete size={16} />  
                        </button>
                        <button 
                          className="p-2 rounded-lg transition-colors text-slate-400 hover:bg-slate-50"
                          title="More options"
                        >
                          <MdMoreVert size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
                      <MdSearch className="text-slate-400" size={24} />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-800">No customers found</h3>
                    <p className="text-slate-600">Try adjusting your search criteria or add a new customer.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredCustomers.length > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}