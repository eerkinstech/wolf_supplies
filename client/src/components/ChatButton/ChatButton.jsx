'use client';

import React, { useState, useEffect, useRef } from 'react';

import toast from 'react-hot-toast';

const ChatButton = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [showUserForm, setShowUserForm] = useState(true);
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const isCheckingUnread = useRef(false);
    const isFetchingConversation = useRef(false);

    const API = import.meta.env.VITE_API_URL || '';

    // Load unread count from localStorage on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('chatUserEmail');
        const savedName = localStorage.getItem('chatUserName');
        const savedUnread = localStorage.getItem('chatUnreadCount');
        if (savedEmail) {
            setUserEmail(savedEmail);
            if (savedName) {
                setUserName(savedName);
            }
            if (savedUnread) {
                setUnreadCount(parseInt(savedUnread));
            }
            // If email is saved, skip the form
            setShowUserForm(false);
            // Check for unread messages immediately
            checkUnreadMessagesImmediate(savedEmail);
        }
    }, []);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load user conversation when chat opens
    useEffect(() => {
        if (isChatOpen && userEmail && !conversationId) {
            fetchUserConversation();
        }
    }, [isChatOpen, userEmail]);

    // Define checkUnreadMessages and fetchUserConversation first
    const checkUnreadMessages = async () => {
        if (!userEmail || isCheckingUnread.current) return;

        isCheckingUnread.current = true; // Set flag to prevent overlapping requests
        console.log('Checking unread messages for:', userEmail);
        try {
            const response = await fetch(`${API}/api/forms/contact/user?email=${encodeURIComponent(userEmail)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.messages) {
                    const unreadFromAdmin = data.data.messages.filter(
                        msg => msg.sender === 'admin' && !msg.isRead
                    ).length;
                    setUnreadCount(unreadFromAdmin);
                    localStorage.setItem('chatUnreadCount', unreadFromAdmin);
                }
            }
        } catch (error) {
            console.error('Error checking unread messages:', error);
        } finally {
            isCheckingUnread.current = false; // Reset flag
        }
    };

    const fetchUserConversation = async () => {
        if (!userEmail || isFetchingConversation.current) return;

        isFetchingConversation.current = true; // Set flag to prevent overlapping requests
        console.log('Fetching user conversation for:', userEmail);
        try {
            const response = await fetch(`${API}/api/forms/contact/user?email=${encodeURIComponent(userEmail)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setConversationId(data.data._id);
                    setMessages(data.data.messages || []);

                    const unreadFromAdmin = (data.data.messages || []).filter(
                        msg => msg.sender === 'admin' && !msg.isRead
                    ).length;
                    setUnreadCount(unreadFromAdmin);
                    localStorage.setItem('chatUnreadCount', unreadFromAdmin);
                }
            }
        } catch (error) {
            console.error('Error fetching user conversation:', error);
        } finally {
            isFetchingConversation.current = false; // Reset flag
        }
    };

    // Throttle function to limit request frequency
    const throttle = (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    };

    // Throttled versions of the functions
    const throttledCheckUnreadMessages = throttle(checkUnreadMessages, 5000);
    const throttledFetchUserConversation = throttle(fetchUserConversation, 3000);

    // Optimized polling for unread messages
    useEffect(() => {
        if (!userEmail) return; // Only poll if userEmail exists

        const bgInterval = setInterval(() => {
            throttledCheckUnreadMessages();
        }, 5000);

        return () => clearInterval(bgInterval); // Clear interval on unmount
    }, [userEmail]);

    // Optimized polling for new messages
    useEffect(() => {
        if (!isChatOpen || !conversationId) return; // Only poll if chat is open and conversationId exists

        const interval = setInterval(() => {
            throttledFetchUserConversation();
        }, 3000);

        return () => clearInterval(interval); // Clear interval on unmount
    }, [isChatOpen, conversationId]);

    // Immediate check for unread messages
    const checkUnreadMessagesImmediate = async (email) => {
        if (!email) return;

        try {
            const response = await fetch(`${API}/api/forms/contact/user?email=${encodeURIComponent(email)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.messages) {
                    const unreadFromAdmin = data.data.messages.filter(
                        msg => msg.sender === 'admin' && !msg.isRead
                    ).length;
                    setUnreadCount(unreadFromAdmin);
                    localStorage.setItem('chatUnreadCount', unreadFromAdmin);
                }
            }
        } catch (error) {
        }
    };

    const handleStartChat = (e) => {
        e.preventDefault();

        if (!userEmail.trim() || !userName.trim()) {
            toast.error('Please enter your name and email');
            return;
        }

        // Save email and name for persistence
        localStorage.setItem('chatUserEmail', userEmail);
        localStorage.setItem('chatUserName', userName);

        setShowUserForm(false);
        // Fetch or create conversation
        fetchUserConversation();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        const trimmedMessage = inputMessage.trim();
        const trimmedName = userName.trim();
        const trimmedEmail = userEmail.trim();

        // Validate all required fields
        if (!trimmedMessage) {
            toast.error('Please enter a message');
            return;
        }

        if (!trimmedName) {
            toast.error('Name is required');
            return;
        }

        if (!trimmedEmail) {
            toast.error('Email is required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setSending(true);

        try {
            const payload = {
                name: trimmedName,
                email: trimmedEmail,
                message: trimmedMessage,
                subject: 'Chat Support'
            };
            const response = await fetch(`${API}/api/forms/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || `Server error: ${response.status}`);
            }

            if (responseData.success && responseData.data) {
                setMessages(responseData.data.messages || []);
                setConversationId(responseData.data._id);
                setInputMessage('');
                toast.success('Message sent successfully');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
            // When opening chat, clear unread count (user is viewing messages)
            setUnreadCount(0);
            localStorage.setItem('chatUnreadCount', '0');
            // Fetch latest messages
            if (userEmail) {
                fetchUserConversation();
            }
        }
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        // DO NOT clear unreadCount when closing - keep showing the badge
    };

    const handleEditInfo = () => {
        setIsEditingInfo(true);
    };

    const handleSaveInfo = () => {
        if (!userEmail.trim() || !userName.trim()) {
            toast.error('Please enter your name and email');
            return;
        }

        localStorage.setItem('chatUserEmail', userEmail);
        localStorage.setItem('chatUserName', userName);
        setIsEditingInfo(false);
        toast.success('Information updated');
    };

    return (
        <>
            {/* Chat Window */}
            {isChatOpen && (
                <div
                    className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-9998 border border-gray-200"
                    style={{
                        position: 'fixed',
                        bottom: '96px',
                        right: '24px',
                        zIndex: 9998,
                        maxHeight: '400px'
                    }}
                >
                    {/* Chat Header */}
                    <div className="bg-(--color-accent-primary) text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Chat with us</h3>
                            {!showUserForm && !isEditingInfo && (
                                <p className="text-xs opacity-90">{userName}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {!showUserForm && !isEditingInfo && (
                                <button
                                    onClick={handleEditInfo}
                                    className="text-white hover:bg-(--color-accent-light) rounded-full p-2 transition duration-300"
                                    title="Edit name and email"
                                    aria-label="Edit info"
                                >
                                    <i className="fas fa-edit text-sm"></i>
                                </button>
                            )}
                            <button
                                onClick={handleCloseChat}
                                className="text-white hover:bg-(--color-accent-light) rounded-full p-1 transition duration-300"
                                aria-label="Close chat"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    {showUserForm || isEditingInfo ? (
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col justify-center">
                            <form onSubmit={showUserForm ? handleStartChat : (e) => { e.preventDefault(); handleSaveInfo(); }} className="space-y-4">
                                {showUserForm && (
                                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Start a conversation</h4>
                                )}
                                {isEditingInfo && (
                                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Update your information</h4>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent-primary)"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Your Email
                                    </label>
                                    <input
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent-primary)"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-(--color-accent-primary) text-white rounded-lg px-4 py-2 text-sm hover:bg-(--color-accent-light) transition duration-300 font-semibold"
                                >
                                    {showUserForm ? 'Start Chat' : 'Save Changes'}
                                </button>
                                {isEditingInfo && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingInfo(false)}
                                        className="w-full bg-gray-300 text-gray-800 rounded-lg px-4 py-2 text-sm hover:bg-gray-400 transition duration-300 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </form>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm py-8">
                                    <p>Hello! How can we help you today?</p>
                                    <p className="text-xs mt-4">Our team is here to assist you with any questions.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.sender === 'user'
                                                ? 'bg-(--color-accent-primary) text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="font-semibold text-xs mb-1">
                                                {msg.senderName || (msg.sender === 'user' ? 'You' : 'Admin')}
                                            </p>
                                            <p>{msg.content || msg.message}</p>
                                            <p className="text-xs mt-1 opacity-70">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Chat Input */}
                    {!showUserForm && (
                        <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                            <form onSubmit={handleSendMessage} className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-accent-primary)"
                                        disabled={sending}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-(--color-accent-primary) text-white rounded-lg px-4 py-2 text-sm hover:bg-(--color-accent-light) transition duration-300 disabled:opacity-50"
                                        disabled={sending}
                                    >
                                        {sending ? '...' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Chat Button */}
            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 w-16 h-16 bg-(--color-accent-primary) text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-(--color-accent-light) transition duration-300 z-9999"
                title="Open chat"
                aria-label="Open chat"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 9999,
                    overflow: 'visible'
                }}
            >
                {isChatOpen ? (
                    <i className="fas fa-times text-2xl"></i>
                ) : (
                    <i className="fas fa-comments text-2xl"></i>
                )}

                {/* Unread Message Badge */}
                {unreadCount > 0 && (
                    <div
                        className="absolute bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                        style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            backgroundColor: '#dc2626',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            zIndex: 10000
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>
        </>
    );
};

export default ChatButton;
