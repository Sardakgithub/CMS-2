import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) { }

    async createComment(postId: string, authorId: string, content: string) {
        return this.prisma.comment.create({
            data: {
                postId,
                authorId,
                content,
            },
            include: {
                author: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
    }

    async getCommentsByPost(postId: string) {
        return this.prisma.comment.findMany({
            where: { postId },
            include: {
                author: {
                    include: {
                        profile: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async updateComment(commentId: string, authorId: string, content: string) {
        // Verify the user owns this comment
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.authorId !== authorId) {
            throw new Error('Unauthorized');
        }

        return this.prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                author: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
    }

    async deleteComment(commentId: string, authorId: string) {
        // Verify the user owns this comment
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.authorId !== authorId) {
            throw new Error('Unauthorized');
        }

        return this.prisma.comment.delete({
            where: { id: commentId },
        });
    }

    async getCommentCount(postId: string): Promise<number> {
        return this.prisma.comment.count({
            where: { postId },
        });
    }
}
