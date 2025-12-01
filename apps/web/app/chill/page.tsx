'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPublic } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Room {
    id: string;
    name: string;
    type: string;
    activeUsers: number;
}

export default function ChillRoomsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const data = await fetchPublic('/rooms');
            setRooms(data);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoomIcon = (type: string) => {
        const icons: Record<string, string> = {
            'lo-fi': '🎵',
            'focus': '🎯',
            'quiet': '🤫',
            'creative': '🎨',
            'night': '🌙',
            'social': '💬',
        };
        return icons[type] || '✨';
    };

    const getRoomGradient = (type: string) => {
        const gradients: Record<string, string> = {
            'lo-fi': 'from-purple-500/20 to-pink-500/20',
            'focus': 'from-blue-500/20 to-cyan-500/20',
            'quiet': 'from-slate-500/20 to-gray-500/20',
            'creative': 'from-orange-500/20 to-yellow-500/20',
            'night': 'from-indigo-500/20 to-purple-500/20',
            'social': 'from-emerald-500/20 to-teal-500/20',
        };
        return gradients[type] || 'from-emerald-500/20 to-teal-500/20';
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Please sign in to access Chill Rooms</p>
                    <a href="/auth" className="text-emerald-400 hover:text-emerald-300">
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
                        Ambient Co-Chill Rooms
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Join a quiet space to feel the presence of others without pressure.
                        No chat, no performance—just soft companionship.
                    </p>
                </div>

                {/* Rooms Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6 animate-pulse">
                                <div className="h-16 w-16 rounded-full bg-slate-800 mb-4"></div>
                                <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => router.push(`/chill/${room.id}`)}
                                className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6 text-left transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${getRoomGradient(room.type)} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                                {/* Content */}
                                <div className="relative">
                                    <div className="text-5xl mb-4">{getRoomIcon(room.type)}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{room.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span>{room.activeUsers} online</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
