import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findOne(username: string) {
        return this.prisma.user.findUnique({
            where: { username },
            include: {
                profile: true,
                _count: {
                    select: { followers: true, following: true, posts: true },
                },
            },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
            },
        });
    }

    async create(data: { id: string; username: string; email?: string }) {
        return this.prisma.user.create({
            data: {
                id: data.id,
                username: data.username,
                // email is not in schema, maybe add it? Schema has username only.
                // Assuming username is unique.
                profile: {
                    create: {},
                },
                settings: {
                    create: {},
                },
            },
        });
    }

    async updateProfile(userId: string, data: { bio?: string; avatarUrl?: string; displayName?: string }) {
        const { displayName, ...profileData } = data;

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                displayName,
            },
        });

        return this.prisma.profile.update({
            where: { userId },
            data: profileData,
        });
    }

    async getUserStats(userId: string) {
        // Get total posts
        const postsCount = await this.prisma.post.count({
            where: { authorId: userId },
        });

        // Get total likes received on user's posts
        const userPosts = await this.prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true },
        });

        const postIds = userPosts.map(p => p.id);
        const totalLikes = await this.prisma.like.count({
            where: { postId: { in: postIds } },
        });

        return {
            postsCount,
            totalLikes,
        };
    }

    async getUserLikedPosts(userId: string) {
        const likes = await this.prisma.like.findMany({
            where: { userId },
            include: {
                post: {
                    include: {
                        author: {
                            include: {
                                profile: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return likes.map(like => like.post);
    }

    async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) {
            throw new Error('Cannot follow yourself');
        }

        return this.prisma.follow.create({
            data: {
                followerId,
                followingId,
            },
        });
    }

    async unfollowUser(followerId: string, followingId: string) {
        return this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    async isFollowing(followerId: string, followingId: string) {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        return !!follow;
    }
}
