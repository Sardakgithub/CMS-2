'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPublic } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSocket } from '../../../contexts/SocketContext';
import RoomChat from '../../../components/RoomChat';

interface Participant {
    id: string;
    userId: string;
    emoji: string;
    status: string;
    user: {
        id: string;
        username: string;
        displayName?: string;
        profile?: {
            avatarUrl?: string;
        };
    };
}

interface Room {
    id: string;
    name: string;
    type: string;
    activeUsers: number;
    participants: Participant[];
}

const EMOJI_OPTIONS = ['😊', '🌙', '☕', '🎵', '🎨', '📚', '💭', '✨', '🌸', '🍃'];
const STATUS_OPTIONS = ['chill', 'working', 'listening', 'creating', 'thinking', 'relaxing'];

export default function RoomPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { socket, connected } = useSocket();
    const roomId = params.id as string;

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [myEmoji, setMyEmoji] = useState('😊');
    const [myStatus, setMyStatus] = useState('chill');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showStatusPicker, setShowStatusPicker] = useState(false);
    const [initialMessages, setInitialMessages] = useState<any[]>([]);

    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const statusPickerRef = useRef<HTMLDivElement>(null);

    // Close pickers when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (statusPickerRef.current && !statusPickerRef.current.contains(event.target as Node)) {
                setShowStatusPicker(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!user || !socket || !connected) return;

        loadRoom();

        // Join the room via socket
        socket.emit('room:join', {
            userId: user.uid,
            roomId,
            emoji: myEmoji,
            status: myStatus,
        }, (response: any) => {
            if (response.room) {
                setRoom(response.room);
            }
            if (response.messages) {
                setInitialMessages(response.messages);
            }
        });

        // Listen for room updates
        socket.on('room:user-joined', handleUserJoined);
        socket.on('room:user-left', handleUserLeft);
        socket.on('room:user-updated', handleUserUpdated);

        return () => {
            socket.off('room:user-joined', handleUserJoined);
            socket.off('room:user-left', handleUserLeft);
            socket.off('room:user-updated', handleUserUpdated);

            // Leave room on unmount
            socket.emit('room:leave', { userId: user.uid, roomId });
        };
    }, [user, socket, connected, roomId]);

    const loadRoom = async () => {
        try {
            const data = await fetchPublic(`/rooms/${roomId}`);
            setRoom(data);
        } catch (error) {
            console.error('Failed to load room:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserJoined = (data: any) => {
        loadRoom(); // Reload room data
    };

    const handleUserLeft = (data: any) => {
        loadRoom(); // Reload room data
    };

    const handleUserUpdated = (data: any) => {
        loadRoom(); // Reload room data
    };

    const updateMyPresence = (emoji?: string, status?: string) => {
        if (!socket || !user) return;

        const newEmoji = emoji || myEmoji;
        const newStatus = status || myStatus;

        socket.emit('room:update', {
            userId: user.uid,
            roomId,
            emoji: newEmoji,
            status: newStatus,
        });

        if (emoji) setMyEmoji(emoji);
        if (status) setMyStatus(status);
        setShowEmojiPicker(false);
        setShowStatusPicker(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="text-slate-400">Please sign in to join rooms</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin"></div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <p className="text-slate-400">Room not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-slate-950 to-teal-900/10"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>

            {/* Content */}
            <div className="relative max-w-6xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push('/chill')}
                            className="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
                        >
                            ← Back to Rooms
                        </button>
                        <h1 className="text-4xl font-bold text-white">{room.name}</h1>
                        <p className="text-slate-400 mt-2">{room.activeUsers} people here</p>
                    </div>

                    {/* My Presence Controls */}
                    <div className="flex gap-3">
                        <div className="relative" ref={emojiPickerRef}>
                            <button
                                onClick={() => {
                                    setShowEmojiPicker(!showEmojiPicker);
                                    setShowStatusPicker(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-2xl transition-colors"
                            >
                                {myEmoji}
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute top-full mt-2 right-0 bg-slate-800 rounded-xl p-3 shadow-xl border border-slate-700 z-50 w-64">
                                    <div className="grid grid-cols-5 gap-2">
                                        {EMOJI_OPTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => updateMyPresence(emoji, undefined)}
                                                className="text-2xl hover:scale-110 transition-transform hover:bg-slate-700 rounded-lg p-2 flex items-center justify-center aspect-square"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={statusPickerRef}>
                            <button
                                onClick={() => {
                                    setShowStatusPicker(!showStatusPicker);
                                    setShowEmojiPicker(false);
                                }}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
                            >
                                {myStatus}
                            </button>
                            {showStatusPicker && (
                                <div className="absolute top-full mt-2 right-0 bg-slate-800 rounded-xl p-2 shadow-xl border border-slate-700 z-50 min-w-[120px]">
                                    {STATUS_OPTIONS.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateMyPresence(undefined, status)}
                                            className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {room.participants.map((participant) => (
                        <div
                            key={participant.id}
                            className="relative group bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all"
                        >
                            <div className="text-center">
                                <div className="text-5xl mb-3">{participant.emoji}</div>
                                <p className="text-white font-medium mb-1">
                                    {participant.user.displayName || participant.user.username}
                                </p>
                                <p className="text-xs text-slate-500">{participant.status}</p>
                            </div>

                            {/* Subtle pulse effect */}
                            <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {room.participants.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-slate-500 text-lg">This room is quiet right now...</p>
                        <p className="text-slate-600 text-sm mt-2">Be the first to join!</p>
                    </div>
                )}
            </div>

            {/* Chat Component */}
            <RoomChat roomId={roomId} initialMessages={initialMessages} />
        </div>
    );
}
