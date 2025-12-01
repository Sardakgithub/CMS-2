'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../lib/api';
import { EditorRef } from '../../components/Editor';
import { EditorWrapper } from '../../components/EditorWrapper';

export default function NewPostPage() {
    const editorRef = useRef<EditorRef>(null);
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const handlePublish = async () => {
        if (!editorRef.current) return;

        setSaving(true);
        try {
            const data = await editorRef.current.save();
            await fetchWithAuth('/posts', {
                method: 'POST',
                body: JSON.stringify({
                    contentJson: data,
                    visibility: 'public',
                }),
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to publish:', error);
            alert('Failed to publish post');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Create New Post
                        </h1>
                        <p className="text-slate-400 mt-1">Share your thoughts with the world</p>
                    </div>
                    <button
                        onClick={handlePublish}
                        disabled={saving}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px font-medium text-white shadow-[0_1000px_0_0_hsl(0_0%_100%_/_0%)_inset] transition-all hover:shadow-[0_1000px_0_0_hsl(0_0%_100%_/_2%)_inset] disabled:opacity-50"
                    >
                        <div className="relative rounded-xl bg-slate-950/50 px-6 py-2 transition-colors group-hover:bg-transparent">
                            <span className="relative flex items-center gap-2">
                                {saving ? 'Publishing...' : 'Publish'}
                                {!saving && (
                                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                )}
                            </span>
                        </div>
                    </button>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-2xl border border-slate-800/50">
                    {/* Gradient glow effects */}
                    <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/0 blur-2xl"></div>
                    <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/0 blur-2xl"></div>

                    <div className="relative p-6 min-h-[500px]">
                        <EditorWrapper ref={editorRef} />
                    </div>
                </div>

                {/* Tips */}
                <div className="mt-6 rounded-xl bg-slate-900/50 border border-slate-800/50 p-4">
                    <div className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-white">Pro Tips</p>
                            <ul className="mt-2 space-y-1 text-sm text-slate-400">
                                <li>• Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs">Tab</kbd> to see available block types</li>
                                <li>• Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-xs">Enter</kbd> to create a new block</li>
                                <li>• Drag blocks to reorder them</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
