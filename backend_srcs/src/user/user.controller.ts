import { Body, Controller, Get, Param, Post, Query, UseGuards, DefaultValuePipe, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')

export class UserController {
    constructor(private readonly UserService: UserService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.UserService.createUser(createUserDto);
        return plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
    }

    @Get()
    async showAllUsers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        const maxLimit = 100;
        const safeLimit = Math.min(limit, maxLimit);
        const { items, total } = await this.UserService.findAll(page, safeLimit);
        return {
            items: plainToInstance(UserResponseDto, items, { excludeExtraneousValues: true }),
            total,
            page,
            limit: safeLimit,
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async showUserById(@Param('id') id: string) {
        const user = await this.UserService.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('by-username')
    async showUserByUsername(@Query('username') username: string) {
        const user = await this.UserService.findByUsername(username);
        if (!user) throw new NotFoundException('User not found');
        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    }
}