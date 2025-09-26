// app/support-tickets/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import adminApi from "@/config/adminApi";

const AdminSupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.get('support/tickets');
        
        if (response.data && response.data.tickets) {
          setTickets(response.data.tickets);
          
          // Extract unique users from tickets
          const uniqueUsers = response.data.tickets.reduce((acc, ticket) => {
            const existingUser = acc.find(user => user.id === ticket.user_id);
            if (!existingUser) {
              acc.push({
                id: ticket.user_id,
                name: `User ${ticket.user_id}`,
                email: `user${ticket.user_id}@example.com`,
                usertype: ticket.usertype,
                ticketCount: response.data.tickets.filter(t => t.user_id === ticket.user_id).length
              });
            }
            return acc;
          }, []);
          setUsers(uniqueUsers);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to fetch tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filter tickets based on selected filters and search term
  useEffect(() => {
    console.log('Filtering tickets with:', { statusFilter, priorityFilter, userFilter, userTypeFilter, searchTerm });
    console.log('Sample ticket data:', tickets[0]);
    let result = tickets;
    
    if (statusFilter !== "All") {
      result = result.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter !== "All") {
      result = result.filter(ticket => ticket.priority === priorityFilter);
    }
    
    if (userFilter !== "All") {
      result = result.filter(ticket => ticket.user_id.toString() === userFilter);
    }
    
    if (userTypeFilter !== "All") {
      result = result.filter(ticket => {
        // Handle different possible usertype formats
        const userType = ticket.usertype?.toLowerCase();
        const filterType = userTypeFilter.toLowerCase();
        return userType === filterType || userType === filterType + 's';
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(ticket => {
        // More comprehensive search including all fields
        const subject = ticket.subject?.toLowerCase() || '';
        const message = ticket.message?.toLowerCase() || '';
        const ticketCode = ticket.ticket_code?.toLowerCase() || '';
        const userName = ticket.user_name?.toLowerCase() || '';
        const userType = ticket.usertype?.toLowerCase() || ''; // Fixed: use 'usertype' instead of 'user_type'
        const priority = ticket.priority?.toLowerCase() || '';
        const status = ticket.status?.toLowerCase() || '';
        
        // Enhanced date search with multiple formats
        let dateMatches = false;
        if (ticket.created_at) {
          const createdDate = new Date(ticket.created_at);
          
          // Multiple date formats for search
          const formats = [
            createdDate.toLocaleDateString().toLowerCase(), // 12/25/2023
            createdDate.toLocaleDateString('en-GB').toLowerCase(), // 25/12/2023
            createdDate.toLocaleDateString('en-US').toLowerCase(), // 12/25/2023
            createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase(), // december 25, 2023
            createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase(), // dec 25, 2023
            createdDate.getFullYear().toString(), // 2023
            createdDate.getMonth() + 1 + '', // 12 (month number)
            createdDate.getDate() + '', // 25 (day)
            createdDate.toISOString().split('T')[0], // 2023-12-25
            createdDate.toISOString().split('T')[0].replace(/-/g, '/'), // 2023/12/25
          ];
          
          // Also add month names
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                             'july', 'august', 'september', 'october', 'november', 'december'];
          const monthShortNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                                  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
          
          formats.push(monthNames[createdDate.getMonth()]);
          formats.push(monthShortNames[createdDate.getMonth()]);
          
          dateMatches = formats.some(format => format.includes(term));
        }
        
        return subject.includes(term) || 
               message.includes(term) ||
               ticketCode.includes(term) ||
               userName.includes(term) ||
               userType.includes(term) ||
               priority.includes(term) ||
               status.includes(term) ||
               dateMatches;
      });
    }
    
    // Sort by latest first
    result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    
    setFilteredTickets(result);
  }, [tickets, statusFilter, priorityFilter, userFilter, userTypeFilter, searchTerm]);


  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "in_progress": 
    
      case "closed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading tickets...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Support Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all user support requests</p>
        </div>

        {/* Main content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="open">Open</option>
             
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Type
                </label>
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All User Types</option>
                  <option value="customer">Customer</option>
                  <option value="freelancer">Freelancer</option>
                 
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by subject, message, user, type, priority, status, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ticket Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User Type
                  </th>
                  
                 
                 
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {ticket.ticket_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {ticket.user ? ticket.user.name : `User ${ticket.user_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.usertype === 'Freelancer' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {ticket.usertype}
                      </span>
                    </td>
                    
                  
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(ticket.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`AdminSupport/${btoa(ticket.id.toString())}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No tickets found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportTicketsPage;