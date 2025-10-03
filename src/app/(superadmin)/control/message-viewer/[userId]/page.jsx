"use client";
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Search, ArrowLeft, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import adminApi from '@/config/adminApi';

export default function AdminMessageViewerPage({ params }) {
    const router = useRouter();
    const userId = Number(params.userId);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [targetUserName, setTargetUserName] = useState('');
    const messagesEndRef = useRef(null);
    const refreshIntervalRef = useRef(null);
    const didInitialAutoSelectRef = useRef(false);

    // Get admin authentication data from Redux store
    const { user, token, isAuthenticated } = useSelector((state) => state.admin);
    const authToken = token;

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

    // Helper: truncate message preview
    const truncatePreview = (text, max = 80) => {
        if (!text) return "";
        const clean = String(text).trim();
        return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
    };

    // Fetch inbox (users list) for admin - using admin API
    const fetchInbox = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            setError("");
            console.log('Fetching inbox for userId:', userId);
            const response = await adminApi.get(`/UserChatInbox/${userId}`);
            const data = response.data;
            console.log('Admin Inbox API Response:', data);
            
            // Treat data.data as a map of conversationId -> messages[]
            if (data?.status === true && data?.data && typeof data.data === 'object') {
                const conversationMap = data.data;
                const rows = [];

                // Attempt to set target user name (the inspected user whose conversations we're viewing)
                if (!targetUserName) {
                    // Scan first available message to infer target name
                    for (const key of Object.keys(conversationMap)) {
                        const arr = Array.isArray(conversationMap[key]) ? conversationMap[key] : [];
                        const first = arr[0];
                        if (first?.sender?.id === userId) {
                            setTargetUserName(first.sender?.name || "");
                            break;
                        } else if (first?.receiver?.id === userId) {
                            setTargetUserName(first.receiver?.name || "");
                            break;
                        }
                    }
                }

                Object.values(conversationMap).forEach((messageArrayRaw) => {
                    const messageArray = Array.isArray(messageArrayRaw) ? messageArrayRaw : [];
                    if (messageArray.length === 0) return;

                    // Dedupe by uc_id in case of duplicates
                    const seen = new Set();
                    const deduped = [];
                    for (const m of messageArray) {
                        if (!seen.has(m.uc_id)) {
                            seen.add(m.uc_id);
                            deduped.push(m);
                        }
                    }

                    // Find latest message by created_at
                    const latest = deduped.reduce((acc, cur) => (
                        !acc || new Date(cur.created_at) > new Date(acc.created_at) ? cur : acc
                    ), null);
                    if (!latest) return;

                    // Identify counterpart (other user id)
                    const isMeSender = Number(latest.uc_sender_id) === Number(userId);
                    const counterpartUser = isMeSender ? latest.receiver : latest.sender;
                    const counterpartId = counterpartUser?.id;
                    const counterpartName = counterpartUser?.name || 'User';
                    const avatar = counterpartUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(counterpartName)}&background=random`;
                    const userType = counterpartUser?.user_type || 'User';

                    // Unread count: messages where is_read === 0 and I am the receiver
                    const unreadCount = deduped.filter((m) => Number(m.is_read) === 0 && Number(m.uc_receiver_id) === Number(userId)).length;

                    // Preview string (no prefix to match acceptance criteria)
                    const preview = truncatePreview(latest.uc_message || '', 80);

                    rows.push({
                        id: counterpartId,
                        name: counterpartName,
                        lastMessage: preview,
                        timestamp: latest.created_at, // raw for sorting; we'll format for display below
                        latestMessageTime: latest.created_at,
                        avatar,
                        userType,
                        email: counterpartUser?.email || '',
                        unreadCount,
                    });
                });

                // Sort by lastActivity (latestMessageTime) desc and map display timestamp
                const transformedUsers = rows
                    .sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime))
                    .map((u) => ({
                        ...u,
                        timestamp: formatInboxTimestamp(u.timestamp),
                    }));

                setUsers(transformedUsers);

                if (transformedUsers.length > 0 && !selectedUser && !didInitialAutoSelectRef.current) {
                    setSelectedUser(transformedUsers[0].id);
                    didInitialAutoSelectRef.current = true;
                }
            } else {
                // Treat as empty inbox
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching admin inbox:', error);
            setError('Failed to load inbox. Please try again.');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Fetch conversation with a specific user for admin
    const fetchConversation = async (otherUserId, showLoading = false) => {
        if (!otherUserId) return;
        
        if (showLoading) setLoading(true);
        try {
            // New endpoint format requires sender (opened message user) and receiver id
            const response = await adminApi.get(`/UserChatConversation/${userId}/${otherUserId}`);
            const data = response.data;
            console.log('Admin Conversation API Response:', data);
            
            if (data.status && data.data && Array.isArray(data.data)) {
                const transformedMessages = data.data.map(msg => ({
                    id: msg.uc_id,
                    text: msg.uc_message,
                    sender: msg.uc_sender_id === userId ? 'target_user' : 'other_user',
                    senderId: msg.uc_sender_id,
                    senderName: msg.uc_sender_id === userId ? targetUserName : 'Other User',
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

    // Auto-scroll to bottom on message updates or when switching conversations
    useEffect(() => {
        try {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        } catch (e) {
            // no-op
        }
    }, [selectedUser, messages[selectedUser]?.length]);

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
            // Initial load: allow auto-select
            fetchInbox(true);

            // Setup auto-refresh interval
            refreshIntervalRef.current = setInterval(() => {
                // Refresh without changing selection
                fetchInbox(false);
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

    // Clear unread badge locally when conversation is opened
    useEffect(() => {
        if (!selectedUser) return;
        setUsers(prev => prev.map(u => u.id === selectedUser ? { ...u, unreadCount: 0 } : u));
    }, [selectedUser]);

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
            <div className="p-6 min-h-screen flex justify-center items-center">
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
        );
    }

    return (
        <div className="p-6 min-h-screen bg-slate-50">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-blue-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Message Viewer</h1>
                        <p className="text-sm text-blue-600">
                            {targetUserName ? `Viewing messages for ${targetUserName}` : 'Loading user information...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
                <div className="flex h-[calc(100vh-200px)] flex-col lg:flex-row">
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
                            {error && (
                                <div className="px-4 py-2 text-red-600 text-sm flex items-center justify-between bg-red-50 border-b border-red-200">
                                    <span>{error}</span>
                                    <button onClick={() => fetchInbox(true)} className="text-red-700 underline">Retry</button>
                                </div>
                            )}
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
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-slate-900 truncate">
                                                    {user.name}
                                                </h3>
                                                <div className="flex items-center space-x-2 ml-1">
                                                    <span className="text-xs text-slate-500">{user.timestamp}</span>
                                                    {user.unreadCount > 0 && (
                                                        <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold">
                                                            {user.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-blue-500 truncate">
                                                {user.userType}
                                            </p>
                                            <p className="text-xs text-gray-600 truncate mt-1">
                                                {user.lastMessage}
                                            </p>
                                        </div>
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
                                                                    <div className="mb-1">
                                                                        <span className={`text-xs font-medium ${
                                                                            msg.sender === 'target_user' ? 'text-blue-600' : 'text-gray-600'
                                                                        }`}>
                                                                            {msg.sender === 'target_user' ? targetUserName : selectedUserData?.name}
                                                                        </span>
                                                                    </div>
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
