'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { fetchPublic } from '../../lib/api';
import PostCard from '../../components/PostCard';

export default function ExplorePage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        try {
            const data = await fetchPublic('/posts');
            setPosts(data);
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                        Explore
                    </h1>
                    <p className="text-slate-400">Discover trending content from across the platform</p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6 animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-800"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-800 rounded w-1/4 mb-2"></div>
                                        <div className="h-3 bg-slate-800 rounded w-1/6"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                                    <div className="h-4 bg-slate-800 rounded w-4/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="relative inline-block mb-6">
                            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-2xl"></div>
                            <div className="relative bg-slate-900 rounded-full p-6">
                                <svg className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                        <p className="text-slate-400 mb-6">Check back later for new content!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} onDelete={loadPosts} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
