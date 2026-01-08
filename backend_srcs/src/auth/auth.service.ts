import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from './types/jwtpayload.type';
import { Tokens } from './types/tokens.type';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService
{
    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService,
                private readonly config: ConfigService,
    ){}

    async validateUser(emailOrusername: string, password: string ) : Promise<User | null>
    {
        let user = await this.userService.findByEmail(emailOrusername.toLowerCase().trim());
        if (!user)
        {
            user = await this.userService.findByUsername(emailOrusername.toLowerCase().trim())
            if(!user)
                return null;
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch)
            return null;
        return user;
    }

    async validateUserById(userId: string) : Promise<User | null>
    {
        return await this.userService.findById(userId);
    }

    async generateTokens(id:string, Username:string) : Promise<Tokens>
    {
        const payload: JwtPayload = {sub:id, username: Username}
        const accessToken = await this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
                expiresIn: this.config.get('JWT_ACCESS_EXPIRES'),
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
        })

        return {
            AccessToken: accessToken,
            RefreshToken: refreshToken,
        };
    }
    
    async login(user: User) : Promise<AuthResponseDto>
    {
        const tokens  = await this.generateTokens(user.id, user.username);

        const refreshTokenHashed = await bcrypt.hash(tokens.RefreshToken, 10);
        await this.userService.updateRefreshToken(user.id, refreshTokenHashed);

        const  userResponseDto = plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues : true,
        });

        
        return {
            user: userResponseDto,
            tokens: {
                AccessToken: tokens.AccessToken,
                RefreshToken: tokens.RefreshToken, 
            }
        };  
    }

    async isRefreshTokenValid(inputRefrshToken, userRefreshTokenHash): Promise <boolean>
    {
        const isTokenMatch = await bcrypt.compare(inputRefrshToken, userRefreshTokenHash);
        return isTokenMatch;
    }

    parseDurationToMs(duration: string | number | undefined): number
    {
        if (typeof duration === 'number')
            return duration;

        if (!duration)
            throw new Error('JWT_REFRESH_EXPIRES is not defined');

        const trimmed = duration.trim().toLowerCase();
        const directNumber = Number(trimmed);
        if (!Number.isNaN(directNumber))
            return directNumber;

        const match = trimmed.match(/^(\d+)([smhd])$/);
        if (!match)
            throw new Error('JWT_REFRESH_EXPIRES must be milliseconds or a duration like 15m/7d');

        const [, value, unit] = match;
        const amount = Number(value);
        const unitMs: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

        return amount * unitMs[unit];
    }
}