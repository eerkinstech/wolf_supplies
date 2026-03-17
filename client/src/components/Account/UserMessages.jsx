'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

import toast from 'react-hot-toast';

const UserMessages = () => {
    const { user } = useAuth();
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const messagesEndRef = useRef(null);
    const API = import.meta.env.VITE_API_URL || '';

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages]);

    // Fetch user's contact conversation
    useEffect(() => {
        const fetchUserConversation = async () => {
            if (!user || !user.email) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API}/api/forms/contact/user?email=${encodeURIComponent(user.email)}`);
                const data = await response.json();

                if (response.ok) {
                    setConversation(data.data || null);
                    setError(null);
                } else {
                    setError(data.message || 'Failed to load conversation');
                    setConversation(null);
                }
            } catch (err) {
setError('Failed to load conversation');
                setConversation(null);
            } finally {
                setLoading(false);
            }
        };

        if (autoRefresh) {
            fetchUserConversation();
            const interval = setInterval(fetchUserConversation, 3000);
            return () => clearInterval(interval);
        }
    }, [user, autoRefresh, API]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (!user || !user.email) {
            toast.error('User not authenticated');
            return;
        }

        setSendingMessage(true);

        try {
            const response = await fetch(`${API}/api/forms/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user.name || 'User',
                    email: user.email,
                    phone: user.phone || '',
                    subject: 'Support Message',
                    message: message.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Failed to send message');
                return;
            }

            setMessage('');
            toast.success('Message sent successfully!');

            // Refresh conversation immediately
            setTimeout(async () => {
                const refreshResponse = await fetch(`${API}/api/forms/contact/user?email=${encodeURIComponent(user.email)}`);
                const refreshData = await refreshResponse.json();
                if (refreshResponse.ok) {
                    setConversation(refreshData.data || null);
                }
            }, 500);
        } catch (error) {
toast.error('Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-4"></div>
                    <p className="text-gray-600">Loading your messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <section className="mb-8 bg-white rounded-lg shadow-lg p-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                </div>
            </section>
        );
    }

    return (
        <section className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
            {!conversation ? (
                <div className="p-8 text-center">
                    <div className="mb-4">
                        <i className="fas fa-clock text-4xl text-gray-400 block mb-3"></i>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                        <p className="text-gray-600 mb-6">Start a conversation with our support team</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-screen max-h-96">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-gray-900">Support Messages</h3>
                        <p className="text-sm text-gray-600">
                            Created {formatDate(conversation.createdAt)}
                        </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {conversation.messages && conversation.messages.length > 0 ? (
                            <>
                                {conversation.messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs p-3 rounded-lg shadow ${msg.sender === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-900 border-l-4 border-l-green-500'
                                                }`}
                                        >
                                            {msg.sender === 'admin' && (
                                                <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                                                    <i className="fas fa-check text-green-600" style={{ fontSize: '8px' }}></i> Support Team
                                                </p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
                                                {formatDate(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-center">
                                <p>No messages yet. Send a message to start the conversation.</p>
                            </div>
                        )}
                    </div>

                    {/* Input Bar at Bottom */}
                    <div className="border-t border-gray-200 bg-white p-4">
                        <form onSubmit={handleSendMessage} className="space-y-3">
                            <div className="flex gap-2">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-sm"
                                    rows="2"
                                    disabled={sendingMessage}
                                />
                                <button
                                    type="submit"
                                    disabled={sendingMessage || !message.trim()}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition text-sm whitespace-nowrap h-fit"
                                >
                                    <i className="fas fa-paper-plane" style={{ fontSize: '14px' }}></i>
                                    {sendingMessage ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section >
    );
};

export default UserMessages;
