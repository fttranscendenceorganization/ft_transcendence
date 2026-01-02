import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
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
            select : ['id', 'email', 'username', 'firstname', 'lastname', 'isActive', 'losses', 'wins', 'password'],
        });
    }

    async findByUsername(username: string): Promise <User | null>
    {
        return await this.userrepo.findOne({ 
            where : {username , isActive: true},
            select : ['id'],
        });
    }

    async findById(id: string) : Promise<User | null>
    {
        return await this.userrepo.findOne({
            where : {id, isActive : true},
            select : ['id'],
        });
    }

    async findByEmail(email: string) : Promise<User | null>
    {
        return await this.userrepo.findOne({
            where : {email, isActive : true},
            select : ['id'],
        });
    }


    async createUser(createUserDto: CreateUserDto)
    {
       
        const existusername = await this.findByUsername(createUserDto.username);
        if (existusername)
            throw new ConflictException(`Username ${createUserDto.username} already exists`);

        const existemail = await this.findByEmail(createUserDto.email);
        if (existemail)
            throw new ConflictException(`Email ${createUserDto.email} already exists`);
        
        const user =  this.userrepo.create(createUserDto);
        return  this.userrepo.save(user);
    }

};