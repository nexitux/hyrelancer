"use client";
import { useState } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, Phone, Video } from 'lucide-react';

export default function MessageBox() {
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(1);

    const [users] = useState([
        {
            id: 1,
            name: 'Alex Johnson',
            lastMessage: 'Same here! Want to collaborate on something cool?',
            timestamp: '2:35 PM',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            unreadCount: 0,
            online: true
        },
        {
            id: 2,
            name: 'Sarah Chen',
            lastMessage: 'Thanks for the feedback on the design!',
            timestamp: '1:20 PM',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            unreadCount: 2,
            online: false
        },
        {
            id: 3,
            name: 'Michael Brown',
            lastMessage: 'The meeting is scheduled for tomorrow',
            timestamp: '11:45 AM',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            unreadCount: 0,
            online: true
        },
        {
            id: 4,
            name: 'Emily Davis',
            lastMessage: 'Can you send me the project files?',
            timestamp: 'Yesterday',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            unreadCount: 1,
            online: false
        },
        {
            id: 5,
            name: 'Team Alpha',
            lastMessage: 'Great work everyone! 🎉',
            timestamp: 'Yesterday',
            avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=40&h=40&fit=crop&crop=face',
            unreadCount: 0,
            online: false
        }
    ]);

    const [messages, setMessages] = useState({
        1: [
            {
                id: 1,
                text: "Hey! How's your day going?",
                sender: 'other',
                timestamp: '2:30 PM'
            },
            {
                id: 2,
                text: "Pretty good! Just working on some new designs. What about you?",
                sender: 'me',
                timestamp: '2:32 PM'
            },
            {
                id: 3,
                text: "Same here! Want to collaborate on something cool?",
                sender: 'other',
                timestamp: '2:35 PM'
            }
        ],
        2: [
            {
                id: 1,
                text: "I've reviewed your latest design mockups",
                sender: 'other',
                timestamp: '1:15 PM'
            },
            {
                id: 2,
                text: "Thanks for the feedback on the design!",
                sender: 'other',
                timestamp: '1:20 PM'
            }
        ]
    });

    const selectedUserData = users.find(user => user.id === selectedUser);
    const currentMessages = messages[selectedUser] || [];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                id: (currentMessages.length || 0) + 1,
                text: message,
                sender: 'me',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => ({
                ...prev,
                [selectedUser]: [...(prev[selectedUser] || []), newMessage]
            }));
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (

        <div className="w-full max-w-[1600px] mx-auto">

            {/* Messages Header */}
            <div className="flex-shrink-0 p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Messages</h1>
            </div>

            {/* Messages Container */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 mx-4 sm:mx-6" style={{ height: 'calc(100vh - 180px)' }}>
                <div className="flex h-full flex-col sm:flex-row">
                    {/* Users Sidebar */}
                    <div className={`${selectedUser ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 lg:w-1/4 bg-slate-50 border-r border-slate-200 flex-col`}>
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
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user.id)}
                                    className={`flex items-center p-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100 transition-colors ${selectedUser === user.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {user.online && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-white"></div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-slate-900 truncate">{user.name}</h3>
                                            <span className="text-xs text-slate-500">{user.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 truncate mt-0.5">{user.lastMessage}</p>
                                    </div>
                                    {user.unreadCount > 0 && (
                                        <div className="ml-2 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            {user.unreadCount}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${selectedUser ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-slate-25`}>
                        {/* Chat Header */}
                        <div className="flex-shrink-0 bg-blue-50 px-3 sm:px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="sm:hidden p-1 hover:bg-blue-700 rounded-full transition-colors mr-2"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="relative">
                                    <img
                                        src={selectedUserData?.avatar}
                                        alt={selectedUserData?.name}
                                        className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover ring-2 ring-blue-300"
                                    />
                                    {selectedUserData?.online && (
                                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full ring ring-blue-600"></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-semibold text-gray-600">{selectedUserData?.name}</h2>
                                    <p className="text-xs text-blue-500 hidden sm:block">
                                        {selectedUserData?.online ? 'Online' : 'Last seen recently'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1">
                                {/* <button className="p-1.5 hover:bg-blue-700 rounded-full transition-colors hidden sm:block">
                                    <Video className="w-4 h-4 text-white" />
                                </button>
                                <button className="p-1.5 hover:bg-blue-700 rounded-full transition-colors">
                                    <Phone className="w-4 h-4 text-white" />
                                </button> */}
                                <button className="p-1.5 hover:bg-blue-200 rounded-full transition-colors hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-slate-50">
                            <div className="space-y-2 sm:space-y-3">
                                {currentMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[280px] sm:max-w-xs lg:max-w-md ${msg.sender === 'me' ? 'order-1' : 'order-2'}`}>
                                            <div
                                                className={`px-3 py-2 rounded-lg shadow-sm text-sm ${msg.sender === 'me'
                                                    ? 'bg-blue-500 text-white rounded-br-sm'
                                                    : 'bg-white text-slate-900 rounded-bl-sm border border-slate-200'
                                                    }`}
                                            >
                                                <p className="leading-relaxed">{msg.text}</p>
                                                <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-green-100' : 'text-slate-500'}`}>
                                                    {msg.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="flex-shrink-0 bg-white border-t border-slate-200 p-2 sm:p-3">
                            <div className="flex items-center justify-center space-x-2">
                                {/* <button className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 hidden sm:block">
                                    <Paperclip className="w-4 h-4 text-slate-600" />
                                </button> */}

                                <div className="flex-1">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        className="w-full px-3 py-2 pr-8 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 resize-none transition-all max-h-16 min-h-[36px] text-sm"
                                        rows={1}
                                    />
                                    {/* <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors">
                                        <Smile className="w-4 h-4 text-slate-500" />
                                    </button> */}
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}   