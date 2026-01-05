import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')

export class UserController
{
    constructor(private readonly UserService:UserService){}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) : Promise <UserResponseDto>
    {
        const user = await this.UserService.createUser(createUserDto);
        return plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues : true,
        });
    }

    @Get()
    async cshowallusers()
    {
        const user = await this.UserService.findAll();
        return plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues : true,
        });
    }
    @Get()
    async showUserById(@Query('id') id: string)
    {
        try 
        {
            const user = await this.UserService.findById(id);
            return user;
        }
        catch (error)
        {
            return error.message;
        }
        
    }

    @Get()
    async showUserByUsername(@Query('username') username: string)
    {
        try 
        {
            const user = await this.UserService.findByUsername(username);
            return user;
        }
        catch (error)
        {
            return error.message;
        }
    }

   
}