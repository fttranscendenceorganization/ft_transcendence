import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameService } from "./game.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { GameModeEnum } from "./types/game-mode.enum";
import { OnModuleInit } from "@nestjs/common";
import { GameSessionType } from "./types/game-session.type";
import { Logger } from "nestjs-pino";

@WebSocketGateway({
    cors: {
        origin: true,
        credentials: true,
    },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server: Server;

    private readonly jwtService: JwtService;

    constructor(
        private readonly gameService: GameService,
        private readonly configService: ConfigService,
        private readonly logger: Logger,
    ) {
        const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
        this.jwtService = new JwtService({ secret });
    }

    onModuleInit() {
        this.gameService.setBroadcastCallback((gameId: string, game: GameSessionType) => {
            const leftSocketId = this.gameService.getSocketId(game.playerLeft.userId);
            const rightSocketId = this.gameService.getSocketId(game.playerRight.userId);

            if (leftSocketId) this.server.to(leftSocketId).emit('gameState', game.state);
            if (rightSocketId) this.server.to(rightSocketId).emit('gameState', game.state);
        });

        this.gameService.setNotifyCallback((socketId: string, event: string, data: any) => {
            this.server.to(socketId).emit(event, data);
        });
    }

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token as string | undefined;

            if (!token) {
                client.disconnect(true);
                return;
            }

            const payload: any = this.jwtService.verify(token);
            const userId: string | undefined = payload?.sub;

            if (!userId) {
                client.disconnect(true);
                return;
            }

            client.data.user = { id: userId, username: payload.username };
            const result = this.gameService.registerPlayer(userId, client.id);
            if (result.rejected) {
                const oldSocket = result.oldSocketId
                    ? this.server.sockets.sockets.get(result.oldSocketId)
                    : null;
                if (oldSocket && oldSocket.connected) {
                    this.logger.warn('Duplicate game connection rejected', { context: 'GameGateway', userId });
                    client.data.user = null;
                    client.emit('alreadyInGame', { message: 'You already have an active game session in another window.' });
                    client.disconnect(true);
                    return;
                }
                this.logger.log('Replacing stale player session', { context: 'GameGateway', userId });
                this.gameService.unregisterPlayer(userId);
                this.gameService.registerPlayer(userId, client.id);
            }
            this.logger.log('Player connected to game', { context: 'GameGateway', userId });
        } catch (error) {
            this.logger.warn('Unauthorized game WebSocket connection attempt', { context: 'GameGateway' });
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket) {
        const user = client.data?.user;
        if (user?.id) {
            this.gameService.unregisterPlayer(user.id);
            this.logger.log('Player disconnected from game', { context: 'GameGateway', userId: user.id });
        }
    }

    @SubscribeMessage('joinQueue')
    handleJoinQueue(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { mode: GameModeEnum }
    ) {
        const userId = client.data?.user?.id;
        if (!userId) return;

        if (!Object.values(GameModeEnum).includes(data?.mode)) {
            client.emit('error', { message: 'Invalid game mode' });
            return;
        }

        this.gameService.joinQueue(userId, data.mode);
        client.emit('queueJoined', { mode: data.mode });

        const game = this.gameService.getPlayerGame(userId);
        if (game) {
            const leftSocketId = this.gameService.getSocketId(game.playerLeft.userId);
            const rightSocketId = this.gameService.getSocketId(game.playerRight.userId);

            if (leftSocketId)
                this.server.to(leftSocketId).emit('gameFound', {
                    gameId: game.id,
                    side: 'left',
                    mode: game.mode,
                    opponentId: game.playerRight.userId,
                });
            if (rightSocketId)
                this.server.to(rightSocketId).emit('gameFound', {
                    gameId: game.id,
                    side: 'right',
                    mode: game.mode,
                    opponentId: game.playerLeft.userId,
                });
        }
    }

    @SubscribeMessage('leaveQueue')
    handleLeaveQueue(@ConnectedSocket() client: Socket) {
        const userId = client.data?.user?.id;
        if (!userId) return;

        this.gameService.leaveQueue(userId);
        client.emit('queueLeft', {});
    }

    @SubscribeMessage('setReady')
    handleSetReady(@ConnectedSocket() client: Socket) {
        const userId = client.data?.user?.id;
        if (!userId) return;

        this.gameService.setPlayerReady(userId);
    }

    @SubscribeMessage('movePaddle')
    handleMovePaddle(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { x: number, y: number }
    ) {
        const userId = client.data?.user?.id;
        if (!userId) return;

        if (typeof data?.x !== 'number' || typeof data?.y !== 'number') return;

        const game = this.gameService.getPlayerGame(userId);
        if (!game) return;

        this.gameService.updatePaddlePosition(game, userId, data.x, data.y);
    }

    @SubscribeMessage('forfeit')
    handleForfeit(@ConnectedSocket() client: Socket) {
        const userId = client.data?.user?.id;
        if (!userId) return;

        this.gameService.forfeitGame(userId);
    }

    @SubscribeMessage('playAi')
    handlePlayAi(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { mode: GameModeEnum; difficulty?: 'easy' | 'hard' }
    ) {
        const userId = client.data?.user?.id;
        if (!userId) return;

        if (!Object.values(GameModeEnum).includes(data?.mode)) {
            client.emit('error', { message: 'Invalid game mode' });
            return;
        }

        const difficulty = data.difficulty === 'easy' ? 'easy' : 'hard';
        const game = this.gameService.createAiGame(userId, data.mode, difficulty);
        if (!game) {
            client.emit('error', { message: 'Could not create AI game' });
            return;
        }

        client.emit('gameFound', {
            gameId: game.id,
            side: 'left',
            mode: game.mode,
            opponentId: '__AI_OPPONENT__',
        });
    }
}