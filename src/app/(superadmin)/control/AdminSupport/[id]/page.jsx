// app/support-tickets/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TicketDetailPage from "../components/TicketDetailPage";
import adminApi from "@/config/adminApi";

const TicketDetail = () => {
  const params = useParams();
  const ticketId = params.id; // Keep as string since API uses base64 encoded IDs
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the URL-encoded ticket ID directly for API call
        const response = await adminApi.get(`http://localhost:8000/api/admin/tickets/${ticketId}/replies`);
        
        if (response.data && response.data.status && response.data.ticket) {
          // Transform API response to match component expectations
          const transformedTicket = {
            id: response.data.ticket.id,
            ticket_code: response.data.ticket.ticket_code,
            user_id: response.data.ticket.user_id,
            usertype: response.data.ticket.usertype,
            subject: response.data.ticket.subject,
            message: response.data.ticket.message,
            priority: response.data.ticket.priority,
            status: response.data.ticket.status,
            closed_by: response.data.ticket.closed_by,
            file: response.data.ticket.file,
            created_at: response.data.ticket.created_at,
            updated_at: response.data.ticket.updated_at,
            user: response.data.ticket.user || null, // Include user data if available
            replies: response.data.replies.map(reply => ({
              id: reply.id,
              user: reply.usertype === 'superadmin' ? 'Admin' : `User ${reply.user_id}`,
              message: reply.message,
              timestamp: reply.created_at,
              file: reply.file
            }))
          };
          setTicket(transformedTicket);
        }
      } catch (err) {
        console.error('Error fetching ticket details:', err);
        setError('Failed to fetch ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      // Use the URL-encoded ticket ID directly for API call
      console.log('Closing ticket with encoded ID:', ticketId);
      
      const response = await adminApi.post(`http://localhost:8000/api/admin/support/ticket/close/${ticketId}`, { status: newStatus });
      console.log('Close ticket response:', response.data);
      
      // Update local state
      if (ticket) {
        setTicket({
          ...ticket,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
      
      // Show success message
      alert('Ticket closed successfully!');
      
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError('Failed to update ticket status. Please try again.');
      alert('Failed to close ticket. Please try again.');
    }
  };

  const handleReply = async (ticketId, message) => {
    try {
      // Use the URL-encoded ticket ID directly for API call
      await adminApi.post(`http://localhost:8000/api/admin/tickets/${ticketId}/reply`, { message });
      
      // Refresh ticket data to get updated replies
      const response = await adminApi.get(`http://localhost:8000/api/admin/tickets/${ticketId}/replies`);
      if (response.data && response.data.status && response.data.ticket) {
        const transformedTicket = {
          id: response.data.ticket.id,
          ticket_code: response.data.ticket.ticket_code,
          user_id: response.data.ticket.user_id,
          usertype: response.data.ticket.usertype,
          subject: response.data.ticket.subject,
          message: response.data.ticket.message,
          priority: response.data.ticket.priority,
          status: response.data.ticket.status,
          closed_by: response.data.ticket.closed_by,
          file: response.data.ticket.file,
          created_at: response.data.ticket.created_at,
          updated_at: response.data.ticket.updated_at,
          user: response.data.ticket.user || null, // Include user data if available
          replies: response.data.replies.map(reply => ({
            id: reply.id,
            user: reply.usertype === 'superadmin' ? 'Admin' : `User ${reply.user_id}`,
            message: reply.message,
            timestamp: reply.created_at,
            file: reply.file
          }))
        };
        setTicket(transformedTicket);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error</h3>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket not found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">The requested ticket does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <TicketDetailPage
      ticket={ticket}
      onStatusChange={handleStatusChange}
      onReply={handleReply}
      encodedTicketId={ticketId}
    />
  );
};

export default TicketDetail;