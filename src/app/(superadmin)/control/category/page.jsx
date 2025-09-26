"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  MdAdd,
  MdEdit,
  MdVisibility,
  MdDelete,
  MdSearch,
  MdFilterList,
  MdCheckCircle,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import Link from 'next/link';
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

export default function CategoryTable() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);

  const encodeId = (id) => Base64.encode(String(id));

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.get('/category');
      const result = response.data;
      const list = result?.data?.data ?? result?.data ?? result;
      const total = result?.data?.total ?? (Array.isArray(list) ? list.length : 0);
      setCategories(Array.isArray(list) ? list : []);
      setTotalCategories(total);

    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle row selection
  const handleSelectCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((c) => c.sc_id));
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    const encodedId = Base64.encode(String(categoryId));
    setLoading(true);
    setError(null);

    try {
      await adminApi.delete(`/category/${encodedId}`);

      fetchCategories();

    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to your component
  const handleDeleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const deletePromises = selectedCategories.map(categoryId => {
        const encodedId = Base64.encode(String(categoryId));
        return adminApi.delete(`/category/${encodedId}`);
      });

      await Promise.all(deletePromises);

      // Clear the selections and re-fetch the data
      setSelectedCategories([]);
      fetchCategories();

    } catch (err) {
      console.error('Error deleting categories:', err);
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) => {
    return category.sc_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Category Management
            </h1>
            <p className="mt-1 text-slate-600">
              Manage and organize all your categories
            </p>
          </div>
          <Link href="category/add-category">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <MdAdd size={20} />
              Add New Category
            </button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <MdSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* The category page doesn't have a second filter, so this is removed */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        {/* Total Categories */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Categories</p>
              <p className="text-2xl font-bold text-slate-800">
                {totalCategories}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdCheckCircle className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        {/* Active Categories (assuming a backend filter can be added) */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Active Categories</p>
              <p className="text-2xl font-bold text-green-600">
                {categories.filter((c) => c.sc_is_active === 1).length}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        {/* This card is not applicable, but kept for layout consistency */}
        {/* <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Services</p>
              <p className="text-2xl font-bold text-slate-800">
                (N/A)
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-purple-100 rounded-lg">
              <MdFilterList className="text-purple-600" size={20} />
            </div>
          </div>
        </div> */}
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="p-12 text-center text-slate-500">
          <p>Loading categories...</p>
        </div>
      )}

      {error && (
        <div className="p-12 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Table Section */}
      {!loading && !error && filteredCategories.length > 0 && (
        <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
          {/* Table Header Actions */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
            <div className="flex gap-4 items-center">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedCategories.length === filteredCategories.length &&
                    filteredCategories.length > 0
                  }
                  onChange={handleSelectAll}
                  className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : "Select all"}
                </span>
              </label>
            </div>
            {selectedCategories.length > 0 && (
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
                    Category
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
                {filteredCategories.map((item) => (
                  <tr
                    key={item.sc_id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(item.sc_id)}
                          onChange={() => handleSelectCategory(item.sc_id)}
                          className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.sc_name}
                          </p>
                          <p className="text-sm text-slate-500">ID: {item.sc_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center items-center">
                        <Link href={`category/categoryView/${encodeId(item.sc_id)}`}>
                          <button
                            className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                            title="View"
                          >
                            <MdVisibility size={16} />
                          </button>
                        </Link>
                        <Link href={`category/edit-category/${encodeId(item.sc_id)}`}>
                          <button
                            className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
                            title="Edit"
                          >
                            <MdEdit size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.sc_id)}
                          className="p-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
                          title="Delete"
                        >
                          <MdDelete size={16} />
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
              Showing {filteredCategories.length} of {totalCategories} categories
            </div>
            <div className="flex gap-2 items-center">
              {/* Pagination buttons (simplified as API data is only on one page) */}
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-not-allowed" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCategories.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
            <MdSearch className="text-slate-400" size={24} />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-800">
            No categories found
          </h3>
          <p className="mb-6 text-slate-600">
            Try adjusting your search criteria or add a new category.
          </p>
          <Link href="/category/add-category">
            <button className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
              Add New Category
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}