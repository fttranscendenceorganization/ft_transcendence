import { GameModeEnum } from "./game-mode.enum";
import { GameStateType } from "./game-state.type";
import { GameStatusEnum } from "./game-status.enum";

export interface GameSessionType
{
    id: string,
    mode: GameModeEnum,
    status: GameStatusEnum,
    playerLeft: {userId: string, isReady: boolean},
    playerRight: {userId: string, isReady: boolean},
    state: GameStateType,
    config: {maxScore: number, map: string},
    isAiGame?: boolean,
    aiDifficulty?: 'easy' | 'hard'
}