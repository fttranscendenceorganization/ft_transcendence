import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userrepo: Repository<User>) { }

    async findAll(): Promise<User[]> {
        return this.userrepo.find({
            where: { isActive: true },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userrepo.findOne({
            where: { username, isActive: true },
        });
    }

    async findById(id: string): Promise<User | null> {
        return await this.userrepo.findOne({
            where: { id, isActive: true },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userrepo.findOne({
            where: { email, isActive: true },
        });
    }

    async findByGoogleId(googleId: string): Promise<User | null> {
        return await this.userrepo.findOne({
            where: { googleId, isActive: true },
        });
    }

    async findByGithubId(githubId: string): Promise<User | null> {
        return await this.userrepo.findOne({
            where: { githubId, isActive: true },
        });
    }

    async updateGoogleUser(user: User, googleId: string, avatarUrl: string | null) {
        user.googleId = googleId;
        user.avatarUrl = avatarUrl;
        await this.userrepo.save(user);
    }

    async updateGithubUser(user: User, githubId: string, avatarUrl: string | null) {
        user.githubId = githubId;
        user.avatarUrl = avatarUrl;
        await this.userrepo.save(user);
    }

    async updateRefreshToken(userId: string, refreshTokenHashed: string | null) {
        const user = await this.findById(userId);
        if (!user)
            throw new NotFoundException(`User with ID ${userId} not found`);
        user.refreshTokenHash = refreshTokenHashed;
        await this.userrepo.save(user);
    }

    async createGoogleUser(data: {
        providerId: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    }): Promise<User> {
       
        const user = this.userrepo.create(data);
        try {
            return await this.userrepo.save(user);
        } catch (error) {
            throw new InternalServerErrorException('Failed to create user account');
        }
    }

    async createGithubUser(data: {
        githubId: string;
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    }): Promise<User> {
        const user = this.userrepo.create(data);
        try {
            return await this.userrepo.save(user);
        } catch (error) {
            throw new InternalServerErrorException('Failed to create user account');
        }
    }

    async createUser(createUserDto: CreateUserDto) {
        const existusername = await this.findByUsername(createUserDto.username.toLowerCase().trim());
        if (existusername)
            throw new ConflictException(`Username ${createUserDto.username} already exists`);

        const existemail = await this.findByEmail(createUserDto.email.toLowerCase().trim());
        if (existemail)
            throw new ConflictException(`Email ${createUserDto.email} already exists`);

        const user = this.userrepo.create(createUserDto);

        try {
            return await this.userrepo.save(user);
        }
        catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Username or email already exists');
            }
            throw error;
        }
    }
};