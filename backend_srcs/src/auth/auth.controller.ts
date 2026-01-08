import { Body, Controller , Get, Post, Req, Request, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';

type ResponseWithCookie = Response & {
    cookie: (name: string, val: string, options?: Record<string, unknown>) => void;
};
import { ConfigService } from '@nestjs/config';

@Controller('auth')

export class AuthController
{
    constructor(private readonly authService: AuthService,
                private readonly config: ConfigService
    ){}
    
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req, @Res({passthrough : true}) res: ResponseWithCookie) : Promise<{user: UserResponseDto; accessToken: string }>
    {
        const user: User = req.user;

        const authResponseDto: AuthResponseDto = await this.authService.login(user);

        const refreshMaxAgeMs = this.authService.parseDurationToMs(this.config.get('JWT_REFRESH_EXPIRES'));
        res.cookie('refreshToken', authResponseDto.tokens.RefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshMaxAgeMs,
        });

        return {
            user: authResponseDto.user,
            accessToken: authResponseDto.tokens.AccessToken,
        };
    }

    @UseGuards(AuthGuard('refreshjwt'))
    @Post('refresh')
    async refresh(@Request() req, @Res({ passthrough: true }) res: ResponseWithCookie) : Promise<{user: UserResponseDto; accessToken: string }>
    {
        const user: User = req.user;
        
        const authResponseDto: AuthResponseDto = await this.authService.login(user);

        const refreshMaxAgeMs = this.authService.parseDurationToMs(this.config.get('JWT_REFRESH_EXPIRES'));
        res.cookie('refreshToken', authResponseDto.tokens.RefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: refreshMaxAgeMs,
        });
        
        return {
            user: authResponseDto.user,
            accessToken: authResponseDto.tokens.AccessToken,
        };
    }


    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async me(@Request() req) : Promise<UserResponseDto>
    {
        const user: User = req.user;

        const userResponseDto = plainToInstance(UserResponseDto, user,{
            excludeExtraneousValues : true,
        })

        return userResponseDto;
    }

};