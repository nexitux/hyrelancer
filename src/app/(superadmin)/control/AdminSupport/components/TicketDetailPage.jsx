// components/TicketDetailPage.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";

const TicketDetailPage = ({ ticket, onStatusChange, onReply, encodedTicketId }) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "in_progress": 
      case "in progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
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

  const handleReply = () => {
    if (!replyMessage.trim()) return;
    onReply(encodedTicketId, replyMessage);
    setReplyMessage("");
  };

    const handleCloseTicket = async () => {
      setIsClosing(true);
      try {
        await onStatusChange(encodedTicketId, "closed");
        setShowCloseModal(true);
        
        // Auto-hide modal after 8 seconds
        setTimeout(() => {
          setShowCloseModal(false);
        }, 8000);
      } catch (error) {
        console.error('Error closing ticket:', error);
      } finally {
        setIsClosing(false);
      }
    };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6 flex items-center">
          <Link
            href="/control/AdminSupport"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 relative">
          {/* Close Ticket Button - Top Right */}
          {ticket.status !== "closed" && (
            <button
              onClick={handleCloseTicket}
              disabled={isClosing}
              className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClosing ? "Closing..." : "Close Ticket"}
            </button>
          )}
          
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.ticket_code} - {ticket.subject}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{ticket.message}</p>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Customer Name</p>
              <p className="text-gray-900 dark:text-white font-medium">{ticket.user ? ticket.user.name : `User ${ticket.user_id}`}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">User Type</p>
              <p className="text-gray-900 dark:text-white font-medium">{ticket.usertype}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-gray-900 dark:text-white font-medium">{new Date(ticket.created_at).toLocaleDateString('en-GB')}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="text-gray-900 dark:text-white font-medium">{new Date(ticket.updated_at).toLocaleDateString('en-GB')}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400">Priority</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Status</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
          </div>


          {ticket.file && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Attachment</p>
                <a 
                  href={`http://test.hyrelancer.in/${ticket.file}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View File
                </a>
              </div>
            )}
        </div>

        {/* Conversation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">Conversation</h3>
          <div className={`space-y-3 ${ticket.replies.length > 3 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
            {/* Original Ticket Message */}
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-bl-sm">
                <p className="text-sm mb-1">{ticket.message}</p>
                {ticket.file && (
                  <div className="mt-1">
                    <a 
                      href={`http://test.hyrelancer.in/${ticket.file}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                    >
                      📎 View Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            {/* Replies */}
            {ticket.replies.map((reply, index) => {
              const currentDate = new Date(reply.timestamp).toLocaleDateString('en-GB');
              const previousDate = index > 0 ? new Date(ticket.replies[index - 1].timestamp).toLocaleDateString('en-GB') : null;
              const showDateHeader = currentDate !== previousDate;
              
              return (
                <div key={reply.id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                        {currentDate}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${reply.user === "Admin" ? "justify-end" : "justify-start"}`}>
                    <div 
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        reply.user === "Admin" 
                          ? "bg-blue-500 text-white rounded-br-sm" 
                          : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm mb-1">{reply.message}</p>
                      {reply.file && (
                        <div className="mt-1">
                          <a 
                            href={`http://test.hyrelancer.in/${reply.file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-xs ${
                              reply.user === "Admin" 
                                ? "text-blue-100 hover:text-white" 
                                : "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            }`}
                          >
                            📎 View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {ticket.replies.length > 3 && (
            <div className="text-center mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Scroll to see more messages ({ticket.replies.length + 1} total)
              </span>
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Reply to Ticket</h3>
          {ticket.status === "closed" ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">This ticket is closed</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">No further replies can be sent</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Ticket Closed Successfully!
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The support ticket has been closed and marked as resolved.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-3 rounded-b-xl">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;