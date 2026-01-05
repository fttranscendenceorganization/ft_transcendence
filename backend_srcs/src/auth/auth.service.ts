import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from 'src/user/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';


@Injectable()
export class AuthService
{
    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService,
    ){}

    async validateUser(emailOrusername: string, password: string ) : Promise<User | null>
    {
        let user = await this.userService.findByEmail(emailOrusername.toLowerCase().trim());
        if (!user)
        {
            user = await this.userService.findByUsername(emailOrusername.toLowerCase().trim())
            if(!user)
                return null;
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch)
            return null;
        return user;
    }

    async login(user: User) : Promise<AuthResponseDto>
    {
        const payload = {sub: user.id, username: user.username};
        const accessToken = this.jwtService.sign(payload);

        const  userResponseDto = plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues : true,
        });

        return {
            user: userResponseDto,
            accessToken: accessToken,
        }
    }
}