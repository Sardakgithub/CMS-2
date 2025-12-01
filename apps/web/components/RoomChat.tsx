'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

interface Message {
    id: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        displayName?: string;
        profile?: {
            avatarUrl?: string;
        };
    };
}

interface RoomChatProps {
    roomId: string;
    initialMessages?: Message[];
}

export default function RoomChat({ roomId, initialMessages = [] }: RoomChatProps) {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('room:new-message', (data: any) => {
            if (data.roomId === roomId) {
                setMessages((prev) => [...prev, data.message]);
                scrollToBottom();
            }
        });

        return () => {
            socket.off('room:new-message');
        };
    }, [socket, roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !socket || !user) return;

        socket.emit('room:message', {
            userId: user.uid,
            roomId,
            content: newMessage.trim(),
        });

        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-40">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-white rounded-full p-4 shadow-lg border border-slate-700 flex items-center gap-2 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">Chat {messages.length > 0 && `(${messages.length})`}</span>
                </button>
            ) : (
                <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl w-80 h-96 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Room Chat
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-500 text-sm mt-8">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 ${msg.sender.id === user?.uid ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className="flex-shrink-0">
                                        {msg.sender.profile?.avatarUrl ? (
                                            <img
                                                src={msg.sender.profile.avatarUrl}
                                                alt={msg.sender.username}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs">
                                                {(msg.sender.displayName || msg.sender.username)[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`flex flex-col ${msg.sender.id === user?.uid ? 'items-end' : ''}`}>
                                        <span className="text-xs text-slate-500 mb-1">
                                            {msg.sender.displayName || msg.sender.username}
                                        </span>
                                        <div
                                            className={`rounded-2xl px-4 py-2 max-w-xs ${msg.sender.id === user?.uid
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-800 text-white'
                                                }`}
                                        >
                                            <p className="text-sm break-words">{msg.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                maxLength={200}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!newMessage.trim()}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-4 py-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
