"use client";
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Search, ArrowLeft, Eye } from 'lucide-react';

export default function AdminMessageViewer({ userId, userName, userType, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const messagesEndRef = useRef(null);
    const refreshIntervalRef = useRef(null);

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

    // Format time for individual messages
    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Fetch inbox (users list) for admin - using admin API
    const fetchInbox = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('Cannot fetch inbox: No authentication token');
                return;
            }

            console.log('Fetching inbox for userId:', userId);
            const response = await fetch(`https://backend.hyrelancer.in/api/admin/UserChatInbox/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Admin Inbox API Response:', data);
            
            if (data.status && data.data && Array.isArray(data.data)) {
                const userMap = new Map();
                
                data.data.forEach(chat => {
                    // Determine the other user (not the current user)
                    const otherUser = chat.uc_sender_id === userId ? chat.receiver : chat.sender;
                    const otherUserId = otherUser.id;
                    
                    // If user doesn't exist in map or this message is newer, update the user
                    if (!userMap.has(otherUserId) || new Date(chat.created_at) > new Date(userMap.get(otherUserId).latestMessageTime)) {
                        userMap.set(otherUserId, {
                            id: otherUser.id,
                            name: otherUser.name,
                            lastMessage: chat.uc_message,
                            timestamp: chat.created_at,
                            latestMessageTime: chat.created_at,
                            avatar: otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`,
                            unreadCount: chat.is_read === 0 && chat.uc_sender_id !== userId ? 1 : 0,
                            online: Math.random() > 0.7, // Random online status for demo
                            userType: otherUser.user_type || 'User',
                            email: otherUser.email
                        });
                    } else {
                        // If user exists, only update unread count if needed
                        const existingUser = userMap.get(otherUserId);
                        if (chat.is_read === 0 && chat.uc_sender_id !== userId) {
                            existingUser.unreadCount += 1;
                        }
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
                
                // Auto-select first user if none selected and we have users
                if (transformedUsers.length > 0 && !selectedUser) {
                    setSelectedUser(transformedUsers[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching admin inbox:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Fetch conversation with a specific user for admin
    const fetchConversation = async (otherUserId, showLoading = false) => {
        if (!otherUserId) return;
        
        if (showLoading) setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('Cannot fetch conversation: No authentication token');
                return;
            }

            const response = await fetch(`https://backend.hyrelancer.in/api/admin/UserChatConversation/${otherUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Admin Conversation API Response:', data);
            
            if (data.status && data.data && Array.isArray(data.data)) {
                const transformedMessages = data.data.map(msg => ({
                    id: msg.uc_id,
                    text: msg.uc_message,
                    sender: msg.uc_sender_id === userId ? 'target_user' : 'other_user',
                    senderId: msg.uc_sender_id,
                    timestamp: formatMessageTime(msg.created_at),
                    rawTimestamp: msg.created_at,
                    isRead: msg.is_read
                }));
                
                // Sort messages by creation time (ascending)
                transformedMessages.sort((a, b) => new Date(a.rawTimestamp) - new Date(b.rawTimestamp));
                
                setMessages(prev => ({
                    ...prev,
                    [otherUserId]: transformedMessages
                }));
            }
        } catch (error) {
            console.error('Error fetching admin conversation:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        if (!messages || messages.length === 0) return {};
        
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.rawTimestamp);
            const dateKey = date.toDateString();
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });
        
        return groups;
    };

    // Format date header
    const formatDateHeader = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        }
    };

    // Setup auto-refresh (every 15 seconds)
    useEffect(() => {
        // Only fetch if we have authentication and userId
        if (isAuthenticated && authToken && userId) {
            console.log('useEffect: Starting to fetch inbox for userId:', userId);
            fetchInbox(true);

            // Setup auto-refresh interval
            refreshIntervalRef.current = setInterval(() => {
                fetchInbox(false); // Don't show loading for auto-refresh
                if (selectedUser) {
                    fetchConversation(selectedUser, false);
                }
            }, 15000); // 15 seconds
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [userId, isAuthenticated, authToken]);

    // Fetch conversation when user is selected
    useEffect(() => {
        if (selectedUser) {
            fetchConversation(selectedUser, true);
        }
    }, [selectedUser]);

    // Refresh current conversation more frequently
    useEffect(() => {
        let conversationInterval;
        
        if (selectedUser) {
            conversationInterval = setInterval(() => {
                fetchConversation(selectedUser, false);
            }, 5000); // Check for new messages every 5 seconds for active conversation
        }

        return () => {
            if (conversationInterval) {
                clearInterval(conversationInterval);
            }
        };
    }, [selectedUser]);

    const selectedUserData = users.find(user => user.id === selectedUser);
    const currentMessages = messages[selectedUser] || [];
    const groupedMessages = groupMessagesByDate(currentMessages);
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Debug authentication state
    console.log('AdminMessageViewer Auth State:', {
        isAuthenticated,
        user: user ? 'exists' : 'missing',
        authToken: authToken ? 'exists' : 'missing',
        userId
    });

    // Show loading if not authenticated or missing user data
    if (!isAuthenticated || !authToken) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading authentication...</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Auth: {isAuthenticated ? 'Yes' : 'No'} | 
                            Token: {authToken ? 'Yes' : 'No'} |
                            UserId: {userId}
                        </p>
                        <button 
                            onClick={() => {
                                console.log('Manual retry - Auth state:', { isAuthenticated, authToken, userId });
                                if (userId) {
                                    fetchInbox(true);
                                }
                            }}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-blue-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-blue-200 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-blue-600" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Message Viewer</h2>
                                <p className="text-sm text-blue-600">
                                    Viewing messages for: <span className="font-medium">{userName}</span> ({userType})
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Eye className="w-5 h-5 text-blue-600" />
                            <span className="text-sm text-gray-600">Admin View Only</span>
                        </div>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Users Sidebar */}
                    <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 xl:w-1/4 bg-slate-50 border-r border-slate-200 flex-col`}>
                        {/* Search Header */}
                        <div className="flex-shrink-0 p-3 bg-slate-100 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm border border-slate-300"
                                />
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading && users.length === 0 ? (
                                <div className="flex justify-center items-center p-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user.id)}
                                        className={`flex items-center p-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100 transition-colors ${
                                            selectedUser === user.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        }`}
                                    >
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
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-slate-900 truncate">
                                                    {user.name}
                                                </h3>
                                                <span className="text-xs text-slate-500 ml-1">{user.timestamp}</span>
                                            </div>
                                            <p className="text-xs text-blue-500 truncate">
                                                {user.userType}
                                            </p>
                                            <p className="text-xs text-gray-600 truncate mt-1">
                                                {user.lastMessage}
                                            </p>
                                        </div>
                                        {user.unreadCount > 0 && (
                                            <div className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                                {user.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col justify-center items-center p-8 text-slate-500">
                                    <p className="mb-2 text-sm">No conversations found</p>
                                    {users.length === 0 && !loading && (
                                        <button 
                                            onClick={() => fetchInbox(true)}
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            Retry Loading
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${selectedUser ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white`}>
                        {selectedUserData ? (
                            <>
                                {/* Chat Header */}
                                <div className="flex-shrink-0 bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-blue-100">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="lg:hidden p-2 hover:bg-blue-200 rounded-full transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={selectedUserData.avatar}
                                                alt={selectedUserData.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserData.name)}&background=random`;
                                                }}
                                            />
                                            {selectedUserData.online && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white"></div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-base font-semibold text-gray-800 truncate">{selectedUserData.name}</h2>
                                            <p className="text-sm text-blue-600 truncate">
                                                {selectedUserData.userType} 
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                    {loading && currentMessages.length === 0 ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : currentMessages.length === 0 ? (
                                        <div className="flex flex-col justify-center items-center h-full text-gray-500 p-4">
                                            <p className="mb-4 text-base text-center">No messages in this conversation</p>
                                            <button 
                                                onClick={() => fetchConversation(selectedUser, true)}
                                                className="text-blue-500 hover:text-blue-700 text-sm"
                                            >
                                                Refresh Conversation
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                                                <div key={dateKey}>
                                                    {/* Date Header */}
                                                    <div className="flex justify-center mb-4">
                                                        <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700 font-medium">
                                                            {formatDateHeader(dateKey)}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Messages for this date */}
                                                    <div className="space-y-3">
                                                        {dateMessages.map((msg) => (
                                                            <div
                                                                key={msg.id}
                                                                className={`flex ${msg.sender === 'target_user' ? 'justify-end' : 'justify-start'}`}
                                                            >
                                                                <div className={`max-w-[70%] ${msg.sender === 'target_user' ? 'ml-auto' : 'mr-auto'}`}>
                                                                    <div
                                                                        className={`px-4 py-2 rounded-2xl shadow-sm relative ${
                                                                            msg.sender === 'target_user'
                                                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                                                : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                                                                        }`}
                                                                    >
                                                                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                                                        <div className={`flex items-center justify-between mt-1 ${
                                                                            msg.sender === 'target_user' ? 'text-blue-100' : 'text-gray-500'
                                                                        }`}>
                                                                            <span className="text-xs">
                                                                                {msg.timestamp}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Admin Notice */}
                                <div className="flex-shrink-0 bg-yellow-50 border-t border-yellow-200 p-3">
                                    <div className="flex items-center justify-center text-yellow-800">
                                        <Eye className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-medium">Admin View Only - Messages cannot be sent from this view</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // No user selected state
                            <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                                <div className="text-center text-gray-500">
                                    <h3 className="text-lg font-medium mb-2">Admin Message Viewer</h3>
                                    <p className="text-sm">Select a conversation to view messages</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
