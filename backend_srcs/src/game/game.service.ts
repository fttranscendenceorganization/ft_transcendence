import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Game } from "./entities/game.entity";
import { Repository } from "typeorm";
import { UserService } from "src/user/user.service";
import { PlayerSessionType } from "./types/player-session.type";
import { GameSessionType } from "./types/game-session.type";
import { GameStatusEnum } from "./types/game-status.enum";
import { PlayerStatusEnum } from "./types/player-status.enum";
import { GameModeEnum } from "./types/game-mode.enum";
import { GameStateType } from "./types/game-state.type";
import { randomUUID } from 'crypto';
import { Logger } from "nestjs-pino";
import { MetricsService } from "src/metrics/metrics.service";

@Injectable()
export class GameService implements OnModuleDestroy {
    constructor(
        @InjectRepository(Game)
        private readonly gamerepo: Repository<Game>,
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly metricsService: MetricsService,
    ) {
        this.lastTickTime = Date.now();
        this.physicsInterval = setInterval(() => {
            this.handleGamesUpdate();
        }, 16);
    }

    static readonly AI_USER_ID = '__AI_OPPONENT__';

    private readonly players = new Map<string, PlayerSessionType>();
    private readonly games = new Map<string, GameSessionType>();
    private readonly matchmakingQueues = new Map<GameModeEnum, string[]>();

    private broadcastCallback: ((gameId: string, state: GameSessionType) => void) | null = null;
    private physicsInterval: NodeJS.Timeout;
    private notifyCallback: ((socketId: string, event: string, data: any) => void) | null = null;
    private lastTickTime: number = Date.now();

    registerPlayer(userId: string, socketId: string): { rejected: boolean; oldSocketId?: string } {
        const existingPlayer = this.players.get(userId);

        if (existingPlayer) {
            this.logger.warn('Player already has an active connection, rejecting new one', { context: 'GameService', userId });
            return { rejected: true, oldSocketId: existingPlayer.socketId };
        }

        const newPlayer: PlayerSessionType = {
            userId: userId,
            socketId: socketId,
            status: PlayerStatusEnum.IDLE,
            currentGameId: null,
            lastSeenAt: new Date()
        };
        this.players.set(userId, newPlayer);
        return { rejected: false };
    }

    unregisterPlayer(userId: string) {
        const existingPlayer = this.players.get(userId);

        if (!existingPlayer)
            return;

        this.logger.log('Player disconnected', { context: 'GameService', userId, status: existingPlayer.status });

        switch (existingPlayer.status) {
            case PlayerStatusEnum.IDLE:
                this.players.delete(userId);
                break;

            case PlayerStatusEnum.IN_QUEUE:
                this.matchmakingQueues.forEach((queue, mode) => {
                    const index = queue.indexOf(userId);
                    if (index !== -1) {
                        queue.splice(index, 1);
                        this.logger.log('Player removed from queue on disconnect', { context: 'GameService', userId, mode });
                        this.metricsService.decrementQueueSize();
                    }
                });
                this.players.delete(userId);
                break;

            case PlayerStatusEnum.IN_GAME:
                void this.handlePlayerDisconnectFromGame(existingPlayer);
                this.players.delete(userId);
                break;
        }
    }

    private getInitialState(): GameStateType {
        return {
            ballPosition: { x: 500, y: 300 },
            ballVelocity: { x: 0, y: 0 },
            ballSpeed: 14,
            paddleLeft: { x: 50, y: 300, targetX: 50, targetY: 300 },
            paddleRight: { x: 950, y: 300, targetX: 950, targetY: 300 },
            score: { left: 0, right: 0 },
            ballRadius: 25,
            paddleRadius: 45,
            elapsedTimeSeconds: 0
        };
    }

