import { IsEmail, IsOptional, IsString } from "class-validator";

export class GoogleUserPayload
{
    @IsString()
    googleId:string;

    @IsEmail()
    email:string;

    @IsString()
    firstName:string;

    @IsString()
    lastName:string;

    @IsString()
    @IsOptional()
    avatarUrl:string | null;
}