import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";
import { Strategy, ExtractJwt  } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtPayload } from "../types/jwtpayload.type";
import { Request } from "express";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refreshjwt")
{
    constructor (
        private readonly authService : AuthService,
        config : ConfigService,
    )
    {
       const secret = config.get('JWT_REFRESH_SECRET');
        super({
                jwtFromRequest: (req : Request) => {
                    const r = req as Request & { cookies?: Record<string, string> };
                    return r.cookies?.refreshToken ?? null;
                },
                ignoreExpiration: false,
                secretOrKey: secret,
                passReqToCallback: true,
            });

    }
    async validate(req: Request, payload: JwtPayload) : Promise<User>            
    {
        const user = await this.authService.validateUserById(payload.sub);
        if (!user)
            throw new UnauthorizedException('User not found');

        const r = req as Request & { cookies?: Record<string, string> };
        const refreshToken = r.cookies?.refreshToken ?? null;

        const isRefreshTokenValid = await this.authService.isRefreshTokenValid(refreshToken, user.refreshTokenHash);
        if (!isRefreshTokenValid)
            throw new UnauthorizedException('Invalid refresh token');

        return user;
    }

}