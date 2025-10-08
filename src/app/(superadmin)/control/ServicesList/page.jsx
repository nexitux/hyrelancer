"use client";
import React, { useState, useEffect, useCallback } from "react";
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
} from "react-icons/md";
import { useRouter } from "next/navigation";
import { Base64 } from 'js-base64';
import adminApi from '@/config/adminApi';

// Using centralized adminApi config

// Helper function to format date from API
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ListServicePage() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServices, setSelectedServices] = useState([]);

  // Use a map to store category IDs and names to display
  const [categoriesMap, setCategoriesMap] = useState(new Map());
  const [totalServices, setTotalServices] = useState(0);

  const encodeId = (id) => Base64.encode(String(id));

  // Memoized function to fetch data from the API
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.get('/services');
      const result = response.data;
      const list = result?.data ?? result;
      setServices(Array.isArray(list) ? list : []);
      setTotalServices(result?.total ?? (Array.isArray(list) ? list.length : 0));

      // Create a map of categories to display names
      const uniqueCategories = new Map();
      (Array.isArray(list) ? list : []).forEach(service => {
        // This is a placeholder. A real-world scenario would require a separate category API call
        // to get the category names from their IDs (se_sc_id). For this example, we'll just use the ID.
        uniqueCategories.set(service.se_sc_id, `Category ${service.se_sc_id}`);
      });
      setCategoriesMap(uniqueCategories);
      
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message || 'An error occurred while fetching services.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filter logic
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.se_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.se_desc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.se_sc_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Clamp current page when filters or data change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredServices.length]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Handle row selection
  const handleSelectService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map((s) => s.se_id));
    }
  };

  const handleDelete = async (serviceId) => {
  if (!confirm('Are you sure you want to delete this service?')) {
    return;
  }
  
  const encodedId = Base64.encode(String(serviceId));
  setLoading(true);
  setError(null);
  
  try {
    await adminApi.delete(`/services/${encodedId}`);

    // Refresh the service list after successful deletion
    fetchServices();
    
  } catch (err) {
    console.error('Error deleting service:', err);
    setError(err.message || 'An error occurred during deletion.');
  } finally {
    setLoading(false);
  }
};

const handleDeleteSelected = async () => {
  if (!confirm(`Are you sure you want to delete ${selectedServices.length} services?`)) {
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    const deletePromises = selectedServices.map(serviceId => {
      const encodedId = Base64.encode(String(serviceId));
      return adminApi.delete(`/services/${encodedId}`);
    });

    await Promise.all(deletePromises);

    // Clear the selections and re-fetch the data
    setSelectedServices([]);
    fetchServices();
    
  } catch (err) {
    console.error('Error deleting services:', err);
    setError(err.message || 'An error occurred during deletion.');
  } finally {
    setLoading(false);
  }
};

  // Stats calculation
  const activeServicesCount = services.filter((s) => s.se_is_active === 1).length;
  const uniqueCategoriesCount = categoriesMap.size;

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Services Management
            </h1>
            <p className="mt-1 text-slate-600">
              Manage and organize all your services
            </p>
          </div>
          <button     
            onClick={() => router.push(`/control/ServicesList/addService`)} 
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MdAdd size={20} />
            Add New Service
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <MdSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search services or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Array.from(categoriesMap.keys()).map((categoryId) => (
                  <option key={categoryId} value={categoryId}>
                    {categoriesMap.get(categoryId)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        {/* Total Services */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Services</p>
              <p className="text-2xl font-bold text-slate-800">
                {totalServices}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdCheckCircle className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        {/* Active Services */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Active Services</p>
              <p className="text-2xl font-bold text-green-600">
                {activeServicesCount}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Categories</p>
              <p className="text-2xl font-bold text-slate-800">
                {uniqueCategoriesCount}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-purple-100 rounded-lg">
              <MdFilterList className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading & Error States */}
      {loading && (
        <div className="p-12 text-center text-slate-500">
          <p>Loading services...</p>
        </div>
      )}

      {error && (
        <div className="p-12 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Table Section */}
      {!loading && !error && filteredServices.length > 0 && (
        <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
          {/* Table Header Actions */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
            <div className="flex gap-4 items-center">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedServices.length === filteredServices.length &&
                    filteredServices.length > 0
                  }
                  onChange={handleSelectAll}
                  className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  {selectedServices.length > 0
                    ? `${selectedServices.length} selected`
                    : "Select all"}
                </span>
              </label>
            </div>

            {selectedServices.length > 0 && (
              <div className="flex gap-2 items-center">
                <button 
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Delete Selected
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700">
                    Service
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700">
                    Category ID
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700">
                    Created
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-center text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedServices.map((item) => (
                  <tr
                    key={item.se_id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(item.se_id)}
                          onChange={() => handleSelectService(item.se_id)}
                          className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.se_name}
                          </p>
                          <p className="text-sm text-slate-500">ID: {item.se_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoriesMap.get(item.se_sc_id) || `Category ${item.se_sc_id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.se_is_active === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.se_is_active === 1 ? (
                          <MdCheckCircle size={12} />
                        ) : (
                          <MdCancel size={12} />
                        )}
                        {item.se_is_active === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          onClick={() =>
                            router.push(`ServicesList/serviceView/${encodeId(item.se_id)}`)
                          }
                          className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                          title="View"
                        >
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`ServicesList/ServiceEdit/${encodeId(item.se_id)}`)
                          }
                          className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
                          title="Edit"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.se_id)}
                          className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                          title="Delete"
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {filteredServices.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredServices.length)} of {filteredServices.length}
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors border border-slate-200 ${currentPage === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors border border-slate-200 ${currentPage === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredServices.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
            <MdSearch className="text-slate-400" size={24} />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-800">
            No services found
          </h3>
          <p className="mb-6 text-slate-600">
            Try adjusting your search criteria or add a new service.
          </p>
          <button onClick={() => router.push(`/ServicesList/ServiceCreate`)} className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
            Add New Service
          </button>
        </div>
      )}
    </div>
  );
}