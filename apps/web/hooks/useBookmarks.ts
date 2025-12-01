import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';

interface UseBookmarksReturn {
    bookmarked: boolean;
    toggleBookmark: () => Promise<void>;
    isLoading: boolean;
}

export function useBookmarks(postId: string): UseBookmarksReturn {
    const [bookmarked, setBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial bookmark status
    useEffect(() => {
        const fetchBookmarkStatus = async () => {
            try {
                const data = await fetchWithAuth(`/posts/${postId}/bookmarked`);
                setBookmarked(data.bookmarked || false);
            } catch (error) {
                // User might not be authenticated, or endpoint doesn't exist yet
                setBookmarked(false);
            }
        };

        fetchBookmarkStatus();
    }, [postId]);

    const toggleBookmark = async () => {
        // Optimistic update
        const previousBookmarked = bookmarked;
        setBookmarked(!bookmarked);
        setIsLoading(true);

        try {
            if (bookmarked) {
                // Remove bookmark
                await fetchWithAuth(`/posts/${postId}/bookmark`, {
                    method: 'DELETE',
                });
            } else {
                // Add bookmark
                await fetchWithAuth(`/posts/${postId}/bookmark`, {
                    method: 'POST',
                });
            }
        } catch (error) {
            // Rollback on error
            console.error('Failed to toggle bookmark:', error);
            setBookmarked(previousBookmarked);
        } finally {
            setIsLoading(false);
        }
    };

    return { bookmarked, toggleBookmark, isLoading };
}
