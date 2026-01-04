import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('users')

export class UserController
{
    constructor(private readonly UserService:UserService){}

    @Post()
    createUser(@Body() createUserDto: CreateUserDto)
    {
        return this.UserService.createUser(createUserDto);
    }

    @Get()
    showallusers()
    {
        return this.UserService.findAll();
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