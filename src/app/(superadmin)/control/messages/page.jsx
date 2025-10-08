"use client";
import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdMessage, 
  MdPerson, 
  MdBusiness,
  MdRefresh,
  MdFilterList
} from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import adminApi from '@/config/adminApi';
// import AdminMessageViewer from '../components/AdminMessageViewer';

export default function AdminMessagesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [showMessageViewer, setShowMessageViewer] = useState(false);
  // const [selectedUserForMessages, setSelectedUserForMessages] = useState(null);

  // Get authentication data from Redux store
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const authToken = token;

  // Get auth token 
  const getAuthToken = () => {
    if (!authToken) {
      console.error('No authentication token found');
      return null;
    }
    return authToken;
  };

  // Format timestamp for inbox list
  const formatInboxTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Fetch all users with recent messages for admin overview
  const fetchAllUsersWithMessages = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('Cannot fetch users: No authentication token');
        return;
      }

      // This would need to be a new admin API endpoint that returns all users with their recent message activity
      // For now, we'll simulate this with the existing inbox API
      const response = await adminApi.get('/UserChatInbox/all');
      const data = response.data;
      console.log('Admin All Users API Response:', data);
      
      if (data.status && data.data && Array.isArray(data.data)) {
        const userMap = new Map();
        
        data.data.forEach(chat => {
          // Get both sender and receiver
          const sender = chat.sender;
          const receiver = chat.receiver;
          
          // Add sender to map
          if (!userMap.has(sender.id) || new Date(chat.created_at) > new Date(userMap.get(sender.id).latestMessageTime)) {
            userMap.set(sender.id, {
              id: sender.id,
              name: sender.name,
              lastMessage: chat.uc_message,
              timestamp: chat.created_at,
              latestMessageTime: chat.created_at,
              avatar: sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sender.name)}&background=random`,
              userType: sender.user_type || 'User',
              email: sender.email,
              unreadCount: chat.is_read === 0 ? 1 : 0,
              online: Math.random() > 0.7
            });
          }
          
          // Add receiver to map
          if (!userMap.has(receiver.id) || new Date(chat.created_at) > new Date(userMap.get(receiver.id).latestMessageTime)) {
            userMap.set(receiver.id, {
              id: receiver.id,
              name: receiver.name,
              lastMessage: chat.uc_message,
              timestamp: chat.created_at,
              latestMessageTime: chat.created_at,
              avatar: receiver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.name)}&background=random`,
              userType: receiver.user_type || 'User',
              email: receiver.email,
              unreadCount: chat.is_read === 0 ? 1 : 0,
              online: Math.random() > 0.7
            });
          }
        });
        
        // Convert map to array and sort by latest message time
        const transformedUsers = Array.from(userMap.values())
          .sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime))
          .map(user => ({
            ...user,
            timestamp: formatInboxTimestamp(user.timestamp)
          }));
        
        setUsers(transformedUsers);
      }
    } catch (error) {
      console.error('Error fetching all users with messages:', error);
      // Fallback: show empty state
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle message viewer - now navigates to page
  const handleViewMessages = (user) => {
    router.push(`/control/message-viewer/${user.id}`);
  };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group users by type
  const freelancers = filteredUsers.filter(user => user.userType.toLowerCase().includes('freelancer'));
  const customers = filteredUsers.filter(user => user.userType.toLowerCase().includes('customer'));

  useEffect(() => {
    fetchAllUsersWithMessages();
  }, []);

  if (!isAuthenticated || !user || !authToken) {
    return (
      <div className="p-6 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Message Management</h1>
            <p className="mt-1 text-slate-600">Monitor conversations between freelancers and customers</p>
          </div>
          <button
            onClick={fetchAllUsersWithMessages}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MdRefresh size={20} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Users</p>
              <p className="text-2xl font-bold text-slate-800">{users.length}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg">
              <MdMessage className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Freelancers</p>
              <p className="text-2xl font-bold text-green-600">{freelancers.length}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg">
              <MdPerson className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Customers</p>
              <p className="text-2xl font-bold text-purple-600">{customers.length}</p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-purple-100 rounded-lg">
              <MdBusiness className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border shadow-sm border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Users with Recent Messages</h2>
          <p className="text-sm text-slate-600">Click on any user to view their conversations</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 border-slate-200">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">User</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Type</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Last Message</th>
                <th className="px-6 py-3 text-sm font-semibold text-left text-gray-700">Time</th>
                <th className="px-6 py-3 text-sm font-semibold text-right text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                            }}
                          />
                          {user.online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.userType.toLowerCase().includes('freelancer') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {user.userType.toLowerCase().includes('freelancer') ? (
                          <MdPerson size={12} />
                        ) : (
                          <MdBusiness size={12} />
                        )}
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-800 truncate max-w-xs">{user.lastMessage}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500">{user.timestamp}</span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleViewMessages(user)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <MdMessage size={16} />
                        View Messages
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-slate-100">
                      <MdMessage className="text-slate-400" size={24} />
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-slate-800">No users found</h3>
                    <p className="text-slate-600">Try adjusting your search criteria or refresh the data.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Viewer Modal - Now using page navigation instead */}
    </div>
  );
}
