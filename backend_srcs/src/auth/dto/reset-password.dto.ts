import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto
{
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(64)
    @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
    @Matches(/(?=.*[!@#$%^&*])/, { message: 'Password must contain at least one special character (!@#$%^&*)' })
    newPassword: string;
}


