import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')

export class UserController
{
    constructor(private readonly UserService:UserService){}

    @Post()
    createUser(@Body() createUserDto: CreateUserDto)
    {
        return this.UserService.createUser(createUserDto);
    }

    @Get()
    showalluser()
    {
        return this.UserService.findAll();
    }



    @Post()
    showUsers(@Query('id') id: string)
    {
        return this.UserService.findById(id);
    }
};