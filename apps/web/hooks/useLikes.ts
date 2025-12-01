import { useState, useEffect } from 'react';
import { fetchWithAuth, fetchPublic } from '../lib/api';

interface UseLikesReturn {
    liked: boolean;
    likeCount: number;
    toggleLike: () => Promise<void>;
    isLoading: boolean;
}

export function useLikes(postId: string): UseLikesReturn {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial like status and count
    useEffect(() => {
        const fetchLikeData = async () => {
            try {
                // Fetch like count (public endpoint)
                const likesData = await fetchPublic(`/posts/${postId}/likes`);
                setLikeCount(likesData.count || 0);

                // Fetch user's like status (authenticated endpoint)
                try {
                    const likedData = await fetchWithAuth(`/posts/${postId}/liked`);
                    setLiked(likedData.liked || false);
                } catch (error) {
                    // User might not be authenticated, that's okay
                    setLiked(false);
                }
            } catch (error) {
                console.error('Failed to fetch like data:', error);
            }
        };

        fetchLikeData();
    }, [postId]);

    const toggleLike = async () => {
        // Optimistic update
        const previousLiked = liked;
        const previousCount = likeCount;

        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        setIsLoading(true);

        try {
            if (liked) {
                // Unlike
                await fetchWithAuth(`/posts/${postId}/like`, {
                    method: 'DELETE',
                });
            } else {
                // Like
                await fetchWithAuth(`/posts/${postId}/like`, {
                    method: 'POST',
                });
            }
        } catch (error) {
            // Rollback on error
            console.error('Failed to toggle like:', error);
            setLiked(previousLiked);
            setLikeCount(previousCount);
        } finally {
            setIsLoading(false);
        }
    };

    return { liked, likeCount, toggleLike, isLoading };
}
