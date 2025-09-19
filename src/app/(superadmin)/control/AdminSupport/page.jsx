// app/support-tickets/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

// Mock data for tickets - admin view with all users
const initialTickets = [
  {
    id: 1,
    category: "Technical Issue",
    customer: "John Doe",
    customerId: "user-123",
    customerEmail: "john@example.com",
    agent: "Unassigned",
    status: "Open",
    subject: "Cannot login to dashboard",
    description: "I've been trying to login to my dashboard for the past hour but keep getting an error message.",
    priority: "High",
    createdAt: "2023-10-15T14:30:00Z",
    updatedAt: "2023-10-15T14:30:00Z",
    replies: [
      {
        id: 1,
        user: "John Doe",
        message: "I'm still having this issue. Any updates?",
        timestamp: "2023-10-15T16:00:00Z"
      }
    ]
  },
  {
    id: 2,
    category: "Billing",
    customer: "Jane Smith",
    customerId: "user-456",
    customerEmail: "jane@example.com",
    agent: "Support Agent 2",
    status: "In Progress",
    subject: "Invoice discrepancy",
    description: "The amount on my latest invoice doesn't match what we agreed upon.",
    priority: "Medium",
    createdAt: "2023-10-14T10:15:00Z",
    updatedAt: "2023-10-15T09:20:00Z",
    replies: [
      {
        id: 1,
        user: "Support Agent 2",
        message: "We've forwarded this to our billing department.",
        timestamp: "2023-10-14T14:20:00Z"
      }
    ]
  },
  {
    id: 3,
    category: "Feature Request",
    customer: "Robert Johnson",
    customerId: "user-789",
    customerEmail: "robert@example.com",
    agent: "Support Agent 3",
    status: "Closed",
    subject: "Dark mode option",
    description: "Would be great to have a dark mode option for the application.",
    priority: "Low",
    createdAt: "2023-10-10T09:45:00Z",
    updatedAt: "2023-10-11T14:35:00Z",
    replies: [
      {
        id: 1,
        user: "Support Agent 3",
        message: "Thank you for your suggestion. We've added this to our feature backlog.",
        timestamp: "2023-10-11T11:20:00Z"
      },
      {
        id: 2,
        user: "Robert Johnson",
        message: "Great, looking forward to it!",
        timestamp: "2023-10-11T14:35:00Z"
      }
    ]
  },
  {
    id: 4,
    category: "Technical Issue",
    customer: "Sarah Williams",
    customerId: "user-101",
    customerEmail: "sarah@example.com",
    agent: "Support Agent 1",
    status: "Open",
    subject: "Upload not working",
    description: "When I try to upload files, the progress bar gets stuck at 50%.",
    priority: "High",
    createdAt: "2023-10-16T08:20:00Z",
    updatedAt: "2023-10-16T08:20:00Z",
    replies: []
  },
  {
    id: 5,
    category: "Account",
    customer: "Michael Brown",
    customerId: "user-202",
    customerEmail: "michael@example.com",
    agent: "Unassigned",
    status: "Open",
    subject: "Can't change password",
    description: "The password reset link is not working for my account.",
    priority: "Medium",
    createdAt: "2023-10-15T16:45:00Z",
    updatedAt: "2023-10-15T16:45:00Z",
    replies: []
  }
];

// Mock list of users
const users = [
  { id: "user-123", name: "John Doe", email: "john@example.com", ticketCount: 2 },
  { id: "user-456", name: "Jane Smith", email: "jane@example.com", ticketCount: 1 },
  { id: "user-789", name: "Robert Johnson", email: "robert@example.com", ticketCount: 1 },
  { id: "user-101", name: "Sarah Williams", email: "sarah@example.com", ticketCount: 1 },
  { id: "user-202", name: "Michael Brown", email: "michael@example.com", ticketCount: 1 }
];

const AdminSupportTicketsPage = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [filteredTickets, setFilteredTickets] = useState(initialTickets);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tickets based on selected filters and search term
  useEffect(() => {
    let result = tickets;
    
    if (statusFilter !== "All") {
      result = result.filter(ticket => ticket.status === statusFilter);
    }
    
    if (priorityFilter !== "All") {
      result = result.filter(ticket => ticket.priority === priorityFilter);
    }
    
    if (userFilter !== "All") {
      result = result.filter(ticket => ticket.customerId === userFilter);
    }
    
    if (agentFilter !== "All") {
      if (agentFilter === "Unassigned") {
        result = result.filter(ticket => ticket.agent === "Unassigned");
      } else {
        result = result.filter(ticket => ticket.agent === agentFilter);
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ticket => 
        ticket.subject.toLowerCase().includes(term) || 
        ticket.description.toLowerCase().includes(term) ||
        ticket.customer.toLowerCase().includes(term)
      );
    }
    
    // Sort by latest first
    result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    setFilteredTickets(result);
  }, [tickets, statusFilter, priorityFilter, userFilter, agentFilter, searchTerm]);

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId ? { 
          ...ticket, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        } : ticket
      )
    );
  };

  const handleAssignToMe = (ticketId) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId ? { 
          ...ticket, 
          agent: "You",
          updatedAt: new Date().toISOString()
        } : ticket
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "In Progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Closed": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "Low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

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
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
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
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
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
                  Agent
                </label>
                <select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="All">All Agents</option>
                  <option value="You">You</option>
                  <option value="Support Agent 1">Agent 1</option>
                  <option value="Support Agent 2">Agent 2</option>
                  <option value="Support Agent 3">Agent 3</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search tickets..."
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
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Updated
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
                      #{ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {ticket.customer}
                    </td>
                  
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`AdminSupport/${ticket.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
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