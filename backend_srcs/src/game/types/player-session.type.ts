import { PlayerStatusEnum } from "./player-status.enum";

export interface PlayerSessionType
{
    userId: string,
    socketId: string,
    status: PlayerStatusEnum;
    currentGameId: string | null,
    lastSeenAt: Date
}