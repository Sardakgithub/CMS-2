'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../lib/api';

export default function SetupPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || username.length < 3) {
            return setError('Username must be at least 3 characters');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return setError('Username can only contain letters, numbers, and underscores');
        }

        setLoading(true);
        setError('');

        try {
            await fetchWithAuth('/users', {
                method: 'POST',
                body: JSON.stringify({ username }),
            });

            // Success! Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Failed to create profile:', err);
            if (err.message.includes('already taken')) {
                setError('Username is already taken. Please choose another.');
            } else {
                setError('Failed to create profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Choose your username
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        This will be your unique identifier on Chronos
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                @
                            </span>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="johndoe"
                                required
                                minLength={3}
                                maxLength={30}
                                pattern="[a-zA-Z0-9_]+"
                            />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            3-30 characters. Letters, numbers, and underscores only.
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating profile...' : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
