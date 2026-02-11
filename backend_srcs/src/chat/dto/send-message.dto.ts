import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class SendMessageDto {

    @IsNotEmpty()
    @IsUUID()
    conversationId: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}
