"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, Paperclip, Smile, MoreVertical, Phone, Video, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const EnhancedChatModal = ({
    isOpen,
    onClose,
    companyName = "PrimeEdge Solutions",
    location = "Las Vegas, USA",
    targetUserId = null,
    jobTitle = ""
}) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const refreshIntervalRef = useRef(null);
    const lastMessageId = useRef(0);

    // Get authentication data from Redux store
    const { user, token, isAuthenticated } = useSelector((state) => state.auth);
    const currentUserId = user?.id;
    const authToken = token;

    // Auth problem detection
    const authProblem = !isAuthenticated || !user || !currentUserId || !authToken;

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

    // Format time for individual messages
    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    // Fetch conversation with specific user - USING WORKING API ENDPOINT
    const fetchConversation = async (userId, showLoading = false) => {
        if (!userId) {
            setError('No user ID provided for conversation');
            return;
        }

        if (showLoading) setLoading(true);
        setError(null);
        
        try {
            const token = getAuthToken();
            if (!token) {
                setError('No authentication token found');
                return;
            }

            console.log('Fetching conversation for user:', userId);
            
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
            console.log('Conversation API Response:', data);

            if (data.status && data.data && Array.isArray(data.data)) {
                const currentUserId = getCurrentUserId();

                const transformedMessages = data.data.map(msg => ({
                    id: msg.uc_id,
                    text: msg.uc_message,
                    sender: msg.uc_sender_id === currentUserId ? 'me' : 'other',
                    timestamp: formatMessageTime(msg.created_at),
                    rawTimestamp: msg.created_at,
                    isRead: msg.is_read,
                    date: new Date(msg.created_at).toDateString()
                }));

                // Sort messages by creation time (ascending)
                transformedMessages.sort((a, b) => new Date(a.rawTimestamp) - new Date(b.rawTimestamp));

                // Check if we have new messages
                const newestMessageId = transformedMessages.length > 0 ?
                    Math.max(...transformedMessages.map(m => m.id)) : 0;

                if (newestMessageId > lastMessageId.current) {
                    lastMessageId.current = newestMessageId;
                }

                setMessages(transformedMessages);
            } else {
                setError('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
            setError(`Failed to load conversation: ${error.message}`);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Send message - USING WORKING API ENDPOINT
    const sendMessage = async (receiverId, messageText) => {
        if (!messageText.trim() || !receiverId) {
            setError('Cannot send empty message or without receiver');
            return false;
        }

        const token = getAuthToken();
        if (!token) {
            setError('No authentication token found');
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
            sending: true,
            date: new Date().toDateString()
        };

        setMessages(prev => [...prev, tempMessage]);
        setError(null);

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
            console.log('Send Message API Response:', data);

            if (data.status && data.data) {
                // Replace optimistic message with real message from server
                const realMessage = {
                    id: data.data.uc_id,
                    text: messageText,
                    sender: 'me',
                    timestamp: formatMessageTime(data.data.created_at),
                    rawTimestamp: data.data.created_at,
                    isRead: data.data.is_read,
                    sending: false,
                    date: new Date(data.data.created_at).toDateString()
                };

                setMessages(prev => prev.map(msg =>
                    msg.id === tempMessage.id ? realMessage : msg
                ));

                // Update last message ID
                lastMessageId.current = data.data.uc_id;

                return true;
            } else {
                // Remove optimistic message if send failed
                setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                setError('Failed to send message: Server returned error');
                return false;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message if send failed
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            setError(`Failed to send message: ${error.message}`);
            return false;
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        if (!messages || messages.length === 0) return {};

        const groups = {};
        messages.forEach(msg => {
            const dateKey = msg.date;

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(msg);
        });

        return groups;
    };

    // Handle send message
    const handleSendMessage = async () => {
        if (!message.trim() || !targetUserId || authProblem) return;

        const messageText = message.trim();
        setMessage('');
        await sendMessage(targetUserId, messageText);
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Auto-resize textarea
    const handleTextareaChange = (e) => {
        setMessage(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch conversation when modal opens and targetUserId is available
    useEffect(() => {
        if (isOpen && targetUserId) {
            fetchConversation(targetUserId, true);

            // Set up auto-refresh for this conversation (every 5 seconds)
            refreshIntervalRef.current = setInterval(() => {
                fetchConversation(targetUserId, false);
            }, 5000);
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [isOpen, targetUserId]);

    // Clean up when modal closes
    useEffect(() => {
        if (!isOpen) {
            setMessages([]);
            setMessage('');
            setError(null);
            lastMessageId.current = 0;
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Show loading if not authenticated or missing user data
    if (authProblem) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl w-full max-w-3xl mx-4 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Authentication required</p>
                            <p className="text-sm text-gray-500">Please log in to use the chat feature</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-2xl overflow-hidden" style={{ height: '80vh' }}>
                {/* Header */}
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{companyName}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {location}
                                {jobTitle && <span className="ml-2 text-blue-600">• {jobTitle}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-blue-100 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-700 text-sm">{error}</p>
                            <button 
                                onClick={() => setError(null)}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ height: 'calc(80vh - 140px)' }}>
                    {loading && messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">Loading conversation...</p>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-gray-500">
                            <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                                <p className="text-sm mb-4">No messages yet. Send a message to get started!</p>
                                {jobTitle && (
                                    <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                                        Regarding: {jobTitle}
                                    </p>
                                )}
                                {!targetUserId && (
                                    <p className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full inline-block mt-2">
                                        Error: No user selected
                                    </p>
                                )}
                            </div>
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
                                                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] ${msg.sender === 'me' ? 'ml-auto' : 'mr-auto'}`}>
                                                    <div
                                                        className={`px-4 py-2 rounded-2xl shadow-sm relative ${msg.sender === 'me'
                                                            ? 'bg-blue-500 text-white rounded-br-md'
                                                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                                                            }`}
                                                    >
                                                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                                        <div className={`flex items-center justify-between mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            <span className="text-xs">
                                                                {msg.timestamp}
                                                            </span>
                                                            {msg.sending && (
                                                                <div className="ml-2">
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
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
                </div>

                {/* Message Input */}
                <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end space-x-3">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <div className="flex-1 relative">
                            <textarea
                                value={message}
                                onChange={handleTextareaChange}
                                onKeyPress={handleKeyPress}
                                placeholder={`Message ${companyName}...`}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all max-h-32 min-h-[44px] text-sm"
                                rows={1}
                                style={{ height: 'auto' }}
                                disabled={!targetUserId}
                            />
                        </div>

                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                            <Smile className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || !targetUserId || authProblem}
                            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>

                    {!targetUserId && (
                        <div className="mt-2 text-xs text-red-500 text-center">
                            Unable to send messages: No target user specified
                        </div>
                    )}

                    {jobTitle && (
                        <div className="mt-2 text-xs text-gray-500 text-center">
                            Discussing: {jobTitle}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedChatModal;