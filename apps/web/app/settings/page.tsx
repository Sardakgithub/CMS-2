'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../lib/api';
import { useRouter } from 'next/navigation';
import AvatarUpload from '../../components/AvatarUpload';

export default function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [userData, setUserData] = useState<any>(null);
    const [profile, setProfile] = useState({
        displayName: '',
        bio: '',
        avatarUrl: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const loadProfile = async () => {
            try {
                const data = await fetchWithAuth('/users/me');
                setUserData(data);
                if (data) {
                    setProfile({
                        displayName: data.displayName || '',
                        bio: data.profile?.bio || '',
                        avatarUrl: data.profile?.avatarUrl || '',
                    });
                }
            } catch (error) {
                console.error(error);
                setMessage({ type: 'error', text: 'Failed to load profile' });
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            await fetchWithAuth('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify(profile),
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Reload to update navbar
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (url: string) => {
        // Update local state
        const updatedProfile = { ...profile, avatarUrl: url };
        setProfile(updatedProfile);

        // Auto-save to backend
        try {
            await fetchWithAuth('/users/profile', {
                method: 'PATCH',
                body: JSON.stringify(updatedProfile),
            });
            setMessage({ type: 'success', text: 'Avatar updated successfully!' });

            // Reload after a short delay to update navbar
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to update avatar' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                        Settings
                    </h1>
                    <p className="text-slate-400">Manage your account and profile</p>
                </div>

                {/* Success/Error Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/50 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Section */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6 mb-6">
                    <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/0 blur-2xl"></div>

                    <div className="relative">
                        <h2 className="text-xl font-semibold text-white mb-6">Profile</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-4">
                                    Profile Picture
                                </label>
                                <AvatarUpload
                                    currentAvatarUrl={profile.avatarUrl}
                                    onUploadComplete={handleAvatarUpload}
                                    userId={user.uid}
                                />
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={profile.displayName}
                                    onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    value={profile.bio}
                                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    maxLength={200}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    {profile.bio.length}/200 characters
                                </p>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px font-medium text-white shadow-[0_1000px_0_0_hsl(0_0%_100%_/_0%)_inset] transition-all hover:shadow-[0_1000px_0_0_hsl(0_0%_100%_/_2%)_inset] disabled:opacity-50"
                                >
                                    <div className="relative rounded-xl bg-slate-950/50 px-6 py-2 transition-colors group-hover:bg-transparent">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Account Info Section */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
                            <p className="text-white">@{userData?.username}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                            <p className="text-white">{user.email}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Member Since</label>
                            <p className="text-white">
                                {new Date(userData?.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
