"use client";
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Send, Paperclip, Smile, MoreVertical, Search, Phone, Video } from 'lucide-react';

export default function MessageBox() {
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const refreshIntervalRef = useRef(null);
    const lastMessageIds = useRef({});

    // Get authentication data from Redux store
    const { user, token, isAuthenticated } = useSelector((state) => state.auth);
    const currentUserId = user?.id;
    const authToken = token;

    // Prefilled message templates
    const prefilledMessages = [
        {
            category: "Greetings",
            messages: [
                "Hello! How are you doing today?",
                "Hi there! Hope you're having a great day!",
                "Good morning! How can I help you?",
                "Hello! Nice to meet you!"
            ]
        },
        {
            category: "Project Related",
            messages: [
                "I'm interested in working on this project. Can we discuss the details?",
                "I have experience with this type of work. Would you like to see my portfolio?",
                "I can start working on this project immediately. What's the timeline?",
                "I'd love to help with this project. Let me know your requirements."
            ]
        },
        {
            category: "Contact & Communication",
            messages: [
                "What's the best way to contact you for project updates?",
                "I'm available for a call to discuss the project in detail.",
                "Please let me know your preferred communication method.",
                "I'm flexible with meeting times. When works best for you?"
            ]
        },
        {
            category: "Availability",
            messages: [
                "I'm available to start working on this project right away.",
                "I can dedicate 20-30 hours per week to this project.",
                "I'm flexible with deadlines. What's your preferred timeline?",
                "I'm available for both short-term and long-term projects."
            ]
        },
        {
            category: "Pricing & Budget",
            messages: [
                "What's your budget range for this project?",
                "I can work within your budget. Let's discuss the scope.",
                "I offer competitive rates. Would you like a detailed quote?",
                "I'm open to negotiating the price based on project requirements."
            ]
        }
    ];

    // Simple quick messages like in the image
    const quickMessages = [
        "Hello! How are you?",
        "Are you available for a project?",
        "What's your rate?",
        "I'm interested in your services >"
    ];


    // Get auth token 
    const getAuthToken = () => {
        if (!authToken) {
            console.error('No authentication token found');
            return null;
        }
        return authToken;
    };

    const getCurrentUserId = () => {
        if (!currentUserId) {
            console.error('No current user ID found');
            return null;
        }
        return currentUserId;
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

    // Fetch inbox (users list) with auto-refresh
    const fetchInbox = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('Cannot fetch inbox: No authentication token');
                return;
            }

            const response = await fetch('https://test.hyrelancer.in/api/inbox', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Inbox API Response:', data); // Debug log
            
            if (data.status && data.data && Array.isArray(data.data)) {
                const userMap = new Map();
                const currentUserId = getCurrentUserId();
                
                data.data.forEach(chat => {
                    // Determine the other user (not the current user)
                    const otherUser = chat.uc_sender_id === currentUserId ? chat.receiver : chat.sender;
                    const userId = otherUser.id;
                    
                    // If user doesn't exist in map or this message is newer, update the user
                    if (!userMap.has(userId) || new Date(chat.created_at) > new Date(userMap.get(userId).latestMessageTime)) {
                        userMap.set(userId, {
                            id: otherUser.id,
                            name: otherUser.name,
                            lastMessage: chat.uc_message,
                            timestamp: chat.created_at,
                            latestMessageTime: chat.created_at,
                            avatar: otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`,
                            unreadCount: chat.is_read === 0 && chat.uc_sender_id !== currentUserId ? 1 : 0,
                            online: Math.random() > 0.7, // Random online status for demo
                            userType: otherUser.user_type || 'User',
                            email: otherUser.email
                        });
                    } else {
                        // If user exists, only update unread count if needed
                        const existingUser = userMap.get(userId);
                        if (chat.is_read === 0 && chat.uc_sender_id !== currentUserId) {
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
            console.error('Error fetching inbox:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Fetch conversation with a specific user
    const fetchConversation = async (userId, showLoading = false) => {
        if (!userId) return;
        
        if (showLoading) setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                console.error('Cannot fetch conversation: No authentication token');
                return;
            }

            const response = await fetch(`https://test.hyrelancer.in/api/conversation/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Conversation API Response:', data); // Debug log
            
            if (data.status && data.data && Array.isArray(data.data)) {
                const currentUserId = getCurrentUserId();
                
                const transformedMessages = data.data.map(msg => ({
                    id: msg.uc_id,
                    text: msg.uc_message,
                    sender: msg.uc_sender_id === currentUserId ? 'me' : 'other',
                    timestamp: formatMessageTime(msg.created_at),
                    rawTimestamp: msg.created_at,
                    isRead: msg.is_read
                }));
                
                // Sort messages by creation time (ascending)
                transformedMessages.sort((a, b) => new Date(a.rawTimestamp) - new Date(b.rawTimestamp));
                
                // Check if we have new messages
                const lastKnownMessageId = lastMessageIds.current[userId] || 0;
                const newestMessageId = transformedMessages.length > 0 ? 
                    Math.max(...transformedMessages.map(m => m.id)) : 0;
                
                if (newestMessageId > lastKnownMessageId) {
                    lastMessageIds.current[userId] = newestMessageId;
                }
                
                setMessages(prev => ({
                    ...prev,
                    [userId]: transformedMessages
                }));
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Send message
    const sendMessage = async (receiverId, messageText) => {
        if (!messageText.trim()) return;
        
        const token = getAuthToken();
        if (!token) {
            console.error('Cannot send message: No authentication token');
            return false;
        }
        
        // Optimistically add message to UI immediately
        const tempMessage = {
            id: `temp-${Date.now()}`,
            text: messageText,
            sender: 'me',
            timestamp: formatMessageTime(new Date()),
            rawTimestamp: new Date().toISOString(),
            isRead: 0,
            sending: true
        };

        setMessages(prev => ({
            ...prev,
            [receiverId]: [...(prev[receiverId] || []), tempMessage]
        }));
        
        try {
            const response = await fetch('https://test.hyrelancer.in/api/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiver_id: receiverId,
                    message: messageText
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Send Message API Response:', data); // Debug log
            
            if (data.status && data.data) {
                // Replace optimistic message with real message from server
                const realMessage = {
                    id: data.data.uc_id,
                    text: messageText,
                    sender: 'me',
                    timestamp: formatMessageTime(data.data.created_at),
                    rawTimestamp: data.data.created_at,
                    isRead: data.data.is_read,
                    sending: false
                };

                setMessages(prev => ({
                    ...prev,
                    [receiverId]: prev[receiverId].map(msg => 
                        msg.id === tempMessage.id ? realMessage : msg
                    )
                }));
                
                // Update last message ID
                lastMessageIds.current[receiverId] = data.data.uc_id;
                
                // Update the user's last message in the sidebar
                setUsers(prevUsers => {
                    return prevUsers.map(user => {
                        if (user.id === receiverId) {
                            return {
                                ...user,
                                lastMessage: messageText,
                                timestamp: formatInboxTimestamp(data.data.created_at),
                                latestMessageTime: data.data.created_at
                            };
                        }
                        return user;
                    }).sort((a, b) => new Date(b.latestMessageTime) - new Date(a.latestMessageTime));
                });
                
                return true;
            } else {
                // Remove optimistic message if send failed
                setMessages(prev => ({
                    ...prev,
                    [receiverId]: prev[receiverId].filter(msg => msg.id !== tempMessage.id)
                }));
                console.error('Failed to send message:', data);
                return false;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message if send failed
            setMessages(prev => ({
                ...prev,
                [receiverId]: prev[receiverId].filter(msg => msg.id !== tempMessage.id)
            }));
            return false;
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

    // Handle send message
    const handleSendMessage = async () => {
        if (!message.trim() || !selectedUser) return;
        
        const messageText = message.trim();
        setMessage('');
        await sendMessage(selectedUser, messageText);
    };

    // Handle prefilled message click
    const handlePrefilledMessage = (prefilledText) => {
        setMessage(prefilledText);
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle prefilled message selection
    const handlePrefilledMessageSelect = (messageText) => {
        setMessage(messageText);
    };

    // Auto-resize textarea
    const handleTextareaChange = (e) => {
        setMessage(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    // Setup auto-refresh (every 15 seconds)
    useEffect(() => {
        // Initial load
        fetchInbox(true);

        // Setup auto-refresh interval
        refreshIntervalRef.current = setInterval(() => {
            fetchInbox(false); // Don't show loading for auto-refresh
            if (selectedUser) {
                fetchConversation(selectedUser, false);
            }
        }, 15000); // 15 seconds

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

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

    // Show loading if not authenticated or missing user data
    if (!isAuthenticated || !user || !currentUserId || !authToken) {
        return (
            <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Messages</h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">Loading authentication...</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 mx-2 sm:mx-4 lg:mx-6" style={{ height: 'calc(100vh - 180px)' }}>
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-sm sm:text-base">Loading messages...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
            {/* Messages Header */}
            <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800">Messages</h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Welcome, {user?.name || 'User'}
                </p>
            </div>
        
            {/* Messages Container */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 mx-2 sm:mx-4 lg:mx-6" >
                <div className="flex h-full flex-col lg:flex-row">
                    {/* Users Sidebar */}
                    <div className={`${selectedUser ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 xl:w-1/4 bg-slate-50 border-r border-slate-200 flex-col`}>
                        {/* Search Header */}
                        <div className="flex-shrink-0 p-2 sm:p-3 bg-slate-100 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm border border-slate-300"
                                />
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading && users.length === 0 ? (
                                <div className="flex justify-center items-center p-3 sm:p-4">
                                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user.id)}
                                        className={`flex items-center p-2 sm:p-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100 transition-colors touch-manipulation ${selectedUser === user.id ? 'bg-blue-50 border-l-2 sm:border-l-4 border-l-blue-600' : ''
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                                }}
                                            />
                                            {user.online && (
                                                <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full ring-1 sm:ring-2 ring-white"></div>
                                            )}
                                        </div>
                                        <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                                                    {user.name}
                                                </h3>
                                                <span className="text-xs text-slate-500 ml-1">{user.timestamp}</span>
                                            </div>
                                          
                                            <p className="text-xs text-blue-500 truncate">
                                                {user.userType}
                                            </p>
                                        </div>
                                        {user.unreadCount > 0 && (
                                            <div className="ml-1 sm:ml-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
                                                {user.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col justify-center items-center p-4 sm:p-8 text-slate-500">
                                    <p className="mb-2 text-xs sm:text-sm">No conversations found</p>
                                    {users.length === 0 && !loading && (
                                        <button 
                                            onClick={() => fetchInbox(true)}
                                            className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm touch-manipulation"
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
                                <div className="flex-shrink-0 bg-blue-50 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-blue-100">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="lg:hidden p-1.5 sm:p-2 hover:bg-blue-200 rounded-full transition-colors touch-manipulation"
                                        >
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div className="relative flex-shrink-0">
                                            <img
                                                src={selectedUserData.avatar}
                                                alt={selectedUserData.name}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUserData.name)}&background=random`;
                                                }}
                                            />
                                            {selectedUserData.online && (
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full ring-1 sm:ring-2 ring-white"></div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">{selectedUserData.name}</h2>
                                            <p className="text-xs text-blue-600 truncate">
                                                {selectedUserData.userType} 
                                            </p>
                                        </div>
                                    </div>
                                   
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50">
                                    {loading && currentMessages.length === 0 ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : currentMessages.length === 0 ? (
                                        <div className="flex flex-col justify-center items-center h-full text-gray-500 p-4">
                                            <p className="mb-4 text-sm sm:text-base text-center">No messages yet. Start a conversation!</p>
                                            <button 
                                                onClick={() => fetchConversation(selectedUser, true)}
                                                className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm touch-manipulation"
                                            >
                                                Refresh Conversation
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 sm:space-y-4">
                                            {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                                                <div key={dateKey}>
                                                    {/* Date Header */}
                                                    <div className="flex justify-center mb-3 sm:mb-4">
                                                        <div className="bg-gray-200 px-2 sm:px-3 py-1 rounded-full text-xs text-gray-700 font-medium">
                                                            {formatDateHeader(dateKey)}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Messages for this date */}
                                                    <div className="space-y-2 sm:space-y-3">
                                                        {dateMessages.map((msg) => (
                                                            <div
                                                                key={msg.id}
                                                                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                                            >
                                                                <div className={`max-w-[85%] sm:max-w-[70%] ${msg.sender === 'me' ? 'ml-auto' : 'mr-auto'}`}>
                                                                    <div
                                                                        className={`px-3 sm:px-4 py-2 rounded-2xl shadow-sm relative ${msg.sender === 'me'
                                                                            ? 'bg-blue-500 text-white rounded-br-md'
                                                                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                                                                            }`}
                                                                    >
                                                                        <p className="text-xs sm:text-sm leading-relaxed break-words">{msg.text}</p>
                                                                        <div className={`flex items-center justify-between mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                            <span className="text-xs">
                                                                                {msg.timestamp}
                                                                            </span>
                                                                            {msg.sending && (
                                                                                <div className="ml-2">
                                                                                    <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b border-current"></div>
                                                                                </div>
                                                                            )}
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
                                    {/* Quick Message Suggestions - Show only when no messages exist */}
                                    {/* currentMessages.length === 30 && currentMessages.length < 20 && */}
                                { (
                                    <div className="flex-shrink-0 pt-16 sm:pt-20">
                                        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center px-2">
                                            {quickMessages.map((msg, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handlePrefilledMessageSelect(msg)}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-purple-300 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 shadow-sm touch-manipulation"
                                                >
                                                    {msg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </div>  

                                

                                {/* Message Input */}
                                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-2 sm:p-3">
                                    <div className="flex items-end space-x-1.5 sm:space-x-2">
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={message}
                                                onChange={handleTextareaChange}
                                                onKeyPress={handleKeyPress}
                                                placeholder={`Message ${selectedUserData.name}...`}
                                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all max-h-32 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm scrollbar-hide"
                                                rows={1}
                                                style={{ height: 'auto', overflow: 'hidden' }}
                                            />
                                        </div>

                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!message.trim() || !selectedUser}
                                            className="p-2 sm:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 touch-manipulation"
                                        >
                                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // No user selected state
                            <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                                <div className="text-center text-gray-500">
                                    <h3 className="text-base sm:text-lg font-medium mb-2">Welcome to Messages</h3>
                                    <p className="text-xs sm:text-sm">Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}