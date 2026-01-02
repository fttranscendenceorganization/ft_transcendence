import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService
{
    constructor(
        @InjectRepository(User)
        private readonly userrepo: Repository<User>){}
    
    async findAll() : Promise<User[]>
    {
        return this.userrepo.find({
            where : {isActive : true },
            select : ['id', 'username', 'firstname', 'lastname' ,'email'],
        });
    }

    async findById(id: string) : Promise<User | null>
    {
        const user = this.userrepo.findOne({
            where : {id, isActive : true},
            select : ['id', 'username', 'firstname', 'lastname' ,'email'],
        });

        if (!user)
            throw new NotFoundException('User with id ${id} not found');
        return user;
    }

    async createUser(createUserDto: CreateUserDto)
    {
        const user = await this.userrepo.create(createUserDto);
        return await this.userrepo.save(user);
    }

};