"use client"
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import EditorJS from '@editorjs/editorjs'
// @ts-ignore
import Header from '@editorjs/header'
// @ts-ignore
import List from '@editorjs/list'
// @ts-ignore
import ImageTool from '@editorjs/image'
// @ts-ignore
import Embed from '@editorjs/embed'
// @ts-ignore
import Quote from '@editorjs/quote'
// @ts-ignore
import CodeTool from '@editorjs/code'

interface EditorProps {
  data?: any;
  readOnly?: boolean;
}

export interface EditorRef {
  save: () => Promise<any>;
}

const Editor = forwardRef<EditorRef, EditorProps>(({ data, readOnly }, ref) => {
  const editorRef = useRef<EditorJS | null>(null)
  const holderRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (editorRef.current) {
        return editorRef.current.save();
      }
      return null;
    }
  }));

  useEffect(() => {
    if (!editorRef.current && holderRef.current) {
      const editor = new EditorJS({
        holder: holderRef.current,
        data: data,
        readOnly: readOnly,
        tools: {
          header: Header,
          list: List,
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append('image', file);

                  try {
                    const auth = (await import('../lib/firebaseClient')).auth;
                    const user = auth.currentUser;
                    if (!user) throw new Error('Not authenticated');
                    const token = await user.getIdToken();

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload/image`, {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` },
                      body: formData,
                    });

                    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
                    return await response.json();
                  } catch (error) {
                    console.error('Upload error:', error);
                    throw error;
                  }
                },
              },
            },
          },
          embed: Embed,
          quote: Quote,
          code: CodeTool,
        },
        placeholder: 'Let your story begin...',
      });
      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
        editorRef.current = null;
      }
    };
  }, []);

  // Handle readOnly updates
  useEffect(() => {
    if (editorRef.current && editorRef.current.readOnly && typeof editorRef.current.readOnly.toggle === 'function') {
      editorRef.current.readOnly.toggle(readOnly);
    }
  }, [readOnly]);

  return <div ref={holderRef} className="prose max-w-none" />
})

Editor.displayName = 'Editor'

export default Editor
