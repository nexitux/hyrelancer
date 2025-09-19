// components/TicketDetailPage.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";

const TicketDetailPage = ({ ticket, onStatusChange, onAssignAgent, onReply }) => {
  const [replyMessage, setReplyMessage] = useState("");

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

  const handleReply = () => {
    if (!replyMessage.trim()) return;
    onReply(ticket.id, replyMessage);
    setReplyMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6 flex items-center">
          <Link
            href="/support-tickets"
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Tickets
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Details</h1>
        </div>

        {/* Ticket Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">#{ticket.id} - {ticket.subject}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{ticket.description}</p>
            </div>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Customer</p>
              <p className="text-gray-900 dark:text-white font-medium">{ticket.customer} ({ticket.customerEmail})</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Category</p>
              <p className="text-gray-900 dark:text-white font-medium">{ticket.category}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Assigned To</p>
              <p className="text-gray-900 dark:text-white font-medium">{ticket.agent}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-gray-900 dark:text-white font-medium">{new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Status Update */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onStatusChange(ticket.id, "Open")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  ticket.status === "Open" 
                    ? "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => onStatusChange(ticket.id, "In Progress")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  ticket.status === "In Progress" 
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => onStatusChange(ticket.id, "Closed")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  ticket.status === "Closed" 
                    ? "bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          {/* Assign Agent */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Assign Agent</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAssignAgent(ticket.id, "You")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  ticket.agent === "You" 
                    ? "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
              >
                Assign to Me
              </button>
              <button
                onClick={() => onAssignAgent(ticket.id, "Support Agent 1")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  ticket.agent === "Support Agent 1" 
                    ? "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
              >
                Agent 1
              </button>
              <button
                onClick={() => onAssignAgent(ticket.id, "Support Agent 2")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  ticket.agent === "Support Agent 2" 
                    ? "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
              >
                Agent 2
              </button>
              <button
                onClick={() => onAssignAgent(ticket.id, "Support Agent 3")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  ticket.agent === "Support Agent 3" 
                    ? "bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                }`}
              >
                Agent 3
              </button>
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Conversation</h3>
          <div className="space-y-4">
            {ticket.replies.map((reply) => (
              <div 
                key={reply.id} 
                className={`p-4 rounded-lg border ${
                  reply.user === "You" 
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 ml-8" 
                    : "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{reply.user}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(reply.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{reply.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Reply to Ticket</h3>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
            placeholder="Type your response here..."
          ></textarea>
          <div className="flex justify-end">
            <button
              onClick={handleReply}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Send Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;