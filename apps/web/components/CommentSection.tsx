'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth, fetchPublic } from '../lib/api';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        displayName?: string;
        profile?: {
            avatarUrl?: string;
        };
    };
}

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        try {
            const data = await fetchPublic(`/posts/${postId}/comments`);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const comment = await fetchWithAuth(`/posts/${postId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ content: newComment }),
            });
            setComments([comment, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            const updatedComment = await fetchWithAuth(`/comments/${commentId}`, {
                method: 'PATCH',
                body: JSON.stringify({ content: editContent }),
            });
            setComments(comments.map(c => c.id === commentId ? updatedComment : c));
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error('Failed to update comment:', error);
            alert('Failed to update comment');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;

        try {
            await fetchWithAuth(`/comments/${commentId}`, {
                method: 'DELETE',
            });
            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment');
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
        <div className="mt-6 pt-6 border-t border-slate-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">
                Comments {comments.length > 0 && `(${comments.length})`}
            </h3>

            {/* Add Comment Form */}
            {user && (
                <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                        rows={3}
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block h-8 w-8 rounded-full border-2 border-slate-800 border-t-teal-500 animate-spin"></div>
                </div>
            ) : comments.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-900/50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0">
                                    {comment.author.profile?.avatarUrl ? (
                                        <img
                                            src={comment.author.profile.avatarUrl}
                                            alt={comment.author.username}
                                            className="h-full w-full rounded-lg object-cover"
                                        />
                                    ) : (
                                        <span className="text-white font-bold">
                                            {comment.author.username[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-white">
                                            {comment.author.displayName || comment.author.username}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {timeAgo(comment.createdAt)}
                                        </span>
                                    </div>

                                    {editingId === comment.id ? (
                                        <div>
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 resize-none"
                                                rows={2}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleEdit(comment.id)}
                                                    className="px-3 py-1 text-xs rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditContent('');
                                                    }}
                                                    className="px-3 py-1 text-xs rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-slate-300 text-sm">{comment.content}</p>
                                            {user?.uid === comment.author.id && (
                                                <div className="flex gap-3 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(comment.id);
                                                            setEditContent(comment.content);
                                                        }}
                                                        className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