    private handleGamesUpdate() {
        const now = Date.now();
        const deltaMs = Math.min(now - this.lastTickTime, 50);
        this.lastTickTime = now;

        for (const [gameId, game] of this.games) {
            if (game.status === GameStatusEnum.IN_PROGRESS) {
                if (game.isAiGame) {
                    this.computeAiPaddle(game, deltaMs);
                }
                this.updateGamePhysics(game, deltaMs);
                if (this.broadcastCallback)
                    this.broadcastCallback(gameId, game);
            }
        }
    }

    setPlayerReady(userId: string) {
        const player = this.players.get(userId);
        if (!player || !player.currentGameId)
            return;

        const game = this.games.get(player.currentGameId);
        if (!game)
            return;

        if (game.status !== GameStatusEnum.READY_CHECK) return;

        if (userId === game.playerRight.userId)
            game.playerRight.isReady = true;
        if (userId === game.playerLeft.userId)
            game.playerLeft.isReady = true;

        if (game.playerRight.isReady && game.playerLeft.isReady) {
            game.status = GameStatusEnum.IN_PROGRESS;
            this.logger.log('Game started - both players ready', { context: 'GameService', gameId: game.id });
            this.metricsService.incrementActiveGames();
        }
    }

    private updateGamePhysics(game: GameSessionType, deltaMs: number) {
        game.state.elapsedTimeSeconds += deltaMs / 1000;

        const { ballPosition, ballVelocity, score } = game.state;
        const { ballSpeed, ballRadius, paddleLeft, paddleRight, paddleRadius } = game.state;

        const PADDLE_SPEED = 18 * (deltaMs / 16);
        const AI_SPEED = PADDLE_SPEED * (game.aiDifficulty === 'easy' ? 0.55 : 0.7);
        function smoothPaddle(paddle, speed: number = PADDLE_SPEED) {
            if (paddle.targetX === undefined) return;
            const dx = paddle.targetX - paddle.x;
            const dy = paddle.targetY - paddle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < speed) {
                paddle.x = paddle.targetX;
                paddle.y = paddle.targetY;
            } else {
                paddle.x += (dx / dist) * speed;
                paddle.y += (dy / dist) * speed;
            }
        }
        smoothPaddle(paddleLeft);
        smoothPaddle(paddleRight, game.isAiGame ? AI_SPEED : PADDLE_SPEED);

        const scale = deltaMs / 16;
        ballPosition.x += ballVelocity.x * scale;
        ballPosition.y += ballVelocity.y * scale;

        if (ballPosition.y <= ballRadius) {
            ballVelocity.y *= -1;
            ballPosition.y = ballRadius;
        } else if (ballPosition.y >= 600 - ballRadius) {
            ballVelocity.y *= -1;
            ballPosition.y = 600 - ballRadius;
        }

        if (ballPosition.x <= ballRadius) {
            if (ballPosition.y > 200 && ballPosition.y < 400) {
                score.right += 1;
                this.resetBall(game.state);
                return;
            } else {
                ballVelocity.x *= -1;
                ballPosition.x = ballRadius;
            }
        } else if (ballPosition.x >= 1000 - ballRadius) {
            if (ballPosition.y > 200 && ballPosition.y < 400) {
                score.left += 1;
                this.resetBall(game.state);
                return;
            } else {
                ballVelocity.x *= -1;
                ballPosition.x = 1000 - ballRadius;
            }
        }

        const paddles = [paddleLeft, paddleRight];
        paddles.forEach(paddle => {
            const dx = ballPosition.x - paddle.x;
            const dy = ballPosition.y - paddle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ballRadius + paddleRadius;

            if (distance < minDistance) {
                const nx = distance === 0 ? 1 : dx / distance;
                const ny = distance === 0 ? 0 : dy / distance;
                ballVelocity.x = nx * ballSpeed;
                ballVelocity.y = ny * ballSpeed;
                ballPosition.x = paddle.x + nx * minDistance;
                ballPosition.y = paddle.y + ny * minDistance;
            }
        });

