// app/support-tickets/[id]/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TicketDetailPage from "../components/TicketDetailPage";

// Mock data with enhanced conversation history
const initialTickets = [
  {
    id: 1,
    category: "Technical Issue",
    customer: "John Doe",
    customerId: "user-123",
    customerEmail: "john@example.com",
    agent: "Support Agent 1",
    status: "In Progress",
    subject: "Cannot login to dashboard",
    description: "I've been trying to login to my dashboard for the past hour but keep getting an error message.",
    priority: "High",
    createdAt: "2023-10-15T14:30:00Z",
    updatedAt: "2023-10-16T09:45:00Z",
    replies: [
      {
        id: 1,
        user: "John Doe",
        message: "I'm still having this issue. Any updates?",
        timestamp: "2023-10-15T16:00:00Z"
      },
      {
        id: 2,
        user: "Support Agent 1",
        message: "Hi John, I'm looking into your login issue. Can you tell me what error message you're seeing exactly?",
        timestamp: "2023-10-15T16:30:00Z"
      },
      {
        id: 3,
        user: "John Doe",
        message: "It says 'Invalid credentials' but I'm sure I'm using the right password.",
        timestamp: "2023-10-16T08:15:00Z"
      },
      {
        id: 4,
        user: "Support Agent 1",
        message: "Thanks for the info. I can see your account is locked due to multiple failed attempts. I've unlocked it now - can you try again?",
        timestamp: "2023-10-16T09:30:00Z"
      },
      {
        id: 5,
        user: "John Doe",
        message: "That worked! Thank you for your help.",
        timestamp: "2023-10-16T09:45:00Z"
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
      },
      {
        id: 2,
        user: "Jane Smith",
        message: "Thank you. When can I expect an update?",
        timestamp: "2023-10-15T09:20:00Z"
      },
      {
        id: 3,
        user: "Support Agent 2",
        message: "Our billing team will review it within 24 hours and get back to you.",
        timestamp: "2023-10-15T14:30:00Z"
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
      },
      {
        id: 3,
        user: "Support Agent 3",
        message: "We'll notify you when this feature is released. Is there anything else we can help with?",
        timestamp: "2023-10-11T15:10:00Z"
      },
      {
        id: 4,
        user: "Robert Johnson",
        message: "No, that's all. Thanks again!",
        timestamp: "2023-10-11T15:45:00Z"
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
    replies: [
      {
        id: 1,
        user: "Support Agent 1",
        message: "Hi Sarah, we're looking into this upload issue. Can you tell us what type of files you're trying to upload?",
        timestamp: "2023-10-16T09:15:00Z"
      },
      {
        id: 2,
        user: "Sarah Williams",
        message: "I'm trying to upload PDF documents, around 5MB each.",
        timestamp: "2023-10-16T10:30:00Z"
      }
    ]
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

const TicketDetail = () => {
  const params = useParams();
  const ticketId = parseInt(params.id);
  const [ticket, setTicket] = useState(null);
  const [allTickets, setAllTickets] = useState(initialTickets);

  useEffect(() => {
    const foundTicket = allTickets.find(t => t.id === ticketId);
    setTicket(foundTicket);
  }, [ticketId, allTickets]);

  const handleStatusChange = (ticketId, newStatus) => {
    setAllTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId ? { 
          ...ticket, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        } : ticket
      )
    );
    
    if (ticket && ticket.id === ticketId) {
      setTicket({
        ...ticket,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleAssignAgent = (ticketId, agentName) => {
    setAllTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId ? { 
          ...ticket, 
          agent: agentName,
          updatedAt: new Date().toISOString()
        } : ticket
      )
    );
    
    if (ticket && ticket.id === ticketId) {
      setTicket({
        ...ticket,
        agent: agentName,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleReply = (ticketId, message) => {
    const newReply = {
      id: ticket.replies.length + 1,
      user: "You",
      message: message,
      timestamp: new Date().toISOString()
    };
    
    setAllTickets(prevTickets => 
      prevTickets.map(t => 
        t.id === ticketId ? { 
          ...t, 
          replies: [...t.replies, newReply],
          updatedAt: new Date().toISOString()
        } : t
      )
    );
    
    if (ticket && ticket.id === ticketId) {
      setTicket({
        ...ticket,
        replies: [...ticket.replies, newReply],
        updatedAt: new Date().toISOString()
      });
    }
  };

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
      onAssignAgent={handleAssignAgent}
      onReply={handleReply}
    />
  );
};

export default TicketDetail;