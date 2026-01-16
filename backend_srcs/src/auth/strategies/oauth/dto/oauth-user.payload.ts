import { IsEmail, IsOptional, IsString } from "class-validator";

export class OauthUserPayload
{
    @IsString()
    providerId:string;

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