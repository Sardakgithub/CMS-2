import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
    constructor(private prisma: PrismaService) { }

    async likePost(userId: string, postId: string) {
        // Check if already liked
        const existing = await this.prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existing) {
            return existing; // Already liked
        }

        return this.prisma.like.create({
            data: {
                userId,
                postId,
            },
        });
    }

    async unlikePost(userId: string, postId: string) {
        try {
            return await this.prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
        } catch (error) {
            // Like doesn't exist, that's fine
            return null;
        }
    }

    async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
        const like = await this.prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        return !!like;
    }

    async getPostLikeCount(postId: string): Promise<number> {
        return this.prisma.like.count({
            where: { postId },
        });
    }

    async getPostLikes(postId: string) {
        return this.prisma.like.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profile: {
                            select: {
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
