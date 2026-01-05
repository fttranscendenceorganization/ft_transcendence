import { Injectable, UnauthorizedException} from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { User } from "src/user/entities/user.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
{
    constructor(private readonly authService: AuthService){
        super({
            usernameField : 'emailOrusername',
            passwordField : 'password',
        });
    }

    async validate(emailOrusername: string, password: string): Promise<User> 
    {
        const user = await this.authService.validateUser(emailOrusername, password);
        if (!user)
            throw new UnauthorizedException('Invalid credentials');
        return user;
    }
}