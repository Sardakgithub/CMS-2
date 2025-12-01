import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
    constructor(private readonly prisma: PrismaService) { }

    async bookmarkPost(userId: string, postId: string) {
        return this.prisma.bookmark.create({
            data: {
                userId,
                postId,
            },
        });
    }

    async unbookmarkPost(userId: string, postId: string) {
        return this.prisma.bookmark.delete({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
    }

    async hasUserBookmarkedPost(userId: string, postId: string): Promise<boolean> {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });
        return !!bookmark;
    }

    async getUserBookmarks(userId: string) {
        return this.prisma.bookmark.findMany({
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
    }
}
