"use client";
import React, { useEffect, useState } from "react";
import adminApi from "@/config/adminApi";

const AdminFollowMessagesPage = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [followUpLoadingId, setFollowUpLoadingId] = useState(null);

  // Fetch list from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // const response = await adminApi.get("adminview");
        const response = await adminApi.get('http://localhost:8000/api/admin/adminview');
        const data = response?.data;

        // Accept common shapes: {status, data}, array, or {items}
        let rawList = [];
        if (Array.isArray(data)) rawList = data;
        else if (Array.isArray(data?.data)) rawList = data.data;   
        else if (Array.isArray(data?.items)) rawList = data.items;
        else if (data?.status === "success" && Array.isArray(data?.messages)) rawList = data.messages;

        // Normalize to a consistent shape used by the table
        const list = (rawList || []).map((row) => ({
          id: row?.sc_id ?? row?.id,
          sender_name: row?.sender?.name ?? row?.sender_name ?? row?.customer_name ?? row?.user_name,
          sender_email: row?.sender?.email ?? row?.sender_email ?? row?.email,
          receiver_name: row?.receiver?.name ?? row?.freelancer_name ?? row?.provider_name,
          receiver_email: row?.receiver?.email ?? row?.receiver_email,
          message: row?.sc_request_send_message ?? row?.message ?? row?.description ?? "",
          admin_followup: row?.sc_admin_followup,
          read_flag: row?.sc_read_type_1,
          created_at: row?.created_at ?? row?.createdAt ?? row?.date,
          _raw: row
        }));

        setRows(list);
      } catch (err) {
        console.error("Error fetching adminview:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filters
  useEffect(() => {
    let result = rows;

    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter((row) => {
        // Search against normalized fields
        const fields = [
          row?.sender_name,
          row?.receiver_name,
          row?.message,
          row?.sender_email,
          row?.receiver_email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fields.includes(term);
      });
    }

    if (fromDate || toDate) {
      result = result.filter((row) => {
        const createdAt = new Date(row?.created_at || row?.createdAt || row?.date || 0);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from && to) return createdAt >= from && createdAt <= to;
        if (from) return createdAt >= from;
        if (to) return createdAt <= to;
        return true;
      });
    }

    // Sort: Requested (read_flag=1) first, then Followed (admin_followup=1), then by latest date
    result = [...result].sort((a, b) => {
      const aPriority = Number(a?.read_flag) === 0 ? 0 : 1; // 1 first
      const bPriority = Number(b?.read_flag) === 0 ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;

      const aFollowed = Number(b?.admin_followup) - Number(a?.admin_followup); // 1 before 0
      if (aFollowed !== 0) return aFollowed;

      const aDate = new Date(a?.created_at || 0).getTime();
      const bDate = new Date(b?.created_at || 0).getTime();
      return bDate - aDate; // latest first
    });

    setFilteredRows(result);
  }, [rows, searchTerm, fromDate, toDate]);

  const handleFollowUp = async (id) => {
    if (!id) return;
    try {
      setFollowUpLoadingId(id);
  //  await adminApi.get(`/followup/${id}`);
    await adminApi.get(`http://localhost:8000/api/admin/followup/${id}`);
      // optimistically set admin_followup = 1 in both rows and filteredRows
      setRows(prev => prev.map(r => (r.id === id ? { ...r, admin_followup: 1 } : r)));
      setFilteredRows(prev => prev.map(r => (r.id === id ? { ...r, admin_followup: 1 } : r)));
    } catch (e) {
      console.error('Follow up failed:', e);
      alert('Failed to trigger follow up.');
    } finally {
      setFollowUpLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Follow Messages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Freelancer did not respond to customer contact queries</p>
        </div>

        {/* Main content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Search Filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by name, subject or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""} found
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Freelancer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Admin Followup
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRows.map((row, idx) => (
                  <tr key={row?.id || row?.afm_id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">{row?.sender_name || "-"}</span>
                        {row?.sender_email && (<span className="text-xs text-gray-500">{row?.sender_email}</span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">{row?.receiver_name || "-"}</span>
                        {row?.receiver_email && (<span className="text-xs text-gray-500">{row?.receiver_email}</span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${Number(row?.admin_followup) === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {Number(row?.admin_followup) === 1 ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${Number(row?.read_flag) === 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                        {Number(row?.read_flag) === 1 ? 'Received' : 'Requested'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {(() => {
                        const d = row?.created_at;
                        if (!d) return "-";
                        try {
                          return new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
                        } catch {
                          return "-";
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {Number(row?.read_flag) === 0 && Number(row?.admin_followup) === 0 && (
                        <button
                          onClick={() => handleFollowUp(row?.id)}
                          disabled={followUpLoadingId === row?.id}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white`}
                          title="Trigger follow up"
                        >
                          {followUpLoadingId === row?.id ? 'Processing...' : 'Follow Up'}
                        </button>
                      )}
                      {Number(row?.read_flag) === 0 && Number(row?.admin_followup) === 1 && (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300"
                          title="Already followed up"
                        >
                          Followed
                        </button>
                      )}
                      {Number(row?.read_flag) === 1 && Number(row?.admin_followup) === 0 && (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 cursor-default"
                          title="Already shared"
                        >
                          Shared
                        </button>
                      )}
                      {Number(row?.read_flag) === 1 && Number(row?.admin_followup) === 1 && (
                        <button
                          disabled
                           className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700 cursor-default"
                          title="Completed"
                        >
                          Shared
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? "No records match your search." : "No records found."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFollowMessagesPage;


