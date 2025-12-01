'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../lib/api';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const profile = await fetchWithAuth('/users/me');
                    setUsername(profile.username);
                    setAvatarUrl(profile.profile?.avatarUrl);
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-sm group-hover:opacity-50 transition-opacity"></div>
                                <div className="relative bg-slate-900 rounded-lg p-2">
                                    <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Chronos
                            </span>
                        </Link>

                        {user && (
                            <div className="hidden sm:flex sm:space-x-2">
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-slate-900/50 transition-all"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/bookmarks"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-900/50 transition-all"
                                >
                                    Bookmarks
                                </Link>
                                <Link
                                    href="/explore"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-slate-900/50 transition-all"
                                >
                                    Explore
                                </Link>
                                <Link
                                    href="/chill"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-purple-400 hover:bg-slate-900/50 transition-all"
                                >
                                    🌙 Chill
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <Link
                                    href="/new-post"
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px font-medium text-white shadow-[0_1000px_0_0_hsl(0_0%_100%_/_0%)_inset] transition-all hover:shadow-[0_1000px_0_0_hsl(0_0%_100%_/_2%)_inset]"
                                >
                                    <div className="relative rounded-xl bg-slate-950/50 px-4 py-2 transition-colors group-hover:bg-transparent">
                                        <span className="relative flex items-center gap-2 text-sm">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            New Post
                                        </span>
                                    </div>
                                </Link>

                                <Link
                                    href="/settings"
                                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-900/50 transition-all"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </Link>

                                <button
                                    onClick={handleSignOut}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-slate-900/50 transition-all"
                                >
                                    Sign out
                                </button>

                                <Link href={username ? `/${username}` : '#'}>
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={username || 'User'} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-white font-medium text-sm">
                                                {user.email?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-slate-900/50 transition-all"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px font-medium text-white"
                                >
                                    <div className="relative rounded-xl bg-slate-950/50 px-4 py-2 transition-colors group-hover:bg-transparent">
                                        <span className="text-sm">Sign up</span>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
