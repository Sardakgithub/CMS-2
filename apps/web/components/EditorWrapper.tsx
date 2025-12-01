'use client';

import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import type { EditorRef } from './Editor';

// Wrapper that properly handles refs and client-side only rendering
export const EditorWrapper = forwardRef<EditorRef, { data?: any; readOnly?: boolean }>((props, ref) => {
    const [Editor, setEditor] = useState<any>(null);
    const internalRef = useRef<EditorRef>(null);

    useEffect(() => {
        // Dynamically import Editor only on client side
        import('./Editor').then((mod) => {
            setEditor(() => mod.default);
        });
    }, []);

    useImperativeHandle(ref, () => ({
        save: async () => {
            if (internalRef.current) {
                return internalRef.current.save();
            }
            return null;
        }
    }));

    if (!Editor) {
        return <div className="p-4 text-slate-500">Loading editor...</div>;
    }

    return <Editor ref={internalRef} {...props} />;
});

EditorWrapper.displayName = 'EditorWrapper';
