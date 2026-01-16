import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-github2";
import { AuthService } from "src/auth/auth.service";

@Injectable()

export class GithubStrategy extends PassportStrategy(Strategy)
{
     constructor(    private readonly authService:AuthService,
                        config:ConfigService)
        {
            const Id = config.get('GITHUB_CLIENT_ID');
            const Secret = config.get('GITHUB_CLIENT_SECRET');
            const Url = config.get('GITHUB_CALL_BACK_URL')
            super({
                clientID: Id ,
                clientSecret: Secret,
                callbackURL: Url,
                scope:['user:email'],
            })
        }

    async validate(accessToken: string, refrshToken: string, profile: Profile, done: any) {
        const email = profile.emails?.[0]?.value;
        if (!email)
            return done(new BadRequestException('No email provided from GitHub'), false);

        const githubData = {
            providerId: profile.id,
            email: email,
            firstName: profile.username ?? email.split('@')[0].slice(0, 30),
            lastName: '',
            avatarUrl: profile.photos?.[0]?.value ?? null,
        };

        const user = await this.authService.ValidateGithubUser(githubData as any);
        if (!user)
            return done(new UnauthorizedException(), false);
        return done(null, user);
    }
}