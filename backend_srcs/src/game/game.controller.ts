import {
    Controller,
    Get,
    Param,
    UseGuards,
    NotFoundException,
    Logger
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/get-usr.decorator';
import { GameService } from './game.service';

@Controller('game')
@UseGuards(AuthGuard('jwt'))
export class GameController {
    private readonly logger = new Logger(GameController.name);

    constructor(private readonly gameService: GameService) { }

    @Get('history')
    async getGameHistory(@CurrentUser('id') userId: string) {
        try {
            const games = await this.gameService.getGameHistory(userId);
            return games.map(game => {
                const iAmPlayerA = game.playerA.id === userId;
                const opponent = iAmPlayerA ? game.playerB : game.playerA;
                const myScore = iAmPlayerA ? game.playerAScore : game.playerBScore;
                const oppScore = iAmPlayerA ? game.playerBScore : game.playerAScore;
                const result = game.winner?.id === userId ? 'WIN' : 'LOSS';
                const xpEarned = result === 'WIN'
                    ? 20 + (myScore - oppScore) * 5
                    : Math.floor(oppScore * 0.5);

                return {
                    id: game.id,
                    createdAt: game.createdAt,
                    mode: game.mode,
                    result,
                    myScore,
                    opponentScore: oppScore,
                    opponentType: 'PLAYER',
                    opponentName: opponent.username,
                    opponentAvatarUrl: opponent.avatarUrl ?? null,
                    xpEarned,
                };
            });
        } catch (error) {
            this.logger.error(`Error in getGameHistory: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('stats')
    async getPlayerStats(@CurrentUser('id') userId: string) {
        try {
            return await this.gameService.getPlayerStats(userId);
        } catch (error) {
            this.logger.error(`Error in getPlayerStats: ${error.message}`, error.stack);
            throw error;
        }
    }

    @Get('stats/:userId')
    async getPublicPlayerStats(@Param('userId') userId: string) {
        try {
            return await this.gameService.getPublicStats(userId);
        } catch (error) {
            this.logger.error(`Error in getPublicPlayerStats: ${error.message}`, error.stack);
            throw error;
        }
    }
    @Get(':id')
    async getGameById(
        @CurrentUser('id') userId: string,
        @Param('id') gameId: string
    ) {
        try {
            const game = await this.gameService.getGameById(gameId);

            if (!game)
                throw new NotFoundException(`Game ${gameId} not found`);

            if (game.playerA.id !== userId && game.playerB.id !== userId)
                throw new NotFoundException(`Game ${gameId} not found`);

            return {
                id: game.id,
                mode: game.mode,
                status: game.status,
                playerA: { id: game.playerA.id, username: game.playerA.username },
                playerB: { id: game.playerB.id, username: game.playerB.username },
                winner: game.winner ? { id: game.winner.id, username: game.winner.username } : null,
                playerAScore: game.playerAScore,
                playerBScore: game.playerBScore,
                createdAt: game.createdAt,
            };
        } catch (error) {
            this.logger.error(`Error in getGameById: ${error.message}`, error.stack);
            throw error;
        }
    }
}