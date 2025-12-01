import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllRooms() {
        return this.prisma.room.findMany({
            include: {
                participants: {
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
                },
                _count: {
                    select: {
                        participants: true,
                    },
                },
            },
        });
    }

    async getRoomById(roomId: string) {
        return this.prisma.room.findUnique({
            where: { id: roomId },
            include: {
                participants: {
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
                },
            },
        });
    }

    async joinRoom(userId: string, roomId: string, emoji?: string, status?: string) {
        try {
            // First check if the room exists
            const room = await this.prisma.room.findUnique({
                where: { id: roomId },
            });

            if (!room) {
                throw new Error('Room not found');
            }

            // Check if participant already exists
            const existingParticipant = await this.prisma.roomParticipant.findUnique({
                where: {
                    userId_roomId: {
                        userId,
                        roomId,
                    },
                },
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
            });

            let participant;
            
            if (existingParticipant) {
                // Update existing participant
                participant = await this.prisma.roomParticipant.update({
                    where: {
                        id: existingParticipant.id,
                    },
                    data: {
                        emoji: emoji || existingParticipant.emoji || '😊',
                        status: status || existingParticipant.status || 'chill',
                    },
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
                });
            } else {
                // Create new participant
                participant = await this.prisma.roomParticipant.create({
                    data: {
                        userId,
                        roomId,
                        emoji: emoji || '😊',
                        status: status || 'chill',
                    },
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
                });
            }

            // Update room active users count
            await this.updateRoomActiveUsers(roomId);

            return participant;
        } catch (error) {
            console.error('Error in joinRoom:', error);
            throw error;
        }
    }

    async leaveRoom(userId: string, roomId: string) {
        try {
            await this.prisma.roomParticipant.delete({
                where: {
                    userId_roomId: {
                        userId,
                        roomId,
                    },
                },
            });

            // Update room active users count
            await this.updateRoomActiveUsers(roomId);
        } catch (error) {
            // Silently ignore if record doesn't exist (user already left or never joined)
            if (error.code !== 'P2025') {
                throw error;
            }
        }
    }

    async updateParticipant(userId: string, roomId: string, data: { emoji?: string; status?: string }) {
        return this.prisma.roomParticipant.update({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                },
            },
            data,
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
        });
    }

    private async updateRoomActiveUsers(roomId: string) {
        const count = await this.prisma.roomParticipant.count({
            where: { roomId },
        });

        await this.prisma.room.update({
            where: { id: roomId },
            data: { activeUsers: count },
        });
    }

    async createRoom(name: string, type: string) {
        return this.prisma.room.create({
            data: {
                name,
                type,
            },
        });
    }
}
