import { IsIn, IsString, IsUUID } from "class-validator";

export class PlayerInputDto
{
    @IsUUID()
    currentGameId: string

    @IsString()
    @IsIn(['up', 'down', 'stop'])
    input: string


}