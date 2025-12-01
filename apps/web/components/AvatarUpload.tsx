'use client';

import { useState, useRef } from 'react';

interface AvatarUploadProps {
    currentAvatarUrl?: string;
    onUploadComplete: (url: string) => void;
    userId: string;
}

export default function AvatarUpload({ currentAvatarUrl, onUploadComplete, userId }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        uploadAvatar(file);
    };

    const uploadAvatar = async (file: File) => {
        console.log('Starting avatar upload...', file.name, file.size);
        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', file);

            // Show progress simulation
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            // Get Firebase token
            const { auth } = await import('../lib/firebaseClient');
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');
            const token = await user.getIdToken();

            // Upload using raw fetch
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error(await response.text() || 'Upload failed');
            }

            const data = await response.json();
            setProgress(100);

            console.log('Upload complete! URL:', data.file.url);
            onUploadComplete(data.file.url);

            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 500);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Failed to upload avatar: ${error.message || 'Unknown error'}`);
            setUploading(false);
            setProgress(0);
        }
    };

    const handleDelete = async () => {
        if (!currentAvatarUrl || !confirm('Delete avatar?')) return;

        setPreview(null);
        onUploadComplete('');
    };

    return (
        <div className="flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-sm group-hover:opacity-50 transition-opacity"></div>
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-slate-900">
                    {preview ? (
                        <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-emerald-500">
                            {userId[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-full">
                        <div className="text-white text-sm font-medium">{Math.round(progress)}%</div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                </button>

                {preview && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={uploading}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Remove
                    </button>
                )}

                <p className="text-xs text-slate-500">JPG, PNG or WebP. Max 5MB.</p>
            </div>
        </div>
    );
}
