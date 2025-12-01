'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import PostCard from '../../components/PostCard';
import { useRouter } from 'next/navigation';

export default function BookmarksPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBookmarks = async () => {
        try {
            const data = await fetchWithAuth('/bookmarks');
            setPosts(data);
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        loadBookmarks();
    }, [user, router]);

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        Bookmarks
                    </h1>
                    <p className="text-slate-400">Posts you've saved for later</p>
                </div>

                {/* Content */}
                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="relative inline-block mb-6">
                            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-2xl"></div>
                            <div className="relative bg-slate-900 rounded-full p-6">
                                <svg className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No bookmarks yet</h3>
                        <p className="text-slate-400 mb-6">Save posts to read them later</p>
                        <a
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                        >
                            Explore Posts
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} onDelete={loadBookmarks} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
