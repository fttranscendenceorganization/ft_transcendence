import { IsEnum } from "class-validator";
import { GameModeEnum } from "../types/game-mode.enum";

export class JoinQueueDto
{
    @IsEnum(GameModeEnum)
    mode: GameModeEnum
}