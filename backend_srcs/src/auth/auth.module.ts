import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports : [
            TypeOrmModule.forFeature([User]),
            JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions:{
                    expiresIn: process.env.JWT_EXPIRES_IN as any,
                }
            })],
    controllers : [AuthController],
    providers : [AuthService, UserService, LocalStrategy, JwtStrategy],
    exports : [],
})

export class AuthModule {};