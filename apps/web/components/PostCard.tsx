'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth, fetchPublic } from '../lib/api';
import { useLikes } from '../hooks/useLikes';
import { useBookmarks } from '../hooks/useBookmarks';
import CommentSection from './CommentSection';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

interface PostCardProps {
    post: any;
    onDelete?: () => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
    const { user } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const isAuthor = user?.uid === post.authorId;

    // Like and bookmark functionality
    const { liked, likeCount, toggleLike, isLoading: likesLoading } = useLikes(post.id);
    const { bookmarked, toggleBookmark, isLoading: bookmarksLoading } = useBookmarks(post.id);

    // Load comment count
    useEffect(() => {
        const loadCommentCount = async () => {
            try {
                const data = await fetchPublic(`/posts/${post.id}/comments/count`);
                setCommentCount(data.count || 0);
            } catch (error) {
                console.error('Failed to load comment count:', error);
            }
        };
        loadCommentCount();
    }, [post.id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await fetchWithAuth(`/posts/${post.id}`, { method: 'DELETE' });
            onDelete?.();
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        }
    };

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="group relative">
            {/* Gradient glow effects */}
            <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70"></div>
            <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/0 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-70"></div>

            <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/10 border border-slate-800/50">
                <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <Link href={`/${post.author.username}`} className="flex items-center gap-4 group/author">
                            <div className="relative">
                                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-sm transition-opacity duration-300 group-hover/author:opacity-40"></div>
                                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 overflow-hidden">
                                    {post.author.profile?.avatarUrl ? (
                                        <img src={post.author.profile.avatarUrl} alt={post.author.username} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-emerald-500 font-bold text-lg">
                                            {post.author.username[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-white group-hover/author:text-emerald-400 transition-colors">
                                    {post.author.displayName || post.author.username}
                                </h3>
                                <p className="text-sm text-slate-400">@{post.author.username}</p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
                            {isAuthor && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors"
                                    >
                                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    {showMenu && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl z-10">
                                            <Link
                                                href={`/posts/${post.id}/edit`}
                                                className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors rounded-t-xl"
                                            >
                                                Edit Post
                                            </Link>
                                            <button
                                                onClick={handleDelete}
                                                className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 transition-colors rounded-b-xl"
                                            >
                                                Delete Post
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-invert prose-emerald max-w-none">
                        <Editor data={post.contentJson} readOnly={true} />
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center gap-4 pt-4 border-t border-slate-800/50">
                        {/* Like Button */}
                        <button
                            onClick={toggleLike}
                            disabled={likesLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-all group/btn disabled:opacity-50"
                        >
                            <svg
                                className={`h-5 w-5 transition-all duration-300 ${liked
                                        ? 'text-red-500 fill-red-500 scale-110'
                                        : 'text-slate-400 group-hover/btn:text-emerald-400 group-hover/btn:scale-110'
                                    }`}
                                fill={liked ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className={`text-sm transition-colors ${liked ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                                {likeCount > 0 ? likeCount : 'Like'}
                            </span>
                        </button>

                        {/* Comment Button */}
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-colors group/btn"
                        >
                            <svg className={`h-5 w-5 transition-colors ${showComments ? 'text-teal-400' : 'text-slate-400 group-hover/btn:text-teal-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className={`text-sm transition-colors ${showComments ? 'text-teal-400 font-medium' : 'text-slate-400'}`}>
                                {commentCount > 0 ? commentCount : 'Comment'}
                            </span>
                        </button>

                        {/* Bookmark Button */}
                        <button
                            onClick={toggleBookmark}
                            disabled={bookmarksLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 transition-all group/btn ml-auto disabled:opacity-50"
                        >
                            <svg
                                className={`h-5 w-5 transition-all duration-300 ${bookmarked
                                        ? 'text-blue-500 fill-blue-500 scale-110'
                                        : 'text-slate-400 group-hover/btn:text-blue-400 group-hover/btn:scale-110'
                                    }`}
                                fill={bookmarked ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>
                    </div>

                    {/* Comment Section */}
                    {showComments && <CommentSection postId={post.id} />}
                </div>
            </div>
        </div>
    );
}
