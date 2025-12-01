import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }

    async getRoomMessages(roomId: string, limit = 50) {
        return this.prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                sender: {
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

    async createMessage(senderId: string, roomId: string, content: string, tone?: string) {
        return this.prisma.message.create({
            data: {
                senderId,
                roomId,
                content,
                originalContent: tone ? content : undefined,
                tone,
            },
            include: {
                sender: {
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

    async deleteMessage(messageId: string, userId: string) {
        // Verify the message belongs to the user
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message || message.senderId !== userId) {
            throw new Error('Unauthorized');
        }

        return this.prisma.message.delete({
            where: { id: messageId },
        });
    }
}
