import { IsOptional, IsString, IsUrl, MaxLength, MinLength, Matches, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(30)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(30)
    lastName?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers and underscores' })
    username?: string;

    @IsOptional()
    @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
    @ValidateIf((o) => o.avatarUrl !== undefined && o.avatarUrl !== '')
    avatarUrl?: string;
}