        const currentSpeed = Math.sqrt(ballVelocity.x * ballVelocity.x + ballVelocity.y * ballVelocity.y);
        const MIN_BALL_SPEED = 10;
        if (currentSpeed > 0.5 && currentSpeed < MIN_BALL_SPEED) {
            const scale = MIN_BALL_SPEED / currentSpeed;
            ballVelocity.x *= scale;
            ballVelocity.y *= scale;
        }

        if (score.left >= game.config.maxScore || score.right >= game.config.maxScore) {
            const winnerUserId = score.left > score.right
                ? game.playerLeft.userId
                : game.playerRight.userId;
            this.finishGame(game.id, winnerUserId);
        }
    }

    updatePaddlePosition(game: GameSessionType, playerId: string, newX: number, newY: number) {
        const { paddleLeft, paddleRight, paddleRadius } = game.state;
        const isLeft = (playerId === game.playerLeft.userId);
        const paddle = isLeft ? paddleLeft : paddleRight;

        let valY = newY;
        if (valY < paddleRadius) valY = paddleRadius;
        if (valY > 600 - paddleRadius) valY = 600 - paddleRadius;

        let valX = newX;
        if (isLeft) {
            if (valX < paddleRadius) valX = paddleRadius;
            if (valX > 500 - paddleRadius) valX = 500 - paddleRadius;
        } else {
            if (valX < 500 + paddleRadius) valX = 500 + paddleRadius;
            if (valX > 1000 - paddleRadius) valX = 1000 - paddleRadius;
        }

        paddle.targetX = valX;
        paddle.targetY = valY;
    }

    private resetBall(state: GameStateType) {
        state.ballPosition.x = 500;
        state.ballPosition.y = 300;
        state.ballVelocity.x = 0;
        state.ballVelocity.y = 0;
        state.paddleLeft.y = 300;
        state.paddleLeft.x = 50;
        state.paddleRight.y = 300;
        state.paddleRight.x = 950;
    }

    private aiState = new Map<string, {
        targetY: number;
        targetX: number;
        lastReactionTime: number;
        hitOffset: number;
        approachLocked: boolean;
    }>();

    private computeAiPaddle(game: GameSessionType, deltaMs: number) {
        const { ballPosition, ballVelocity, paddleRight, paddleRadius } = game.state;

        let ai = this.aiState.get(game.id);
        if (!ai) {
            ai = {
                targetY: 300, targetX: 850, lastReactionTime: 0,
                hitOffset: 0, approachLocked: false,
            };
            this.aiState.set(game.id, ai);
        }

        const isEasy = game.aiDifficulty === 'easy';

        const REACTION_DELAY_MS = isEasy ? 350 : 200;
        const MISS_CHANCE = isEasy ? 0.40 : 0.20;
        const HIT_OFFSET_RANGE = isEasy ? 90 : 60;
        const MISS_OFFSET_MIN = isEasy ? 50 : 60;
        const MISS_OFFSET_EXTRA = isEasy ? 40 : 30;
        const LOOKAHEAD_FRAMES = isEasy ? 3 : 6;
        const DEFENSE_INACCURACY = isEasy ? 120 : 60;

        ai.lastReactionTime += deltaMs;

        if (ai.lastReactionTime >= REACTION_DELAY_MS) {
            ai.lastReactionTime = 0;

            const ballStopped = ballVelocity.x === 0 && ballVelocity.y === 0;
            const ballOnAiHalf = ballPosition.x > 500;

            if (ballStopped) {
                ai.approachLocked = false;
                ai.targetY = ballPosition.y + (Math.random() - 0.5) * (isEasy ? 80 : 30);
                ai.targetX = Math.max(500 + paddleRadius, Math.min(1000 - paddleRadius, ballPosition.x));

            } else if (ballOnAiHalf) {

                const ballInCorner = ballPosition.x > 850
                    && (ballPosition.y < 200 || ballPosition.y > 400);

                if (ballInCorner) {
                    ai.targetY = 300 + (Math.random() - 0.5) * 80;
                    ai.targetX = 920 + Math.random() * 30;
                    ai.approachLocked = false;
                } else {
                    if (!ai.approachLocked) {
                        ai.approachLocked = true;

                        if (Math.random() < (1 - MISS_CHANCE)) {
                            ai.hitOffset = (Math.random() - 0.5) * HIT_OFFSET_RANGE;
                        } else {
                            const sign = Math.random() < 0.5 ? -1 : 1;
                            ai.hitOffset = sign * (MISS_OFFSET_MIN + Math.random() * MISS_OFFSET_EXTRA);
                        }
                    }

                    const roughY = ballPosition.y + ballVelocity.y * LOOKAHEAD_FRAMES;
                    const roughX = ballPosition.x + ballVelocity.x * LOOKAHEAD_FRAMES;

                    ai.targetY = roughY + ai.hitOffset;
                    ai.targetX = roughX + 30 + Math.random() * 30;
                }

            } else {
                ai.approachLocked = false;

                ai.targetX = 860 + (Math.random() - 0.5) * 40;
                ai.targetY = ballPosition.y + (Math.random() - 0.5) * DEFENSE_INACCURACY;
            }

            ai.targetY = Math.max(paddleRadius, Math.min(600 - paddleRadius, ai.targetY));
            ai.targetX = Math.max(500 + paddleRadius, Math.min(1000 - paddleRadius, ai.targetX));
        }

        paddleRight.targetX = ai.targetX;
        paddleRight.targetY = ai.targetY;
    }


    private cleanupGameSessions(game: GameSessionType) {
        const leftPlayer = this.players.get(game.playerLeft.userId);
        if (leftPlayer) {
            leftPlayer.status = PlayerStatusEnum.IDLE;
            leftPlayer.currentGameId = null;
        }

        if (!game.isAiGame) {
            const rightPlayer = this.players.get(game.playerRight.userId);
            if (rightPlayer) {
                rightPlayer.status = PlayerStatusEnum.IDLE;
                rightPlayer.currentGameId = null;
            }
        }

        this.games.delete(game.id);
    }

    onModuleDestroy() {
        clearInterval(this.physicsInterval);
    }

    setNotifyCallback(cb: (socketId: string, event: string, data: any) => void) {
        this.notifyCallback = cb;
    }

    private async finishGame(gameId: string, winnerUserId: string | null) {
        const game = this.games.get(gameId);
        if (!game) return;
        if (game.status === GameStatusEnum.FINISHED || game.status === GameStatusEnum.ABORTED) return;

        game.status = GameStatusEnum.FINISHED;

        this.logger.log('Game finished', { context: 'GameService', gameId, winnerUserId, score: game.state.score });
        this.metricsService.decrementActiveGames();
        this.metricsService.incrementGamesCompleted();

        if (this.notifyCallback) {
            const leftSocketId = this.getSocketId(game.playerLeft.userId);
            const rightSocketId = this.getSocketId(game.playerRight.userId);
            const payload = { winnerId: winnerUserId, score: { left: game.state.score.left, right: game.state.score.right } };
            if (leftSocketId) this.notifyCallback(leftSocketId, 'gameOver', payload);
            if (rightSocketId) this.notifyCallback(rightSocketId, 'gameOver', payload);
        }

        this.cleanupGameSessions(game);

        if (game.isAiGame) {
            this.aiState.delete(game.id);
            return;
        }

        try {
            const userA = await this.userService.findById(game.playerLeft.userId);
            const userB = await this.userService.findById(game.playerRight.userId);
            if (!userA || !userB) return;

            const leftScore = game.state.score.left;
            const rightScore = game.state.score.right;
            const winnerUser = winnerUserId === game.playerLeft.userId ? userA : userB;
            const loserUser = winnerUserId === game.playerLeft.userId ? userB : userA;
            const winnerScore = winnerUserId === game.playerLeft.userId ? leftScore : rightScore;
            const loserScore = winnerUserId === game.playerLeft.userId ? rightScore : leftScore;

            const winXP = Math.max(10, 20 + (winnerScore - loserScore) * 5);
            const loseXP = loserScore * 0.5;

            const playerAXpEarned = winnerUserId === game.playerLeft.userId ? winXP : loseXP;
            const playerBXpEarned = winnerUserId === game.playerRight.userId ? winXP : loseXP;

            try {
                await this.userService.updateUserAfterGame(
                    winnerUserId ?? '',
                    loserUser.id,
                    winnerScore,
                    loserScore,
                    game.mode,
                );
            } catch (err) {
                this.logger.error('Failed to update user stats after game', { context: 'GameService', gameId, error: err });
            }

            const gameRecord = this.gamerepo.create({
                mode: game.mode,
                status: GameStatusEnum.FINISHED,
                playerA: userA,
                playerB: userB,
                winner: winnerUser,
                playerAScore: leftScore,
                playerBScore: rightScore,
                playerAXpEarned,
                playerBXpEarned,
            });
            await this.gamerepo.save(gameRecord);
            this.logger.log('Game saved to database', { context: 'GameService', gameId });
        } catch (error) {
            this.logger.error('Failed to save game to database', { context: 'GameService', gameId, error });
        }
    }

    private async abortGame(gameId: string, reason: string) {
        const game = this.games.get(gameId);
        if (!game) return;
        if (game.status === GameStatusEnum.FINISHED || game.status === GameStatusEnum.ABORTED) return;

        const wasInProgress = game.status === GameStatusEnum.IN_PROGRESS;
        game.status = GameStatusEnum.ABORTED;
        this.logger.warn('Game aborted', { context: 'GameService', gameId, reason });
        if (wasInProgress) {
            this.metricsService.decrementActiveGames();
        }

        if (this.notifyCallback) {
            const leftSocketId = this.getSocketId(game.playerLeft.userId);
            const rightSocketId = this.getSocketId(game.playerRight.userId);
            const payload = { reason };
            if (leftSocketId) this.notifyCallback(leftSocketId, 'gameAborted', payload);
            if (rightSocketId) this.notifyCallback(rightSocketId, 'gameAborted', payload);
        }

        this.cleanupGameSessions(game);

        if (game.isAiGame) {
            this.aiState.delete(game.id);
            return;
        }

        try {
            const userA = await this.userService.findById(game.playerLeft.userId);
            const userB = await this.userService.findById(game.playerRight.userId);

            if (!userA || !userB) {
                this.logger.error('Could not find users for aborted game', { context: 'GameService', gameId });
                return;
            }

            const gameRecord = this.gamerepo.create({
                mode: game.mode,
                status: GameStatusEnum.ABORTED,
                playerA: userA,
                playerB: userB,
                winner: undefined,
                playerAScore: game.state.score.left,
                playerBScore: game.state.score.right,
            });
            await this.gamerepo.save(gameRecord);
            this.logger.log('Aborted game saved to database', { context: 'GameService', gameId });
        } catch (error) {
            this.logger.error('Failed to save aborted game', { context: 'GameService', gameId, error });
        }
    }

    private async handlePlayerDisconnectFromGame(player: PlayerSessionType) {
        if (!player.currentGameId) return;

        const game = this.games.get(player.currentGameId);
        if (!game) return;
        if (game.status === GameStatusEnum.READY_CHECK) {
            const remainingUserId = game.playerLeft.userId === player.userId
                ? game.playerRight.userId
                : game.playerLeft.userId;

            this.logger.warn('Player disconnected during ready check, aborting game', {
                context: 'GameService',
                gameId: game.id,
                disconnectedUserId: player.userId,
                remainingUserId,
            });

            await this.abortGame(player.currentGameId, 'Opponent disconnected before the game started');
            const remainingPlayer = this.players.get(remainingUserId);
            if (remainingPlayer && remainingPlayer.status === PlayerStatusEnum.IDLE) {
                this.joinQueue(remainingUserId, game.mode);
                this.logger.log('Remaining player re-queued after opponent abandoned ready check', {
                    context: 'GameService',
                    userId: remainingUserId,
                    mode: game.mode,
                });
                if (this.notifyCallback) {
                    const socketId = this.getSocketId(remainingUserId);
                    if (socketId) {
                        this.notifyCallback(socketId, 'queueJoined', { mode: game.mode });
                        this.notifyCallback(socketId, 'opponentAbandonedReadyCheck', {
                            message: 'Your opponent left before the match started. You have been re-queued.',
                        });
                    }
                }
            }
            return;
        }
        const winnerId = game.playerLeft.userId === player.userId
            ? game.playerRight.userId
            : game.playerLeft.userId;

        this.finishGame(player.currentGameId, winnerId);
    }

    createGame(p1Id: string, p2Id: string, mode: GameModeEnum) {
        const gameId = randomUUID();

        const p1 = this.players.get(p1Id);
        const p2 = this.players.get(p2Id);
        if (!p1 || !p2) return;

        p1.status = PlayerStatusEnum.IN_GAME;
        p1.currentGameId = gameId;

        p2.status = PlayerStatusEnum.IN_GAME;
        p2.currentGameId = gameId;

        const newGame = {
            id: gameId,
            mode: mode,
            status: GameStatusEnum.READY_CHECK,
            playerLeft: { userId: p1Id, isReady: false },
            playerRight: { userId: p2Id, isReady: false },
            state: this.getInitialState(),
            config: { maxScore: 10, map: 'classic' }
        };

        this.games.set(gameId, newGame);
        this.logger.log('Game created', { context: 'GameService', gameId, mode, p1Id, p2Id });

        setTimeout(() => {
            const activeGame = this.games.get(gameId);
            if (activeGame && activeGame.status === GameStatusEnum.READY_CHECK) {
                this.logger.warn('Game timed out during ready check', { context: 'GameService', gameId });
                this.abortGame(gameId, 'Ready check timed out');
            }
        }, 30000);
    }

    createAiGame(playerId: string, mode: GameModeEnum, difficulty: 'easy' | 'hard' = 'hard') {
        const player = this.players.get(playerId);
        if (!player) return;
        if (player.status !== PlayerStatusEnum.IDLE) return;

        const gameId = randomUUID();

        player.status = PlayerStatusEnum.IN_GAME;
        player.currentGameId = gameId;

        const newGame: GameSessionType = {
            id: gameId,
            mode: mode,
            status: GameStatusEnum.READY_CHECK,
            playerLeft: { userId: playerId, isReady: false },
            playerRight: { userId: GameService.AI_USER_ID, isReady: true },
            state: this.getInitialState(),
            config: { maxScore: 10, map: 'classic' },
            isAiGame: true,
            aiDifficulty: difficulty,
        };

        this.games.set(gameId, newGame);
        this.logger.log('AI game created', { context: 'GameService', gameId, mode, playerId });

        setTimeout(() => {
            const activeGame = this.games.get(gameId);
            if (activeGame && activeGame.status === GameStatusEnum.READY_CHECK) {
                this.logger.warn('AI game timed out during ready check', { context: 'GameService', gameId });
                this.abortGame(gameId, 'Ready check timed out');
            }
        }, 30000);

        return newGame;
    }

    joinQueue(userId: string, mode: GameModeEnum) {
        const existingPlayer = this.players.get(userId);
        if (!existingPlayer) return;
        if (existingPlayer.status !== PlayerStatusEnum.IDLE) return;

        let specificQueue = this.matchmakingQueues.get(mode);
        if (!specificQueue) {
            specificQueue = [];
            this.matchmakingQueues.set(mode, specificQueue);
        }

        existingPlayer.status = PlayerStatusEnum.IN_QUEUE;
        specificQueue.push(userId);
        this.metricsService.incrementQueueSize();
        this.logger.log('Player joined queue', { context: 'GameService', userId, mode });

        while (specificQueue.length >= 2) {
            const p1Id = specificQueue.shift();
            const p2Id = specificQueue.shift();

            if (p1Id && p2Id) {
                this.metricsService.decrementQueueSize();
                this.metricsService.decrementQueueSize();
                this.createGame(p1Id, p2Id, mode);
                this.logger.log('Players matched', { context: 'GameService', mode, p1Id, p2Id });
            }
        }
    }

    leaveQueue(userId: string) {
        const player = this.players.get(userId);
        if (!player || player.status !== PlayerStatusEnum.IN_QUEUE) return;

        this.matchmakingQueues.forEach((queue, mode) => {
            const index = queue.indexOf(userId);
            if (index !== -1) {
                queue.splice(index, 1);
                this.metricsService.decrementQueueSize();
                this.logger.log('Player left queue', { context: 'GameService', userId, mode });
            }
        });

        player.status = PlayerStatusEnum.IDLE;
    }

    setBroadcastCallback(cb: (gameId: string, game: GameSessionType) => void) {
        this.broadcastCallback = cb;
    }

    getPlayerGame(userId: string): GameSessionType | undefined {
        const player = this.players.get(userId);
        if (!player || !player.currentGameId) return undefined;
        return this.games.get(player.currentGameId);
    }

    getSocketId(userId: string): string | undefined {
        return this.players.get(userId)?.socketId;
    }

    isPlayerActive(userId: string): { active: boolean; status: string } {
        const player = this.players.get(userId);
        if (!player) {
            return { active: false, status: 'IDLE' };
        }
        return { active: true, status: player.status };
    }

    forfeitGame(userId: string) {
        const player = this.players.get(userId);
        if (!player || !player.currentGameId) return;

        const game = this.games.get(player.currentGameId);
        if (!game || game.status !== GameStatusEnum.IN_PROGRESS) return;

        const winnerId = game.playerLeft.userId === userId
            ? game.playerRight.userId
            : game.playerLeft.userId;

        this.logger.log('Player forfeited game', { context: 'GameService', userId, gameId: game.id });
        this.finishGame(game.id, winnerId);
    }

    async getPublicStats(userId: string) {
        const games = await this.gamerepo.find({
            where: [{ playerA: { id: userId } }, { playerB: { id: userId } }],
            relations: ['winner'],
        });

        const total = games.length;
        const wins = games.filter(g => g.winner?.id === userId).length;
        const losses = total - wins;
        const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

        return { total, wins, losses, winRate };
    }

    async getGameHistory(userId: string, page: number = 1, limit: number = 20): Promise<Game[]> {
        return await this.gamerepo.find({
            where: [
                { playerA: { id: userId }, status: GameStatusEnum.FINISHED },
                { playerB: { id: userId }, status: GameStatusEnum.FINISHED },
            ],
            relations: ['playerA', 'playerB', 'winner'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async getGameById(gameId: string): Promise<Game | null> {
        return await this.gamerepo.findOne({
            where: { id: gameId },
            relations: ['playerA', 'playerB', 'winner'],
        });
    }

    async getPlayerStats(userId: string) {
        const games = await this.gamerepo.find({
            where: [{ playerA: { id: userId } }, { playerB: { id: userId } }],
            relations: ['winner'],
        });

        const total = games.length;
        const wins = games.filter(g => g.winner?.id === userId).length;
        const losses = total - wins;
        const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

        const statsByMode = Object.values(GameModeEnum).map(mode => {
            const modeGames = games.filter(g => g.mode === mode);
            const modeWins = modeGames.filter(g => g.winner?.id === userId).length;
            return {
                mode,
                played: modeGames.length,
                wins: modeWins,
                losses: modeGames.length - modeWins,
            };
        });

        return { total, wins, losses, winRate, statsByMode };
    }
}