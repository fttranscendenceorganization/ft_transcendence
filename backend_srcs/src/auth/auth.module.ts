import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { EmailModule } from 'src/email/email.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategies/oauth/google.strategy';
import { GithubStrategy } from './strategies/oauth/github.strategy';
import { Intra42Strategy } from './strategies/oauth/intra42.strategy';
import { MetricsModule } from 'src/metrics/metrics.module';

@Module({
    imports : [
        ConfigModule,
        EmailModule,
        UserModule,
        MetricsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('JWT_ACCESS_SECRET'),
                signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES')},
            }),
        
        }),
    ],
    controllers : [AuthController],
    providers : [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy, GoogleStrategy, GithubStrategy, Intra42Strategy],
    exports : [],
})

export class AuthModule {};