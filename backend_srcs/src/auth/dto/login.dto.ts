import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto
{
    @IsString()
    @IsNotEmpty()
    emailOrusername: string;

    @IsString()
    @IsNotEmpty()
    password: string;

};