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

@Injectable()
export class GameService implements OnModuleDestroy {
    constructor(
        @InjectRepository(Game)
        private readonly gamerepo: Repository<Game>,
        private readonly userService: UserService,
    ) {
        this.physicsInterval = setInterval(() => {
            this.handleGamesUpdate();
        }, 16);
    }

    private readonly players = new Map<string, PlayerSessionType>();
    private readonly games = new Map<string, GameSessionType>();
    private readonly matchmakingQueues = new Map<GameModeEnum, string[]>();

    private broadcastCallback: ((gameId: string, state: GameSessionType) => void) | null = null;
    private physicsInterval: NodeJS.Timeout;
    private notifyCallback: ((socketId: string, event: string, data: any) => void) | null = null;

    registerPlayer(userId: string, socketId: string) {
        const existingPlayer = this.players.get(userId);

        if (existingPlayer) {
            existingPlayer.socketId = socketId;
            existingPlayer.lastSeenAt = new Date();
        }
        else {
            const newPlayer: PlayerSessionType = {
                userId: userId,
                socketId: socketId,
                status: PlayerStatusEnum.IDLE,
                currentGameId: null,
                lastSeenAt: new Date()
            }
            this.players.set(userId, newPlayer);
        }
    }


    unregisterPlayer(userId: string) {
        const existingPlayer = this.players.get(userId);

        if (!existingPlayer)
            return;

        console.log(`[GameService] Player ${userId} disconnected. Last status: ${existingPlayer.status}`);

        switch (existingPlayer.status) {
            case PlayerStatusEnum.IDLE:
                this.players.delete(userId);
                break;

            case PlayerStatusEnum.IN_QUEUE:
                this.matchmakingQueues.forEach((queue, mode) => {
                    const index = queue.indexOf(userId);
                    if (index !== -1) {
                        queue.splice(index, 1);
                        console.log(`Removed ${userId} from ${mode} queue because of disconnect`);
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
            ballSpeed: 10,
            paddleLeft: { x: 50, y: 300 },
            paddleRight: { x: 950, y: 300 },
            score: { left: 0, right: 0 },
            ballRadius: 25,
            paddleRadius: 45,
            elapsedTimeSeconds: 0
        };
    }


    private handleGamesUpdate() {
        for (const [gameId, game] of this.games) {
            if (game.status === GameStatusEnum.IN_PROGRESS) {
                this.updateGamePhysics(game);
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
        console.log(`[Game] Player ${userId} is ready.`);

        if (game.playerRight.isReady && game.playerLeft.isReady) {
            game.status = GameStatusEnum.IN_PROGRESS;
            console.log(`[Game] Both players ready! Game ${game.id} is starting...`);
        }

    }

    private updateGamePhysics(game: GameSessionType) {
        game.state.elapsedTimeSeconds += 16 / 1000;

        const { ballPosition, ballVelocity, score } = game.state;
        const { ballSpeed, ballRadius, paddleLeft, paddleRight, paddleRadius } = game.state;

        ballPosition.x += ballVelocity.x;
        ballPosition.y += ballVelocity.y;

        if (ballPosition.y <= ballRadius) {
            ballVelocity.y *= -1;
            ballPosition.y = ballRadius;
        }
        else if (ballPosition.y >= 600 - ballRadius) {
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
        }
        else if (ballPosition.x >= 1000 - ballRadius) {
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

        const currentSpeed = Math.sqrt(
            ballVelocity.x * ballVelocity.x +
            ballVelocity.y * ballVelocity.y
        );
        const MIN_BALL_SPEED = 8;
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

        paddle.x = valX;
        paddle.y = valY;
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

    private cleanupGameSessions(game: GameSessionType) {
        const leftPlayer = this.players.get(game.playerLeft.userId);
        if (leftPlayer) {
            leftPlayer.status = PlayerStatusEnum.IDLE;
            leftPlayer.currentGameId = null;
        }

        const rightPlayer = this.players.get(game.playerRight.userId);
        if (rightPlayer) {
            rightPlayer.status = PlayerStatusEnum.IDLE;
            rightPlayer.currentGameId = null;
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
        if (!game)
            return;

        if (game.status === GameStatusEnum.FINISHED || game.status === GameStatusEnum.ABORTED)
            return;

        game.status = GameStatusEnum.FINISHED;
        console.log(`[Game] Game ${game.id} finished. Winner: ${winnerUserId ?? 'none'}. Final score: ${game.state.score.left} - ${game.state.score.right}`);

        if (this.notifyCallback) {
            const leftSocketId = this.getSocketId(game.playerLeft.userId);
            const rightSocketId = this.getSocketId(game.playerRight.userId);

            const payload = {
                winnerId: winnerUserId,
                score: {
                    left: game.state.score.left,
                    right: game.state.score.right
                }
            };

            if (leftSocketId)
                this.notifyCallback(leftSocketId, 'gameOver', payload);
            if (rightSocketId)
                this.notifyCallback(rightSocketId, 'gameOver', payload);
        }

        this.cleanupGameSessions(game);

        try {
            const userA = await this.userService.findById(game.playerLeft.userId);
            const userB = await this.userService.findById(game.playerRight.userId);

            if (!userA || !userB) {
                console.error(`[Game] Could not find users for game ${game.id}. Skipping persistence.`);
                return;
            }

            const winnerUser = winnerUserId === game.playerLeft.userId ? userA : userB;

            const gameRecord = this.gamerepo.create({
                mode: game.mode,
                status: GameStatusEnum.FINISHED,
                playerA: userA,
                playerB: userB,
                winner: winnerUser,
                playerAScore: game.state.score.left,
                playerBScore: game.state.score.right,
            });
            await this.gamerepo.save(gameRecord);
            console.log(`[Game] Game ${game.id} saved to database.`);

            try {
                const leftScore = game.state.score.left;
                const rightScore = game.state.score.right;
                const winnerIdStr = winnerUserId ?? '';
                const loserUser = winnerUserId === game.playerLeft.userId ? userB : userA;
                const loserIdStr = loserUser.id;
                const winnerScore = winnerUserId === game.playerLeft.userId ? leftScore : rightScore;
                const loserScore = winnerUserId === game.playerLeft.userId ? rightScore : leftScore;

                await this.userService.updateUserAfterGame(
                    winnerIdStr,
                    loserIdStr,
                    winnerScore,
                    loserScore,
                    game.mode,
                );
            }
            catch (err) {
                console.error(`[Game] Failed to update user stats for game ${game.id}:`, err);
            }
        }
        catch (error) {
            console.error(`[Game] Failed to save game ${game.id} to database:`, error);
        }
    }

    private async abortGame(gameId: string, reason: string) {
        const game = this.games.get(gameId);
        if (!game)
            return;

        if (game.status === GameStatusEnum.FINISHED || game.status === GameStatusEnum.ABORTED)
            return;

        game.status = GameStatusEnum.ABORTED;
        console.log(`[Game] Game ${game.id} aborted. Reason: ${reason}`);

        if (this.notifyCallback) {
            const leftSocketId = this.getSocketId(game.playerLeft.userId);
            const rightSocketId = this.getSocketId(game.playerRight.userId);
            const payload = { reason };
            if (leftSocketId) this.notifyCallback(leftSocketId, 'gameAborted', payload);
            if (rightSocketId) this.notifyCallback(rightSocketId, 'gameAborted', payload);
        }

        this.cleanupGameSessions(game);

        try {
            const userA = await this.userService.findById(game.playerLeft.userId);
            const userB = await this.userService.findById(game.playerRight.userId);

            if (!userA || !userB) {
                console.error(`[Game] Could not find users for aborted game ${game.id}. Skipping persistence.`);
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

            console.log(`[Game] Aborted game ${game.id} saved to database.`);
        }
        catch (error) {
            console.error(`[Game] Failed to save aborted game ${game.id}:`, error);
        }
    }

    private async handlePlayerDisconnectFromGame(player: PlayerSessionType) {
        if (!player.currentGameId)
            return;

        try {
            const user = await this.userService.findById(player.userId);
            const displayName = user?.username ?? player.userId;
            this.abortGame(player.currentGameId, `Player ${displayName} disconnected`);
        } catch {
            this.abortGame(player.currentGameId, `A player disconnected`);
        }
    }


    createGame(p1Id: string, p2Id: string, mode: GameModeEnum) {
        const gameId = randomUUID();

        const p1 = this.players.get(p1Id);
        const p2 = this.players.get(p2Id);
        if (!p1 || !p2)
            return;

        p1.status = PlayerStatusEnum.IN_GAME;
        p1.currentGameId = gameId;

        p2.status = PlayerStatusEnum.IN_GAME;
        p2.currentGameId = gameId;

        const newGame = {
            id: gameId,
            mode: mode,
            status: GameStatusEnum.READY_CHECK,
            playerLeft: {
                userId: p1Id,
                isReady: false
            },
            playerRight: {
                userId: p2Id,
                isReady: false
            },
            state: this.getInitialState(),
            config:
            {
                maxScore: 10,
                map: 'classic'
            }

        };
        this.games.set(gameId, newGame);
        setTimeout(() => {
            const activeGame = this.games.get(gameId);
            if (activeGame && activeGame.status === GameStatusEnum.READY_CHECK) {
                console.log(`[Game] Game ${gameId} timed out during READY_CHECK.`);
                this.abortGame(gameId, 'Ready check timed out');
            }
        }, 30000);

        console.log(`Game ${gameId} created for ${mode} mode.`);
    }

    joinQueue(userId: string, mode: GameModeEnum) {
        const existingPlayer = this.players.get(userId);
        if (!existingPlayer)
            return;


        if (existingPlayer.status !== PlayerStatusEnum.IDLE)
            return;

        let specificQueue = this.matchmakingQueues.get(mode);
        if (!specificQueue) {
            specificQueue = [];
            this.matchmakingQueues.set(mode, specificQueue);
        }

        existingPlayer.status = PlayerStatusEnum.IN_QUEUE;
        specificQueue.push(userId);

        while (specificQueue.length >= 2) {
            const p1Id = specificQueue.shift();
            const p2Id = specificQueue.shift();

            if (p1Id && p2Id) {
                this.createGame(p1Id, p2Id, mode);
                console.log(`Matched ${mode}: ${p1Id} vs ${p2Id}`);
            }
        }
    }

    leaveQueue(userId: string) {
        const player = this.players.get(userId);
        if (!player || player.status !== PlayerStatusEnum.IN_QUEUE)
            return;

        this.matchmakingQueues.forEach((queue, mode) => {
            const index = queue.indexOf(userId);
            if (index !== -1) {
                queue.splice(index, 1);
                console.log(`[Game] Player ${userId} left ${mode} queue.`);
            }
        });

        player.status = PlayerStatusEnum.IDLE;
    }



    setBroadcastCallback(cb: (gameId: string, game: GameSessionType) => void) {
        this.broadcastCallback = cb;
    }

    getPlayerGame(userId: string): GameSessionType | undefined {
        const player = this.players.get(userId);
        if (!player || !player.currentGameId)
            return undefined;
        return this.games.get(player.currentGameId);
    }


    getSocketId(userId: string): string | undefined {
        return this.players.get(userId)?.socketId;
    }

    forfeitGame(userId: string) {
        const player = this.players.get(userId);
        if (!player || !player.currentGameId)
            return;

        const game = this.games.get(player.currentGameId);
        if (!game || game.status !== GameStatusEnum.IN_PROGRESS)
            return;

        const winnerId = game.playerLeft.userId === userId
            ? game.playerRight.userId
            : game.playerLeft.userId;

        this.finishGame(game.id, winnerId);
    }


    async getPublicStats(userId: string) {
        const games = await this.gamerepo.find({
            where: [
                { playerA: { id: userId } },
                { playerB: { id: userId } },
            ],
            relations: ['winner'],
        });

        const total = games.length;
        const wins = games.filter(g => g.winner?.id === userId).length;
        const losses = total - wins;
        const winRate = total === 0 ? 0 : Math.round((wins / total) * 100);

        return { total, wins, losses, winRate };
    }
    async getGameHistory(userId: string): Promise<Game[]> {
        return await this.gamerepo.find({
            where: [
                { playerA: { id: userId } },
                { playerB: { id: userId } },
            ],
            relations: ['playerA', 'playerB', 'winner'],
            order: { createdAt: 'DESC' },
            take: 50,
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
            where: [
                { playerA: { id: userId } },
                { playerB: { id: userId } },
            ],
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