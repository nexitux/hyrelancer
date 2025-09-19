"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Mock data for tickets
const initialTickets = [
  {
    id: 1,
    category: "Technical Issue",
    customer: "John Doe",
    agent: "Support Agent 1",
    status: "Open",
    subject: "Cannot login to dashboard",
    description: "I've been trying to login to my dashboard for the past hour but keep getting an error message.",
    priority: "High",
    createdAt: "2023-10-15T14:30:00Z",
    replies: [
      {
        id: 1,
        user: "Support Agent 1",
        message: "We're looking into this issue. Can you try clearing your browser cache?",
        timestamp: "2023-10-15T15:00:00Z",
        isAdmin: true
      },
      {
        id: 2,
        user: "John Doe",
        message: "I tried clearing the cache but still getting the same error.",
        timestamp: "2023-10-15T15:30:00Z",
        isAdmin: false
      }
    ]
  },
  {
    id: 2,
    category: "Billing",
    customer: "Jane Smith",
    agent: "Support Agent 2",
    status: "In Progress",
    subject: "Invoice discrepancy",
    description: "The amount on my latest invoice doesn't match what we agreed upon.",
    priority: "Medium",
    createdAt: "2023-10-14T10:15:00Z",
    replies: []
  },
  {
    id: 3,
    category: "Feature Request",
    customer: "Robert Johnson",
    agent: "Unassigned",
    status: "Closed",
    subject: "Dark mode option",
    description: "Would be great to have a dark mode option for the application.",
    priority: "Low",
    createdAt: "2023-10-10T09:45:00Z",
    replies: [
      {
        id: 1,
        user: "Support Agent 3",
        message: "Thank you for your suggestion. We've added this to our feature backlog.",
        timestamp: "2023-10-11T11:20:00Z",
        isAdmin: true
      },
      {
        id: 2,
        user: "Robert Johnson",
        message: "Great, looking forward to it!",
        timestamp: "2023-10-11T14:35:00Z",
        isAdmin: false
      }
    ]
  }
];

const TicketDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the ticket data from an API
    const ticketId = parseInt(params.id);
    const foundTicket = initialTickets.find(t => t.id === ticketId);
    setTicket(foundTicket);
  }, [params.id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReply = {
        id: ticket.replies.length + 1,
        user: "You (Admin)",
        message: replyMessage,
        timestamp: new Date().toISOString(),
        isAdmin: true
      };
      
      setTicket({
        ...ticket,
        replies: [...ticket.replies, newReply],
        status: ticket.status === "Open" ? "In Progress" : ticket.status
      });
      
      setReplyMessage("");
      setIsSubmitting(false);
    }, 500);
  };

  const handleStatusChange = (newStatus) => {
    setTicket({
      ...ticket,
      status: newStatus
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-red-100 text-red-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading ticket...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to tickets
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
                <div className="flex items-center mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Ticket #{ticket.id}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</h3>
                <p className="text-gray-900 dark:text-white">{ticket.customer}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Agent</h3>
                <p className="text-gray-900 dark:text-white">{ticket.agent}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                <p className="text-gray-900 dark:text-white">{ticket.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                <p className="text-gray-900 dark:text-white">
                  {new Date(ticket.replies.length ? ticket.replies[ticket.replies.length - 1].timestamp : ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                {ticket.description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Conversation</h2>
            
          </div>
          
          <div className="px-6 py-4 space-y-6 max-h-96 overflow-y-auto">
            {/* Initial ticket message */}
            <div className="flex">
              <div className="flex-shrink-0 mr-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 font-medium">
                    {ticket.customer.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-baseline">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{ticket.customer}</h4>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {ticket.description}
                </div>
              </div>
            </div>
            
            {/* Replies */}
            {ticket.replies.map((reply) => (
              <div key={reply.id} className={`flex ${reply.isAdmin ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0 mx-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    reply.isAdmin ? "bg-green-100 dark:bg-green-900" : "bg-blue-100 dark:bg-blue-900"
                  }`}>
                    <span className={`font-medium ${
                      reply.isAdmin ? "text-green-600 dark:text-green-300" : "text-blue-600 dark:text-blue-300"
                    }`}>
                      {reply.user.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className={`flex-grow ${reply.isAdmin ? 'text-right' : ''}`}>
                  <div className="flex items-baseline">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{reply.user}</h4>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(reply.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className={`mt-2 text-sm text-gray-700 dark:text-gray-300 p-4 rounded-lg ${
                    reply.isAdmin 
                      ? "bg-green-50 dark:bg-green-900/30" 
                      : "bg-gray-50 dark:bg-gray-700"
                  }`}>
                    {reply.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Reply form */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleReplySubmit}>
              <div>
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Add a reply
                </label>
                <div className="mt-1">
                  <textarea
                    id="reply"
                    name="reply"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !replyMessage.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;