import { Body, Controller, Get, Param, Post, Query, UseGuards, DefaultValuePipe, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { RespondFriendRequestDto } from './dto/respond-friend-request.dto';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from 'src/common/get-usr.decorator';

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
    @Get('blocked')
    async getBlockedUsers(@CurrentUser('id') userId: string)
    {
        const users = await this.UserService.getBlockedUsers(userId);
        return plainToInstance(UserResponseDto, users, { excludeExtraneousValues: true });
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('friends/request')
    async sendFriendRequest(@CurrentUser('id') userId: string, @Body() dto: SendFriendRequestDto)
    {
        const request = await this.UserService.sendFriendRequest(userId, dto.username);
        return {
            id: request.id,
            status: request.status,
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('friends')
    async getFriends(@CurrentUser('id') userId: string)
    {
        const friends = await this.UserService.getFriends(userId);
        return plainToInstance(UserResponseDto, friends, { excludeExtraneousValues: true });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('friends/requests/incoming')
    async getIncomingFriendRequests(@CurrentUser('id') userId: string)
    {
        const requests = await this.UserService.getIncomingFriendRequests(userId);
        return requests.map((req) => ({
            id: req.id,
            status: req.status,
            createdAt: req.createdAt,
            requester: plainToInstance(UserResponseDto, req.requester, { excludeExtraneousValues: true }),
        }));
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('friends/requests/:id/respond')
    async respondToFriendRequest(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: RespondFriendRequestDto,
    ) {
        const request = await this.UserService.respondToFriendRequest(userId, id, dto.action);
        return {
            id: request.id,
            status: request.status,
        };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('by-username')
    async showUserByUsername(@Query('username') username: string) {
        const user = await this.UserService.findByUsername(username);
        if (!user) throw new NotFoundException('User not found');
        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async showUserById(@Param('id') id: string) {
        const user = await this.UserService.findById(id);
        if (!user) throw new NotFoundException('User not found');
        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/block')
    async blockUser(@CurrentUser('id') userId: string, @Param('id') targetId: string)
    {
        await this.UserService.blockUser(userId, targetId);
        return { success: true };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/unblock')
    async unblockUser(@CurrentUser('id') userId: string, @Param('id') targetId: string)
    {
        await this.UserService.unblockUser(userId, targetId);
        return { success: true };
    }
}