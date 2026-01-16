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
import { OauthUserPayload } from './strategies/oauth/dto/oauth-user.payload';


@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) { }

    async validateUser(emailOrusername: string, password: string): Promise<User | null> {
        let user = await this.userService.findByEmail(emailOrusername.toLowerCase().trim());
        if (!user) {
            user = await this.userService.findByUsername(emailOrusername.toLowerCase().trim())
            if (!user)
                return null;
        }
        
        if (!user.password) {
            return null;
        }
        
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch)
            return null;
        return user;
    }

    async validateUserById(userId: string): Promise<User | null> {
        return await this.userService.findById(userId);
    }

    async generateTokens(id: string, Username: string): Promise<Tokens> {
        const payload: JwtPayload = { sub: id, username: Username }
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

    async login(user: User): Promise<AuthResponseDto> {
        const tokens = await this.generateTokens(user.id, user.username);

        const refreshTokenHashed = await bcrypt.hash(tokens.RefreshToken, 10);
        await this.userService.updateRefreshToken(user.id, refreshTokenHashed);

        const userResponseDto = plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true,
        });


        return {
            user: userResponseDto,
            tokens: {
                AccessToken: tokens.AccessToken,
                RefreshToken: tokens.RefreshToken,
            }
        };
    }

    async ValidateGoogleUser(googleUser: OauthUserPayload): Promise<User> {
        let user = await this.userService.findByGoogleId(googleUser.providerId);
        if (user)
            return user;
        user = await this.userService.findByEmail(googleUser.email);
        if (user) {
            await this.userService.updateGoogleUser(user, googleUser.providerId, googleUser.avatarUrl)
            return user;
        }

        let baseName = this.getUsername(googleUser.email).slice(0, 14);
        let username = baseName;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            const existing = await this.userService.findByUsername(username);
            if (!existing)
                isUnique = true;
            else {
                const suffix = Math.floor(1000 + Math.random() * 9000);
                username = `${baseName}_${suffix}`;
                attempts++;
            }
        }
        if (!isUnique)
            username = `${baseName.slice(0, 10)}_${Date.now().toString().slice(-8)}`;

        const newUser = await this.userService.createGoogleUser({
            providerId: googleUser.providerId,
            email: googleUser.email,
            username: username,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            avatarUrl: googleUser.avatarUrl,
        });

        return newUser;
    }

    async ValidateGithubUser(githubUser: OauthUserPayload): Promise<User> {
        let user = await this.userService.findByGithubId(githubUser.providerId);
        if (user)
            return user;
        user = await this.userService.findByEmail(githubUser.email);
        if (user) {
            await this.userService.updateGithubUser(user, githubUser.providerId, githubUser.avatarUrl)
            return user;
        }

        let baseName = this.getUsername(githubUser.email).slice(0, 14);
        let username = baseName;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            const existing = await this.userService.findByUsername(username);
            if (!existing)
                isUnique = true;
            else {
                const suffix = Math.floor(1000 + Math.random() * 9000);
                username = `${baseName}_${suffix}`;
                attempts++;
            }
        }
        if (!isUnique)
            username = `${baseName.slice(0, 10)}_${Date.now().toString().slice(-8)}`;

        const newUser = await this.userService.createGithubUser({
            githubId: githubUser.providerId,
            email: githubUser.email,
            username: username,
            firstName: githubUser.firstName,
            lastName: githubUser.lastName,
            avatarUrl: githubUser.avatarUrl,
        });

        return newUser;
    }

    async logout(user: User): Promise<void> {
        await this.userService.updateRefreshToken(user.id, null);
    }

    async isRefreshTokenValid(inputRefrshToken, userRefreshTokenHash): Promise<boolean> {
        const isTokenMatch = await bcrypt.compare(inputRefrshToken, userRefreshTokenHash);
        return isTokenMatch;
    }

    private getUsername(email: string): string {
        const prefix = email.split('@')[0];
        return prefix.replace(/[^\w]/g, '');
    }
    
    parseDurationToMs(duration: string | number | undefined): number {
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