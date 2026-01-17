import { Controller, Get, HttpCode, HttpStatus, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

type ResponseWithCookie = Response & {
    cookie: (name: string, val: string, options?: Record<string, unknown>) => void;
};



@Controller('auth')

export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly config: ConfigService
    ) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req, @Res({ passthrough: true }) res: ResponseWithCookie): Promise<{ user: UserResponseDto; accessToken: string }>
    {
        const user: User = req.user;

        const authResponseDto: AuthResponseDto = await this.authService.login(user);

        const refreshMaxAgeMs = this.authService.parseDurationToMs(this.config.get('JWT_REFRESH_EXPIRES'));
        res.cookie('refreshToken', authResponseDto.tokens.RefreshToken, {
            httpOnly: true,
            secure: true,
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
    async refresh(@Request() req, @Res({ passthrough: true }) res: ResponseWithCookie): Promise<{ user: UserResponseDto; accessToken: string }>
    {
        const user: User = req.user;

        const authResponseDto: AuthResponseDto = await this.authService.login(user);

        const refreshMaxAgeMs = this.authService.parseDurationToMs(this.config.get('JWT_REFRESH_EXPIRES'));
        res.cookie('refreshToken', authResponseDto.tokens.RefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshMaxAgeMs,
        });

        return {
            user: authResponseDto.user,
            accessToken: authResponseDto.tokens.AccessToken,
        };
    }


    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req)
    {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res({ passthrough: true }) res: ResponseWithCookie)
    {
        const user = req.user;

        const authResponseDto: AuthResponseDto = await this.authService.login(user);

        const refreshMaxAgeMs = this.authService.parseDurationToMs(this.config.get('JWT_REFRESH_EXPIRES'));
        res.cookie('refreshToken', authResponseDto.tokens.RefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshMaxAgeMs,
        });

        const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'https://localhost';
        const callbackUrl = `${frontendUrl.replace(/\/$/, '')}/auth-callback?token=${encodeURIComponent(authResponseDto.tokens.AccessToken)}`;
        return res.redirect(callbackUrl);
    }

    @Get('github')
    @UseGuards(AuthGuard('github'))
    async githubAuth(@Req() req)
    {}

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubAuthRedirect(@Req() req, @Res({ passthrough: true }) res: ResponseWithCookie)
    {
        const user = req.user;

        const authResponseDto: AuthResponseDto = await this.authService.login(user);

        const refreshMaxAgeMs = this.authService.parseDurationToMs(this.config.get('JWT_REFRESH_EXPIRES'));
        res.cookie('refreshToken', authResponseDto.tokens.RefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshMaxAgeMs,
        });

        const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'https://localhost';
        const callbackUrl = `${frontendUrl.replace(/\/$/, '')}/auth-callback?token=${encodeURIComponent(authResponseDto.tokens.AccessToken)}`;
        return res.redirect(callbackUrl);
    }

    @Get('42')
    @UseGuards(AuthGuard('42'))
    async intra42Auth(@Req() req)
    {}

    @Get('42/callback')
    @UseGuards(AuthGuard('42'))
    async intra42AuthRedirect(@Req() req, @Res({ passthrough: true }) res: ResponseWithCookie)
    {
        const user = req.user;

        const authResponseDto: AuthResponseDto = await this.authService.login(user);

        const refreshMaxAgeMs = this.authService.parseDurationToMs(this.config.get('JWT_REFRESH_EXPIRES'));
        res.cookie('refreshToken', authResponseDto.tokens.RefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: refreshMaxAgeMs,
        });

        const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'https://localhost';
        const callbackUrl = `${frontendUrl.replace(/\/$/, '')}/auth-callback?token=${encodeURIComponent(authResponseDto.tokens.AccessToken)}`;
        return res.redirect(callbackUrl);
    }

    @UseGuards(AuthGuard('refreshjwt'))
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@Request() req, @Res({ passthrough: true }) res: ResponseWithCookie)
    {
        const user: User = req.user;

        await this.authService.logout(user);
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 0,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async me(@Request() req): Promise<UserResponseDto>
    {
        const user: User = req.user;

        const userResponseDto = plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true,
        })

        return userResponseDto;
    }

};