import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateUserDto
{

    @IsString()
    @MinLength(1)
    @MaxLength(30)
    firstName: string;
    
    @IsString()
    @MinLength(1)
    @MaxLength(30)
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/)
    username: string;

    @IsString()
    @MinLength(8)
    @MaxLength(64)
    @Matches(/(?=.*[A-Z])/)
    @Matches(/(?=.*\d)/)
    @Matches(/(?=.*[!@#$%^&*])/)
    password: string;

}