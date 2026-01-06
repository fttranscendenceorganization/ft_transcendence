import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../types/jwtpayload";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy)
{
    constructor(private readonly authService: AuthService)
    {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as any,
        });
    }

    async validate(payload: JwtPayload) : Promise<User>
    {
        const user = await this.authService.validateUserById(payload.sub);
        if (!user)
            throw new UnauthorizedException('User not found');
        return user;
    }
}