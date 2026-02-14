import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";


@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
		server: Server;

    private readonly jwtService: JwtService;
    private readonly onlineUsers: Map<string, Set<string>> = new Map();

    constructor(
        private readonly chatService: ChatService,
        private readonly configService: ConfigService,
    ){
        const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
        this.jwtService = new JwtService({ secret });
    }

    async handleConnection(client: Socket): Promise<void>
    {
        try {
            const token = client.handshake.auth?.token as string | undefined;

            if (!token)
            {
                client.disconnect(true);
                return;
            }

            const payload: any = this.jwtService.verify(token);
            const userId: string | undefined = payload?.sub;

            if (!userId)
            {
                client.disconnect(true);
                return;
            }

            client.data.user = { id: userId };

            const existing = this.onlineUsers.get(userId) ?? new Set<string>();
            const wasOffline = existing.size === 0;
            existing.add(client.id);
            this.onlineUsers.set(userId, existing);

            client.emit('presenceSnapshot', {
                onlineUserIds: Array.from(this.onlineUsers.keys()),
            });

            if (wasOffline)
            {
                this.server.emit('presenceUpdate', { userId, isOnline: true });
            }
        } catch (error) {
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket): void
    {
        const user = client.data.user as { id?: string } | undefined;
        const userId = user?.id;

        if (!userId)
            return;

        const connections = this.onlineUsers.get(userId);
        if (!connections)
            return;

        connections.delete(client.id);

        if (connections.size === 0)
        {
            this.onlineUsers.delete(userId);
            this.server.emit('presenceUpdate', { userId, isOnline: false });
        }
    }

    @SubscribeMessage('joinConversation')
    handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody('conversationId') conversationId: string)
    {
        if (!conversationId)
            return;

        client.join(conversationId);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; content: string; replyToMessageId?: string })
    {
        const user = client.data.user as { id?: string } | undefined;
        const userId = user?.id;

        if (!userId || !data?.conversationId || !data?.content)
            return;

        const message = await this.chatService.sendMessage(
            userId,
            data.conversationId,
            data.content,
            data.replyToMessageId,
        );

        this.server.to(data.conversationId).emit('newMessage', message);
    }

    @SubscribeMessage('reactToMessage')
    async handleReactToMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { messageId: string; emoji: string },
    ) {
        const user = client.data.user as { id?: string } | undefined;
        const userId = user?.id;

        if (!userId || !data?.messageId || !data?.emoji)
            return;

        const result = await this.chatService.toggleReaction(userId, data.messageId, data.emoji);

        this.server.to(result.conversationId).emit('messageReactionUpdate', result);
    }

}
