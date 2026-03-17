'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../components/Admin/AdminLayout/AdminLayout';

const AdminChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [unreadCount, setUnreadCount] = useState({});
    const [conversationStatus, setConversationStatus] = useState({});
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'contact', 'newsletter'
    const [contacts, setContacts] = useState([]);
    const [newsletters, setNewsletters] = useState([]);
    const messagesEndRef = useRef(null);
    const isInitialLoadRef = useRef(true);

    const API = import.meta.env.VITE_API_URL || '';
    const adminName = localStorage.getItem('adminName') || 'Admin';

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(() => {
            // Always fetch conversations to update badges
            fetchConversations();
            // If a conversation is selected, also fetch its details
            if (selectedConversation) {
                fetchConversationById(selectedConversation);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [selectedConversation]);

    // Fetch conversations when active tab changes to chat
    useEffect(() => {
        if (activeTab === 'chat') {
            fetchConversations();
        } else if (activeTab === 'contact') {
            fetchContactSubmissions();
        } else if (activeTab === 'newsletter') {
            fetchNewsletterSubscriptions();
        }
    }, [activeTab]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation?.messages]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/forms/contact?limit=100&status=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch conversations');

            const data = await response.json();
            // Smart filtering: Check if conversation has both contact form and chat messages
            const chatConversationsOnly = (data.data || []).filter(conv => {
                // 1. If moved to chat (admin moved contact form to chat) → Chat Tab
                if (conv.movedToChat === true) return true;

                // 2. If explicitly marked as chat button (no contact form) → Chat Tab
                if (conv.fromContactForm === false) return true;

                // 3. If has a subject field (contact form submission) → Don't show in Chat Tab
                if (conv.subject && conv.subject !== 'Chat Support') return false;

                // 4. Otherwise (pure chat messages) → Chat Tab
                return true;
            });
            setConversations(chatConversationsOnly);
            setLoading(false);

            // Calculate unread count for each conversation
            const newUnreadCount = {};
            chatConversationsOnly.forEach(conv => {
                const unreadMessages = (conv.messages || []).filter(
                    msg => {
                        return msg.sender === 'user' && !msg.isRead;
                    }
                ).length;
                if (unreadMessages > 0) {
                    newUnreadCount[conv._id] = unreadMessages;
                } else {
                }
            });
            setUnreadCount(newUnreadCount);

            // Only auto-select first conversation on initial load
            if (isInitialLoadRef.current && !selectedConversation && chatConversationsOnly && chatConversationsOnly.length > 0) {
                setSelectedConversation(chatConversationsOnly[0]);
                fetchConversationById(chatConversationsOnly[0]);
                isInitialLoadRef.current = false;
            }
        } catch (error) {
            toast.error('Failed to load conversations');
            setLoading(false);
        }
    };

    const fetchConversationById = async (conversation) => {
        if (!conversation || !conversation._id) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/forms/contact/${conversation._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch conversation');

            const data = await response.json();
            setSelectedConversation(data.data);

            // Update unread count for this conversation
            const unreadMessages = (data.data.messages || []).filter(
                msg => msg.sender === 'user' && !msg.isRead
            ).length;

            setUnreadCount(prev => {
                const updated = { ...prev };
                if (unreadMessages === 0) {
                    delete updated[conversation._id];
                } else {
                    updated[conversation._id] = unreadMessages;
                }
                return updated;
            });
        } catch (error) {
            toast.error('Failed to load conversation');
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        // Clear unread count for this conversation when selected
        setUnreadCount(prev => {
            const updated = { ...prev };
            delete updated[conversation._id];
            return updated;
        });
        fetchConversationById(conversation);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (!selectedConversation) {
            toast.error('Please select a conversation');
            return;
        }

        setSendingMessage(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/forms/contact/admin/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    userEmail: selectedConversation.userEmail,
                    message: message.trim(),
                    senderName: adminName
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            toast.success('Message sent');
            setMessage('');
            fetchConversationById(selectedConversation.conversationId);
        } catch (error) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const fetchContactSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/forms/contact?limit=100&status=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch contact submissions');

            const data = await response.json();
            // Contact Tab: Shows contact form submissions that NOT moved to chat
            const contactFormOnly = (data.data || []).filter(submission => {
                // Show in Contact Tab if has subject AND not moved to chat
                return submission.subject && submission.subject !== 'Chat Support' && submission.movedToChat !== true;
            });
            setContacts(contactFormOnly);
        } catch (error) {
            toast.error('Failed to load contact submissions');
        }
    };

    const fetchNewsletterSubscriptions = async () => {
        try {
            const response = await fetch(`${API}/api/newsletter/?limit=100`, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to fetch newsletter subscriptions');

            const data = await response.json();
            setNewsletters(data.data || []);
        } catch (error) {
            toast.error('Failed to load newsletter subscriptions');
        }
    };

    const handleMoveToChat = async (contact) => {
        try {
            const token = localStorage.getItem('token');

            // Call backend to move contact to chat
            const response = await fetch(`${API}/api/forms/contact/${contact._id}/moveToChat`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to move contact to chat');
            }

            const data = await response.json();

            // Switch to chat tab and select the conversation
            setSelectedConversation(data.data);
            setActiveTab('chat');
            fetchConversationById(data.data);

            // Refresh conversations list
            fetchConversations();

            toast.success('Contact moved to chat successfully');
        } catch (error) {
            toast.error('Failed to move contact to chat');
        }
    };

    const filteredConversations = conversations.filter(conv =>
        (conv.userEmail && conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (conv.userName && conv.userName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <AdminLayout activeTab="chat">
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
                        <p className="text-gray-600">Loading conversations...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeTab="chat">
            <div className="flex flex-col h-[calc(100vh-64px)]" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                {/* Tabs Navigation */}
                <div className="flex border-b" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'chat' ? 'border-b-2' : ''}`}
                        style={{
                            color: activeTab === 'chat' ? 'var(--color-accent-primary)' : 'var(--color-text-light)',
                            borderBottomColor: activeTab === 'chat' ? 'var(--color-accent-primary)' : 'transparent'
                        }}
                    >
                        <i className="fas fa-comments" style={{ fontSize: '18px' }}></i>
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('contact')}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'contact' ? 'border-b-2' : ''}`}
                        style={{
                            color: activeTab === 'contact' ? 'var(--color-accent-primary)' : 'var(--color-text-light)',
                            borderBottomColor: activeTab === 'contact' ? 'var(--color-accent-primary)' : 'transparent'
                        }}
                    >
                        <i className="fas fa-envelope" style={{ fontSize: '18px' }}></i>
                        Contact
                    </button>
                    <button
                        onClick={() => setActiveTab('newsletter')}
                        className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'newsletter' ? 'border-b-2' : ''}`}
                        style={{
                            color: activeTab === 'newsletter' ? 'var(--color-accent-primary)' : 'var(--color-text-light)',
                            borderBottomColor: activeTab === 'newsletter' ? 'var(--color-accent-primary)' : 'transparent'
                        }}
                    >
                        <i className="fas fa-bullhorn" style={{ fontSize: '18px' }}></i>
                        Newsletter
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Chat Tab */}
                    {activeTab === 'chat' && (
                        <div className="flex w-full overflow-hidden">
                            {/* Conversations Sidebar */}
                            <div className="w-80" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-border-light)', borderRightWidth: '1px' }} >
                                {/* Header */}
                                <div className="p-4" style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                                    <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Support Chat</h1>
                                    <div className="relative">
                                        <i className="fas fa-search absolute left-3 top-3" style={{ color: 'var(--color-text-light)' }}></i>
                                        <input
                                            type="text"
                                            placeholder="Search conversations..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                            style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)' }}
                                            onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px var(--color-accent-primary)33`}
                                        />
                                    </div>
                                </div>

                                {/* Conversations List */}
                                <div className="flex-1 overflow-y-auto">
                                    {filteredConversations.length === 0 ? (
                                        <div className="p-4 text-center" style={{ color: 'var(--color-text-light)' }}>
                                            {searchTerm ? 'No conversations found' : 'No conversations yet'}
                                        </div>
                                    ) : (
                                        filteredConversations.map((conv) => (
                                            <div
                                                key={conv._id}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={`p-4 border-b cursor-pointer transition relative ${selectedConversation?._id === conv._id ? 'bg-blue-50 border-l-4' : 'hover:bg-gray-50'}`}
                                                style={{
                                                    borderColor: selectedConversation?._id === conv._id ? 'var(--color-accent-primary)' : 'var(--color-border-light)',
                                                    backgroundColor: (unreadCount[conv._id] || 0) > 0
                                                        ? 'rgba(255, 193, 7, 0.05)'
                                                        : (selectedConversation?._id === conv._id ? 'rgba(var(--color-accent-primary-rgb), 0.05)' : 'transparent'),
                                                    overflow: 'visible'
                                                }}
                                            >
                                                {/* Unread Badge with Number */}
                                                {(unreadCount[conv._id] || 0) > 0 && (
                                                    <div className="absolute top-2 right-2 flex items-center gap-2">
                                                        <div
                                                            className="flex items-center justify-center text-white font-bold rounded-full animate-pulse"
                                                            style={{
                                                                backgroundColor: '#dc2626',
                                                                width: '32px',
                                                                height: '32px',
                                                                minWidth: '32px',
                                                                fontSize: '14px',
                                                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.6)',
                                                                border: '2px solid white',
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            {unreadCount[conv._id] > 9 ? '9+' : unreadCount[conv._id]}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-3">
                                                    <div className={`flex-shrink-0 mt-1 ${conv.lastMessageSender === 'admin' ? 'text-green-500' : (unreadCount[conv._id] || 0) > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                        <i className="fas fa-circle" style={{ fontSize: '12px' }}></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className={`font-semibold truncate ${(unreadCount[conv._id] || 0) > 0 ? 'text-red-600' : ''}`} style={{ color: (unreadCount[conv._id] || 0) > 0 ? '#dc2626' : 'var(--color-text-primary)' }}>
                                                                {conv.userName || conv.userEmail || 'Unknown'}
                                                            </p>
                                                            {(unreadCount[conv._id] || 0) > 0 && (
                                                                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                                                    NEW
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm truncate" style={{ color: 'var(--color-text-light)' }}>{conv.userEmail || ''}</p>
                                                        <p className={`text-xs mt-1 font-semibold`} style={{ color: (unreadCount[conv._id] || 0) > 0 ? '#dc2626' : 'var(--color-text-light)' }}>
                                                            {(unreadCount[conv._id] || 0) > 0
                                                                ? `${unreadCount[conv._id]} unread message${unreadCount[conv._id] > 1 ? 's' : ''}`
                                                                : `${conv.messageCount} messages`}
                                                        </p>
                                                    </div>
                                                    <span className="flex-shrink-0 text-xs" style={{ color: 'var(--color-text-light)' }}>
                                                        {formatDate(conv.lastMessageAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {selectedConversation ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{selectedConversation.userName || selectedConversation.userEmail}</h2>
                                                    <p style={{ color: 'var(--color-text-light)' }}>{selectedConversation.userEmail}</p>
                                                    {selectedConversation.userPhone && <p style={{ color: 'var(--color-text-light)' }}>{selectedConversation.userPhone}</p>}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedConversation(null);
                                                    }}
                                                    className="p-2 rounded-lg transition hover:bg-red-100"
                                                    style={{ color: '#dc2626' }}
                                                    title="Close chat"
                                                >
                                                    <i className="fas fa-times" style={{ fontSize: '24px' }}></i>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                            {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                                                selectedConversation.messages.map((msg, idx) => (
                                                    <div key={msg._id || idx} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                                                        <div className={`${msg.sender === 'admin' ? 'bg-green-100 text-gray-900' : 'text-white'} p-4 rounded-lg max-w-xs shadow-md`} style={msg.sender !== 'admin' ? { backgroundColor: 'var(--color-accent-primary)' } : {}}>
                                                            <p className={`text-sm font-semibold mb-1 ${msg.sender === 'admin' ? 'text-gray-700' : 'text-green-100'}`}>
                                                                {msg.senderName}
                                                            </p>
                                                            <p className="whitespace-pre-wrap text-sm">{msg.content || msg.message}</p>
                                                            <p className={`text-xs mt-2 opacity-75`}>
                                                                {new Date(msg.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex justify-center items-center h-full" style={{ color: 'var(--color-text-light)' }}>
                                                    No messages yet
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input Bar */}
                                        <div className="border-t p-4 flex-shrink-0" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-bg-primary)' }}>
                                            <form onSubmit={handleSendMessage} className="space-y-3">
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none text-sm"
                                                    style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-bg-section)' }}
                                                    rows="2"
                                                    disabled={sendingMessage}
                                                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px var(--color-accent-primary)33`}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={sendingMessage || !message.trim()}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold rounded-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                        style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                                        onMouseEnter={(e) => !e.target.disabled && (e.target.style.filter = 'brightness(1.1)')}
                                                        onMouseLeave={(e) => !e.target.disabled && (e.target.style.filter = 'brightness(1)')}
                                                    >
                                                        <i className="fas fa-paper-plane" style={{ fontSize: '14px' }}></i>
                                                        {sendingMessage ? 'Sending...' : 'Send Message'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMessage('')}
                                                        className="px-4 py-2 rounded-lg font-semibold transition text-sm"
                                                        style={{ backgroundColor: 'var(--color-bg-section)', color: 'var(--color-text-primary)' }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-border-light)'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-bg-section)'}
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                        <div className="text-center">
                                            <i className="fas fa-comments mx-auto mb-6" style={{ fontSize: '64px', color: 'var(--color-accent-primary)', opacity: 0.3 }}></i>
                                            <p className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>No Conversation Selected</p>
                                            <p style={{ color: 'var(--color-text-light)', maxWidth: '400px' }}>
                                                Select a conversation from the list on the left to start chatting with customers
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <div className="w-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                            {contacts.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center" style={{ color: 'var(--color-text-light)' }}>
                                        <i className="fas fa-envelope mx-auto mb-4" style={{ fontSize: '64px', color: 'var(--color-accent-primary)' }}></i>
                                        <p className="text-xl font-semibold">No Contact Submissions</p>
                                        <p className="text-sm mt-2">Contact form submissions will appear here</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="space-y-4 p-6">
                                        {contacts.map((contact) => (
                                            <div key={contact._id} className="border rounded-lg p-4" style={{ borderColor: contact.movedToChat ? 'var(--color-success)' : 'var(--color-border-light)', backgroundColor: 'var(--color-bg-section)' }}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>{contact.userName || 'Unknown'}</h3>
                                                            {contact.movedToChat && (
                                                                <span className="px-2 py-1 text-xs font-semibold rounded text-white" style={{ backgroundColor: 'var(--color-success)' }}>
                                                                    Moved
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{contact.userEmail}</p>
                                                        {contact.userPhone && <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{contact.userPhone}</p>}
                                                    </div>
                                                    <div className=" flex gap-2 flex-col items-end ">
                                                        <div className="text-xs text-right" style={{ color: 'var(--color-text-light)' }}>
                                                            {new Date(contact.createdAt || contact.lastMessageAt).toLocaleDateString()}
                                                        </div>

                                                        {!contact.movedToChat && (
                                                            <button
                                                                onClick={() => handleMoveToChat(contact)}
                                                                className="flex-1 px-4 py-2 text-white font-semibold rounded-lg transition text-sm"
                                                                style={{ backgroundColor: 'var(--color-accent-primary)' }}
                                                                onMouseEnter={(e) => e.target.style.filter = 'brightness(1.1)'}
                                                                onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
                                                            >
                                                                Move to Chat
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mb-3 p-3 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                                                    <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                                        {contact.messages?.[0]?.subject || (contact.messages?.[0]?.content || contact.messages?.[0]?.message)?.substring(0, 50) || 'Message'}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                                                        {contact.messages?.[0]?.content || contact.messages?.[0]?.message || 'No content'}
                                                    </p>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Newsletter Tab */}
                    {activeTab === 'newsletter' && (
                        <div className="w-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                            {newsletters.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center" style={{ color: 'var(--color-text-light)' }}>
                                        <i className="fas fa-bullhorn mx-auto mb-4" style={{ fontSize: '64px', color: 'var(--color-accent-primary)' }}></i>
                                        <p className="text-xl font-semibold">No Newsletter Subscribers</p>
                                        <p className="text-sm mt-2">Newsletter subscriptions will appear here</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                                Newsletter Subscribers ({newsletters.length})
                                            </h2>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '2px' }}>
                                                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Email</th>
                                                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Subscribed</th>
                                                        <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {newsletters.map((newsletter) => (
                                                        <tr key={newsletter._id} style={{ borderColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                                                            <td className="py-3 px-4" style={{ color: 'var(--color-text-primary)' }}>
                                                                {newsletter.email}
                                                            </td>
                                                            <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-light)' }}>
                                                                {new Date(newsletter.created_at || newsletter.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                                                                    backgroundColor: newsletter.status === 'subscribed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                    color: newsletter.status === 'subscribed' ? '#22c55e' : '#ef4444'
                                                                }}>
                                                                    {newsletter.status === 'subscribed' ? 'Active' : 'Unsubscribed'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminChatPage;
