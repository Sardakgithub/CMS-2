'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPublic, fetchWithAuth } from '../../lib/api';
import PostCard from '../../components/PostCard';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
    const { username } = useParams();
    const { user } = useAuth();
    const [profileUser, setProfileUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [likedPosts, setLikedPosts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch user profile
                const userData = await fetchPublic(`/users/${username}`);
                setProfileUser(userData);
                setStats({
                    followers: userData._count?.followers || 0,
                    following: userData._count?.following || 0,
                    posts: userData._count?.posts || 0
                });

                // 2. Fetch posts
                // Use server-side filtering via query param
                const postsData = await fetchPublic(`/posts?authorId=${userData.id}`);
                setPosts(postsData);

                // 3. Fetch liked posts (only if viewing own profile or if public - for now let's say public)
                // For now, we only show liked posts if it's the current user looking at their own profile
                // or if we implement a public "likes" tab.
                // Let's fetch them anyway if we are the user.
                if (user && user.uid === userData.id) {
                    const likedData = await fetchWithAuth('/users/me/liked-posts');
                    setLikedPosts(likedData);
                }

                // 4. Check follow status
                if (user && user.uid !== userData.id) {
                    try {
                        const { isFollowing } = await fetchWithAuth(`/users/${userData.id}/is-following`);
                        setIsFollowing(isFollowing);
                    } catch (e) {
                        console.error('Failed to check follow status', e);
                    }
                }

            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            loadData();
        }
    }, [username, user]);

    const handleFollow = async () => {
        if (!user || !profileUser || followLoading) return;

        setFollowLoading(true);
        // Optimistic update
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        setStats(prev => ({
            ...prev,
            followers: prev.followers + (newIsFollowing ? 1 : -1)
        }));

        try {
            if (newIsFollowing) {
                await fetchWithAuth(`/users/${profileUser.id}/follow`, { method: 'POST' });
            } else {
                await fetchWithAuth(`/users/${profileUser.id}/follow`, { method: 'DELETE' });
            }
        } catch (error) {
            console.error('Follow action failed:', error);
            // Revert on error
            setIsFollowing(!newIsFollowing);
            setStats(prev => ({
                ...prev,
                followers: prev.followers + (newIsFollowing ? -1 : 1)
            }));
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin"></div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
                User not found
            </div>
        );
    }

    const isOwnProfile = user?.uid === profileUser.id;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 blur opacity-50"></div>
                            <div className="relative h-32 w-32 rounded-2xl overflow-hidden bg-slate-900 border-4 border-slate-950">
                                {profileUser.profile?.avatarUrl ? (
                                    <img
                                        src={profileUser.profile.avatarUrl}
                                        alt={profileUser.username}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-4xl font-bold text-white">
                                        {profileUser.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1">
                                {profileUser.displayName || profileUser.username}
                            </h1>
                            <p className="text-emerald-400 font-medium mb-4">@{profileUser.username}</p>

                            {profileUser.profile?.bio && (
                                <p className="text-slate-300 max-w-lg mb-6">
                                    {profileUser.profile.bio}
                                </p>
                            )}

                            <div className="flex items-center justify-center md:justify-start gap-8 text-sm">
                                <div className="text-center md:text-left">
                                    <div className="font-bold text-white text-lg">{stats.posts}</div>
                                    <div className="text-slate-500">Posts</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="font-bold text-white text-lg">{stats.followers}</div>
                                    <div className="text-slate-500">Followers</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="font-bold text-white text-lg">{stats.following}</div>
                                    <div className="text-slate-500">Following</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {isOwnProfile ? (
                                <a
                                    href="/settings"
                                    className="px-6 py-2 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                                >
                                    Edit Profile
                                </a>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`px-8 py-2 rounded-xl font-medium transition-all ${isFollowing
                                            ? 'bg-slate-800 text-white hover:bg-slate-700'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/20'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 border-b border-slate-800 mb-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'posts' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Posts
                        {activeTab === 'posts' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></div>
                        )}
                    </button>
                    {isOwnProfile && (
                        <button
                            onClick={() => setActiveTab('likes')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'likes' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            Liked
                            {activeTab === 'likes' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></div>
                            )}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-6 pb-12">
                    {activeTab === 'posts' ? (
                        posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                No posts yet
                            </div>
                        )
                    ) : (
                        likedPosts.length > 0 ? (
                            likedPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                No liked posts yet
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
