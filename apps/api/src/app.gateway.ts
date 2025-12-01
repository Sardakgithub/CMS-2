import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers = new Map<string, string>(); // socketId -> userId

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        const userId = this.connectedUsers.get(client.id);
        if (userId) {
            this.connectedUsers.delete(client.id);
            this.server.emit('user:offline', { userId });
        }
    }

    @SubscribeMessage('auth:register')
    handleAuth(client: Socket, payload: { userId: string }) {
        this.connectedUsers.set(client.id, payload.userId);
        this.server.emit('user:online', { userId: payload.userId });
        return { success: true };
    }

    // Quest-related events will be added in QuestsGateway
    // Room-related events will be added in RoomsGateway
}
