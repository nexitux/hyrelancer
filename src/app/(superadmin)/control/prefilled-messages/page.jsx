"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  MdAdd,
  MdEdit,
  MdVisibility,
  MdDelete,
  MdSearch,
  MdCheckCircle,
  MdMessage,
  MdRestoreFromTrash,
} from "react-icons/md";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Base64 } from 'js-base64';
import adminApi from '@/config/adminApi';

// Helper function to format date from API
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PrefilledMessagesTable() {
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);

  const encodeId = (id) => Base64.encode(String(id));

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.get('/messages');
      const result = response.data;
      const list = result?.messages ?? result?.data ?? result;
      const total = Array.isArray(list) ? list.length : 0;
      setMessages(Array.isArray(list) ? list : []);
      setTotalMessages(total);

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle row selection
  const handleSelectMessage = (messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map((m) => m.id));
    }
  };

  const handleToggleStatus = async (messageId) => {
    const encodedId = Base64.encode(String(messageId));
    setLoading(true);
    setError(null);

    try {
      await adminApi.delete(`/messages/${encodedId}`);
      fetchMessages();

    } catch (err) {
      console.error('Error toggling message status:', err);
      setError(err.message || 'An error occurred during status change.');
    } finally {
      setLoading(false);
    }
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter((message) => {
    return message.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           message.createdBy?.ad_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Prefilled Messages Management
            </h1>
            <p className="mt-1 text-slate-600">
              Manage and organize all prefilled messages
            </p>
          </div>
          <Link href="prefilled-messages/add-message">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <MdAdd size={20} />
              Add New Message
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
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        {/* Total Messages */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Messages</p>
              <p className="text-2xl font-bold text-slate-800">
                {totalMessages}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdMessage className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        {/* Active Messages */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Active Messages</p>
              <p className="text-2xl font-bold text-green-600">
                {messages.filter((m) => m.is_active === 1).length}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        {/* Inactive Messages */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Inactive Messages</p>
              <p className="text-2xl font-bold text-red-600">
                {messages.filter((m) => m.is_active === 0).length}
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-lg">
              <MdRestoreFromTrash className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="p-12 text-center text-slate-500">
          <p>Loading messages...</p>
        </div>
      )}

      {error && (
        <div className="p-12 text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Table Section */}
      {!loading && !error && filteredMessages.length > 0 && (
        <div className="overflow-hidden bg-white rounded-xl border shadow-sm border-slate-200">
          {/* Table Header Actions */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
            <div className="flex gap-4 items-center">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedMessages.length === filteredMessages.length &&
                    filteredMessages.length > 0
                  }
                  onChange={handleSelectAll}
                  className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  {selectedMessages.length > 0
                    ? `${selectedMessages.length} selected`
                    : "Select all"}
                </span>
              </label>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-slate-50 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-left text-slate-700">
                    Message
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
                {filteredMessages.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(item.id)}
                          onChange={() => handleSelectMessage(item.id)}
                          className="text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <div className="max-w-md">
                          <p className="font-medium text-slate-800 truncate">
                            {item.body?.substring(0, 100)}
                            {item.body?.length > 100 && "..."}
                          </p>
                          <p className="text-sm text-slate-500">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                   
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.is_active === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center items-center">
                        <Link href={`prefilled-messages/view-message/${encodeId(item.id)}`}>
                          <button
                            className="p-2 text-blue-600 rounded-lg transition-colors hover:bg-blue-50"
                            title="View"
                          >
                            <MdVisibility size={16} />
                          </button>
                        </Link>
                        <Link href={`prefilled-messages/edit-message/${encodeId(item.id)}`}>
                          <button
                            className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50"
                            title="Edit"
                          >
                            <MdEdit size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.is_active === 1 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={item.is_active === 1 ? "Deactivate" : "Activate"}
                        >
                          {item.is_active === 1 ? <MdDelete size={16} /> : <MdRestoreFromTrash size={16} />}
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
              Showing {filteredMessages.length} of {totalMessages} messages
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
      {!loading && !error && filteredMessages.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
            <MdMessage className="text-slate-400" size={24} />
          </div>
          <h3 className="mb-2 text-lg font-medium text-slate-800">
            No messages found
          </h3>
          <p className="mb-6 text-slate-600">
            Try adjusting your search criteria or add a new message.
          </p>
          <Link href="prefilled-messages/add-message">
            <button className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
              Add New Message
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
