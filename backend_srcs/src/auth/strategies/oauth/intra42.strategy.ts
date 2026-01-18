import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-42";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class Intra42Strategy extends (PassportStrategy(Strategy, '42') as any)
{

    constructor(private readonly authService: AuthService,
        config: ConfigService) {
        const Id = config.get('INTRA_42_CLIENT_ID');
        const Secret = config.get('INTRA_42_CLIENT_SECRET');
        const Url = config.get('INTRA_42_CALL_BACK_URL');
        super({
            clientID: Id,
            clientSecret: Secret,
            callbackURL: Url,
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: any)
    {
        const email = profile.emails?.[0]?.value || profile.email;
        if (!email)
            return done(new BadRequestException('No email provided from 42'), false);

        let avatarUrl = null;
        if (profile.image?.versions?.medium)
            avatarUrl = profile.image.versions.medium;
        else if (profile.image?.link)
            avatarUrl = profile.image.link;
        else if (profile._json?.image?.versions?.medium)
            avatarUrl = profile._json.image.versions.medium;
        else if (profile._json?.image?.link)
            avatarUrl = profile._json.image.link;

        const intra42Data = {
            providerId: profile.id,
            email: email,
            firstName: profile.first_name || profile.name?.givenName || profile.displayName || email.split('@')[0].slice(0, 30),
            lastName: profile.last_name || profile.name?.familyName || '',
            avatarUrl: avatarUrl,
        };

        const user = await this.authService.ValidateIntra42User(intra42Data)
        if (!user)
            return done(new UnauthorizedException(), false);
        return done(null, user);
    }
}