import { Body, Controller , Get, Post, Req, Request, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';

@Controller('auth')

export class AuthController
{
    constructor(private readonly authService: AuthService){}
    
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) 
    {
        const user: User = req.user;
        return await this.authService.login(user);
    } 

};