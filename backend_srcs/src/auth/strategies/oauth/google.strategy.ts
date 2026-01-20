import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "src/auth/auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy)
{
    constructor(    private readonly authService:AuthService,
                    config:ConfigService)
    {
        const Id = config.get('GOOGLE_CLIENT_ID');
        const Secret = config.get('GOOGLE_CLIENT_SECRET');
        const Url = config.get('GOOGLE_CALL_BACK_URL')
        super({
            clientID: Id ,
            clientSecret: Secret,
            callbackURL: Url,
            scope:['email', 'profile'],
        })
    }

    authenticate(req: any, options?: any) {
        options = options || {};
        options.prompt = 'select_account';
        options.accessType = 'offline';
        super.authenticate(req, options);
    }


    async validate(accessToken:string, refrshToken:string, profile:Profile, done:VerifyCallback) 
    {
        const email = profile.emails?.[0]?.value;
        if (!email)
            return done(new BadRequestException('No email provided from Google'), false);

        const googleData = {
            providerId: profile.id,
            email: email,
            firstName: profile.name?.givenName ?? email.split('@')[0].slice(0, 30),
            lastName: profile.name?.familyName ?? '',
            avatarUrl: profile.photos?.[0]?.value ?? null,
        };
        const user = await this.authService.ValidateGoogleUser(googleData)
        if (!user)
            return done(new UnauthorizedException(), false);
        return done(null, user);
    }

}