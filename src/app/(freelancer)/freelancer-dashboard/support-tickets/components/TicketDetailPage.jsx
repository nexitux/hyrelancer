"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../../config/api";

const TicketDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTicketDetails();
    }
  }, [params.id]); // Run when params.id changes
  
  const fetchTicketDetails = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
  
      const ticketId = params.id; // Primary ID from URL
      // Encode if API needs Base64
  
      // Fetch using primary ID
      const response = await api.get(`/tickets/${ticketId}/replies`);
      console.log("Ticket Detail Response:", response.data);
  
      const ticketData = response.data.ticket || response.data.data?.ticket;
      const repliesData = response.data.replies || response.data.data?.replies || [];
  
      setTicket(ticketData);
      setReplies(repliesData);
      setError(null);
      
      // Fetch user names for better display
      await fetchUserNames(ticketData, repliesData);
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      setError("Failed to load ticket details. Please try again.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchUserNames = async (ticketData, repliesData) => {
    try {
      const userIds = new Set();
      
      // Collect all user IDs
      if (ticketData?.user_id) {
        userIds.add(ticketData.user_id);
      }
      
      repliesData.forEach(reply => {
        if (reply.user_id) {
          userIds.add(reply.user_id);
        }
      });
      
    
      
      const userResults = await Promise.all(userPromises);
      const nameMap = {};
      userResults.forEach(user => {
        nameMap[user.id] = user.name;
      });
      
      setUserNames(nameMap);
    } catch (err) {
      console.error("Error fetching user names:", err);
    }
  };
  

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Encode the ticket ID for the API
      const encodedTicketId = (params.id);
      const response = await api.post(`/tickets/${encodedTicketId}/reply`, {
        message: replyMessage
      });
      
      if (response.data) {
        // Clear the reply message immediately for better UX
        setReplyMessage("");
        
        // Optimistically add the new reply to the list for instant feedback
      const newReply = {
          id: Date.now(), // Temporary ID
        message: replyMessage,
          usertype: 'user',
          user_id: ticket?.user_id, // Use the current user's ID
          user_name: 'You', // Show "You" for the current user's reply
          name: 'You',
          created_at: new Date().toISOString(),
          ...response.data
        };
        
        // Add the new reply immediately
        setReplies(prev => [...prev, newReply]);
        
        // Refresh data in background without blocking UI
        fetchTicketDetails(false).catch(err => {
          console.error('Background refresh failed:', err);
          // If background refresh fails, the optimistic update still shows the reply
        });
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      // Handle error - could show a toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setTicket({
      ...ticket,
      status: newStatus
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "closed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "open": return "Open";
      case "in_progress": return "In Progress";
      case "closed": return "Closed";
      default: return status;
    }
  };

  const formatPriority = (priority) => {
    switch (priority) {
      case "high": return "High";
      case "medium": return "Medium";
      case "low": return "Low";
      default: return priority;
    }
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handleCloseTicket = async () => {
    if (!ticket || ticket.status === 'closed') return;
    
    setIsClosing(true);
    
    try {
      const response = await api.post(`/support/ticket/close/${params.id}`);
      
      if (response.data) {
        // Update the ticket status locally
        setTicket(prev => ({
          ...prev,
          status: 'closed',
          updated_at: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
      // Handle error - could show a toast notification
    } finally {
      setIsClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading ticket...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 dark:text-gray-400">Ticket not found</div>
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
                    {formatStatus(ticket.status)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {formatPriority(ticket.priority)} Priority
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Ticket #{ticket.ticket_code}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(ticket.created_at).toLocaleDateString('en-GB')}
                </div>
                {ticket.status !== 'closed' && (
                  <div className="mt-2">
                    <button
                      onClick={handleCloseTicket}
                      disabled={isClosing}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isClosing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Closing...
                        </>
                      ) : (
                        'Close Ticket'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <p className="text-gray-900 dark:text-white">{formatStatus(ticket.status)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                <p className="text-gray-900 dark:text-white">
                  {new Date(ticket.updated_at).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Message</h3>
              <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p>{ticket.message}</p>
                {/* Show uploaded image if present */}
                {ticket.file && (
                  <div className="mt-3">
                    <img 
                      src={`https://hyre.hyrelancer.com/${ticket.file}`}
                      alt="Uploaded file"
                      className="max-w-80 max-h-80 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(`https://hyre.hyrelancer.com/${ticket.file}`)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Conversation</h2>
            
          </div>
          
          <div className="px-6 py-4 space-y-6 max-h-96 overflow-y-auto">
            {/* Group messages by date */}
            {(() => {
              // Combine ticket and replies
              const allMessages = [
                {
                  id: 'ticket',
                  message: ticket.message,
                  created_at: ticket.created_at,
                  usertype: 'user'
                },
                ...replies
              ];

              // Group messages by date
              const groupedMessages = allMessages.reduce((groups, message) => {
                const date = new Date(message.created_at).toLocaleDateString('en-GB');
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(message);
                return groups;
              }, {});

              // Sort dates
              const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
                return new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'));
              });

              return sortedDates.map((date, dateIndex) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {date}
                      </span>
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  <div className="space-y-4">
                    {groupedMessages[date].map((message, messageIndex) => {
                      const userType = message.usertype || 'user';
                      const isAdmin = userType === 'admin';
                      const isTicket = message.id === 'ticket';
                      
                      return (
                        <div key={message.id || messageIndex} className={`flex ${isAdmin ? 'flex-row-reverse' : ''}`}>
                          <div className={`${isAdmin ? 'text-right' : ''}`}>
                            <div className={`inline-block text-sm text-gray-700 dark:text-gray-300 p-4 rounded-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
                              isAdmin 
                                ? "bg-green-50 dark:bg-green-900/30" 
                                : "bg-gray-50 dark:bg-gray-700"
                            }`}>
                              {message.message}
                              {/* Show uploaded image if present */}
                              {message.file && (
                                <div className="mt-3">
                                  <img 
                                    src={`https://hyre.hyrelancer.com/${message.file}`}
                                    alt="Uploaded file"
                                    className="max-w-80 max-h-80 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handleImageClick(`https://hyre.hyrelancer.com/${message.file}`)}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
          
          {/* Reply form */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            {ticket.status === 'closed' ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Ticket Closed</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This ticket has been closed. You cannot send new replies.
                  </p>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;