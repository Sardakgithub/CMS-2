'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '../../../../lib/api';
import { EditorRef } from '../../../../components/Editor';
import { EditorWrapper } from '../../../../components/EditorWrapper';

export default function EditPostPage() {
    const editorRef = useRef<EditorRef>(null);
    const router = useRouter();
    const params = useParams();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<any>(null);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const data = await fetchWithAuth(`/posts/${params.id}`);
                setPost(data);
            } catch (error) {
                console.error('Failed to load post:', error);
                alert('Failed to load post');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        loadPost();
    }, [params.id, router]);

    const handleSave = async () => {
        if (!editorRef.current) return;

        setSaving(true);
        try {
            const data = await editorRef.current.save();
            await fetchWithAuth(`/posts/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    contentJson: data,
                }),
            });
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to update post:', error);
            alert('Failed to update post');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Edit Post
                        </h1>
                        <p className="text-slate-400 mt-1">Make changes to your post</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px font-medium text-white shadow-[0_1000px_0_0_hsl(0_0%_100%_/_0%)_inset] transition-all hover:shadow-[0_1000px_0_0_hsl(0_0%_100%_/_2%)_inset] disabled:opacity-50"
                        >
                            <div className="relative rounded-xl bg-slate-950/50 px-6 py-2 transition-colors group-hover:bg-transparent">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </div>
                        </button>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-2xl border border-slate-800/50">
                    <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/0 blur-2xl"></div>
                    <div className="absolute -right-16 -bottom-16 h-32 w-32 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/0 blur-2xl"></div>

                    <div className="relative p-6 min-h-[500px]">
                        {post && <EditorWrapper ref={editorRef} data={post.contentJson} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
