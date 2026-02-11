import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateDmDto {

    @IsNotEmpty()
    @IsUUID()
    recipientId: string;
}