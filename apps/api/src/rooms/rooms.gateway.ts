import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class RoomsGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly roomsService: RoomsService,
        private readonly chatService: ChatService,
    ) { }

    @SubscribeMessage('room:join')
    async handleJoinRoom(
        @MessageBody() data: { userId: string; roomId: string; emoji?: string; status?: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const participant = await this.roomsService.joinRoom(
                data.userId,
                data.roomId,
                data.emoji,
                data.status,
            );

            // Join the socket room
            client.join(data.roomId);

            // Notify all users in the room
            this.server.to(data.roomId).emit('room:user-joined', {
                participant,
                roomId: data.roomId,
            });

            // Send current room state to the joining user
            const room = await this.roomsService.getRoomById(data.roomId);

            // Send recent messages
            const messages = await this.chatService.getRoomMessages(data.roomId, 20);

            return { success: true, room, messages: messages.reverse() };
        } catch (error) {
            console.error('Error joining room:', error);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('room:leave')
    async handleLeaveRoom(
        @MessageBody() data: { userId: string; roomId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            await this.roomsService.leaveRoom(data.userId, data.roomId);

            // Leave the socket room
            client.leave(data.roomId);

            // Notify all users in the room
            this.server.to(data.roomId).emit('room:user-left', {
                userId: data.userId,
                roomId: data.roomId,
            });

            return { success: true };
        } catch (error) {
            console.error('Error leaving room:', error);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('room:update')
    async handleUpdateParticipant(
        @MessageBody() data: { userId: string; roomId: string; emoji?: string; status?: string },
    ) {
        try {
            const participant = await this.roomsService.updateParticipant(data.userId, data.roomId, {
                emoji: data.emoji,
                status: data.status,
            });

            // Notify all users in the room
            this.server.to(data.roomId).emit('room:user-updated', {
                participant,
                roomId: data.roomId,
            });

            return { success: true, participant };
        } catch (error) {
            console.error('Error updating participant:', error);
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('room:message')
    async handleMessage(
        @MessageBody() data: { userId: string; roomId: string; content: string },
    ) {
        try {
            const message = await this.chatService.createMessage(
                data.userId,
                data.roomId,
                data.content,
            );

            // Broadcast message to all users in the room
            this.server.to(data.roomId).emit('room:new-message', {
                message,
                roomId: data.roomId,
            });

            return { success: true, message };
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: error.message };
        }
    }
}
