import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(authorId: string, createPostDto: CreatePostDto) {
        return this.prisma.post.create({
            data: {
                ...createPostDto,
                authorId,
            },
        });
    }

    async findAll(authorId?: string) {
        return this.prisma.post.findMany({
            where: authorId ? { authorId } : {},
            include: {
                author: {
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

    async findOne(id: string) {
        return this.prisma.post.findUnique({
            where: { id },
            include: {
                author: {
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
        });
    }

    async update(id: string, updatePostDto: UpdatePostDto) {
        return this.prisma.post.update({
            where: { id },
            data: updatePostDto,
        });
    }

    async remove(id: string) {
        return this.prisma.post.delete({
            where: { id },
        });
    }

    async getLikeCount(postId: string) {
        const count = await this.prisma.like.count({
            where: { postId },
        });
        return { count };
    }

    async getLikedStatus(postId: string, userId: string) {
        const like = await this.prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        return { liked: !!like };
    }

    async likePost(postId: string, userId: string) {
        try {
            return await this.prisma.like.create({
                data: {
                    postId,
                    userId,
                },
            });
        } catch (error) {
            // If already liked, just return the existing one or null
            if (error.code === 'P2002') {
                return null;
            }
            throw error;
        }
    }

    async unlikePost(postId: string, userId: string) {
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
            // If not found, that's fine
            if (error.code === 'P2025') {
                return null;
            }
            throw error;
        }
    }
}
